import { Request, Response, NextFunction } from 'express';
import Employee from '../models/Employee';
import Task from '../models/Task';
import DailyLog from '../models/DailyLog';
import User from '../models/User';
import { CustomError } from '../utils/errorHandler';
import AuditLog from '../models/AuditLog';

interface AuthenticatedUser {
  id: string;
  role: string;
  collegeId?: string;
}

interface AuthenticatedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthenticatedUser;
}

interface GetDailyLogsQuery {
  startDate?: string;
  endDate?: string;
}

// Get Employee Profile
export const getEmployeeProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'EMPLOYEE') {
      throw new CustomError('Only employees can access this', 403);
    }

    const employee = await Employee.findOne({ userId: req.user.id })
      .populate('userId', 'email')
      .populate('tasks')
      .populate('dailyLogs');

    if (!employee) {
      throw new CustomError('Employee profile not found', 404);
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Get Employee Tasks
export const getEmployeeTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'EMPLOYEE') {
      throw new CustomError('Only employees can access tasks', 403);
    }

    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      throw new CustomError('Employee profile not found', 404);
    }

    const tasks = await Task.find({ assignedTo: employee._id })
      .populate('assignedBy', 'email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// Update Task Status
export const updateTaskStatus = async (
  req: AuthenticatedRequest<{ taskId: string }, any, { status: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'EMPLOYEE') {
      throw new CustomError('Only employees can update tasks', 403);
    }

    const { taskId } = req.params;
    const { status } = req.body;

    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      throw new CustomError('Employee profile not found', 404);
    }

    const task = await Task.findById(taskId);
    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    if (task.assignedTo.toString() !== employee._id.toString()) {
      throw new CustomError('Not authorized to update this task', 403);
    }

    task.status = status;
    if (status === 'COMPLETED') {
      task.completedAt = new Date();
    }
    await task.save();

    await AuditLog.create({
      userId: req.user.id,
      action: 'TASK_UPDATED',
      details: { taskId: task._id, status },
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Create Daily Log
export const createDailyLog = async (
  req: AuthenticatedRequest<any, any, { tasksCompleted?: string[]; hoursWorked?: number; notes?: string; date?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'EMPLOYEE') {
      throw new CustomError('Only employees can create daily logs', 403);
    }

    const { tasksCompleted, hoursWorked, notes, date } = req.body;

    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      throw new CustomError('Employee profile not found', 404);
    }

    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0, 0, 0, 0);

    // Check if log already exists for this date
    const existingLog = await DailyLog.findOne({
      employeeId: employee._id,
      date: logDate,
    });

    if (existingLog) {
      throw new CustomError('Daily log already exists for this date', 400);
    }

    const dailyLog = await DailyLog.create({
      employeeId: employee._id,
      date: logDate,
      tasksCompleted: tasksCompleted || [],
      hoursWorked: hoursWorked || 0,
      notes,
    });

    (employee.dailyLogs as any).push(dailyLog._id);
    await employee.save();

    res.status(201).json({
      success: true,
      message: 'Daily log created successfully',
      data: dailyLog,
    });
  } catch (error) {
    next(error);
  }
};

// Get Daily Logs
export const getDailyLogs = async (
  req: AuthenticatedRequest<any, any, any, GetDailyLogsQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'EMPLOYEE') {
      throw new CustomError('Only employees can view daily logs', 403);
    }

    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      throw new CustomError('Employee profile not found', 404);
    }

    const { startDate, endDate } = req.query;
    const query: {
      employeeId: typeof employee._id;
      date?: { $gte: Date; $lte: Date };
    } = { employeeId: employee._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const logs = await DailyLog.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Employee
export const createEmployee = async (
  req: AuthenticatedRequest<any, any, { email: string; employeeId: string; department: string; position: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'MANAGER')) {
      throw new CustomError('Only admins and managers can create employees', 403);
    }

    const { email, employeeId, department, position } = req.body;

    if (!email || !employeeId || !department || !position) {
      throw new CustomError('Email, employee ID, department, and position are required', 400);
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create new user
      user = await User.create({
        email,
        role: 'EMPLOYEE',
        isVerified: true,
      });
    } else {
      // Update existing user to employee
      user.role = 'EMPLOYEE';
      await user.save();
    }

    // Check if employee profile exists
    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
      throw new CustomError('Employee with this ID already exists', 400);
    }

    const employee = await Employee.create({
      userId: user._id,
      employeeId,
      department,
      position,
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'EMPLOYEE_CREATED',
      details: { employeeId: employee._id, email, department },
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Assign Task to Employee
export const assignTask = async (
  req: AuthenticatedRequest<any, any, { employeeId: string; title: string; description?: string; priority?: string; dueDate?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'MANAGER')) {
      throw new CustomError('Only admins and managers can assign tasks', 403);
    }

    const { employeeId, title, description, priority, dueDate } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new CustomError('Employee not found', 404);
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: employee._id,
      assignedBy: req.user.id,
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    (employee.tasks as any).push(task._id);
    await employee.save();

    await AuditLog.create({
      userId: req.user.id,
      action: 'TASK_ASSIGNED',
      details: { taskId: task._id, employeeId: employee._id },
    });

    res.status(201).json({
      success: true,
      message: 'Task assigned successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};
