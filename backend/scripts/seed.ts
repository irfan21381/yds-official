import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import College from '../models/College';
import Student from '../models/Student';
import Teacher from '../models/Teacher';
import Subject from '../models/Subject';
import Internship from '../models/Internship';
import InternshipApplication from '../models/InternshipApplication';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yds';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await College.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Subject.deleteMany({});
    await Internship.deleteMany({});
    await InternshipApplication.deleteMany({});
    console.log('Existing data cleared');

    // 1. Create SUPER_ADMIN
    console.log('Creating SUPER_ADMIN...');
    const superAdmin = await User.create({
      email: 'admin@yds.com',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'SUPER_ADMIN',
      isVerified: true,
    });
    console.log(`Super Admin created: ${superAdmin.email}`);

    // 2. Create College
    console.log('Creating College...');
    const college = await College.create({
      name: 'YDS Demo College',
      superAdminId: superAdmin._id,
      isActive: true,
    });
    console.log(`College created: ${college.name}`);

    // 3. Create Manager
    console.log('Creating Manager...');
    const manager = await User.create({
      email: 'manager@yds.com',
      password: 'manager123',
      role: 'MANAGER',
      collegeId: college._id,
      isVerified: true,
    });
    console.log(`Manager created: ${manager.email}`);

    // 4. Create Teacher
    console.log('Creating Teacher...');
    const teacher = await User.create({
      email: 'teacher@yds.com',
      password: 'teacher123',
      role: 'TEACHER',
      collegeId: college._id,
      isVerified: true,
    });
    const teacherProfile = await Teacher.create({
      userId: teacher._id,
      collegeId: college._id,
    });
    console.log(`Teacher created: ${teacher.email}`);

    // 5. Create Subjects
    console.log('Creating Subjects...');
    const subject1 = await Subject.create({
      name: 'Computer Science Fundamentals',
      collegeId: college._id,
      teacherIds: [teacher._id],
    });
    const subject2 = await Subject.create({
      name: 'Data Structures and Algorithms',
      collegeId: college._id,
      teacherIds: [teacher._id],
    });
    const publicSubject = await Subject.create({
      name: 'Introduction to Programming',
      // No collegeId - public subject
      teacherIds: [teacher._id],
    });
    console.log(`Subjects created: ${subject1.name}, ${subject2.name}, ${publicSubject.name}`);

    // 6. Create College Students
    console.log('Creating College Students...');
    const student1 = await User.create({
      email: 'student1@yds.com',
      password: 'student123',
      role: 'STUDENT',
      collegeId: college._id,
      isVerified: true,
    });
    await Student.create({
      userId: student1._id,
      collegeId: college._id,
      isPublic: false,
      studentNumber: 'STU001',
      year: 2,
      branch: 'Computer Science',
      enrolledSubjects: [subject1._id, subject2._id],
    });
    console.log(`College Student created: ${student1.email}`);

    const student2 = await User.create({
      email: 'student2@yds.com',
      password: 'student123',
      role: 'STUDENT',
      collegeId: college._id,
      isVerified: true,
    });
    await Student.create({
      userId: student2._id,
      collegeId: college._id,
      isPublic: false,
      studentNumber: 'STU002',
      year: 3,
      branch: 'Computer Science',
      enrolledSubjects: [subject2._id],
    });
    console.log(`College Student created: ${student2.email}`);

    // 7. Create Public/Free Students
    console.log('Creating Public Students...');
    const publicStudent1 = await User.create({
      email: 'public1@yds.com',
      password: 'public123',
      role: 'STUDENT',
      isVerified: true,
    });
    await Student.create({
      userId: publicStudent1._id,
      isPublic: true,
    });
    console.log(`Public Student created: ${publicStudent1.email}`);

    const publicStudent2 = await User.create({
      email: 'public2@yds.com',
      password: 'public123',
      role: 'STUDENT',
      isVerified: true,
    });
    await Student.create({
      userId: publicStudent2._id,
      isPublic: true,
    });
    console.log(`Public Student created: ${publicStudent2.email}`);

    // 8. Create Internships
    console.log('Creating Internships...');
    const internship1 = await Internship.create({
      title: 'Software Development Intern',
      description: 'Join our team as a software development intern and work on cutting-edge projects.',
      company: 'YDS Tech Solutions',
      location: 'Remote',
      duration: '3 months',
      stipend: 15000,
      requirements: [
        'Currently pursuing Computer Science or related degree',
        'Knowledge of JavaScript/TypeScript',
        'Basic understanding of React',
      ],
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      isActive: true,
      collegeId: college._id,
    });
    console.log(`Internship created: ${internship1.title}`);

    const internship2 = await Internship.create({
      title: 'Data Science Intern',
      description: 'Work with our data science team to analyze large datasets and build ML models.',
      company: 'YDS Analytics',
      location: 'Hybrid',
      duration: '6 months',
      stipend: 20000,
      requirements: [
        'Strong background in Mathematics and Statistics',
        'Experience with Python',
        'Knowledge of Machine Learning basics',
      ],
      skills: ['Python', 'Machine Learning', 'Data Analysis', 'Statistics'],
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      isActive: true,
      collegeId: college._id,
    });
    console.log(`Internship created: ${internship2.title}`);

    const publicInternship = await Internship.create({
      title: 'Web Development Intern (Public)',
      description: 'Public internship opportunity for all students interested in web development.',
      company: 'YDS Web Solutions',
      location: 'Remote',
      duration: '3 months',
      stipend: 12000,
      requirements: [
        'Basic HTML, CSS, JavaScript knowledge',
        'Willingness to learn',
      ],
      skills: ['HTML', 'CSS', 'JavaScript', 'Web Development'],
      applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
      isActive: true,
      // No collegeId - public internship
    });
    console.log(`Public Internship created: ${publicInternship.title}`);

    // 9. Create Sample Internship Application
    console.log('Creating Sample Internship Application...');
    await InternshipApplication.create({
      studentId: student1._id,
      internshipId: internship1._id,
      collegeId: college._id,
      status: 'PENDING',
      coverLetter: 'I am very interested in this position and would love to contribute to your team.',
    });
    console.log('Sample application created');

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Super Admin:');
    console.log('  Email: admin@yds.com');
    console.log('  Password: admin123');
    console.log('\nManager:');
    console.log('  Email: manager@yds.com');
    console.log('  Password: manager123');
    console.log('\nTeacher:');
    console.log('  Email: teacher@yds.com');
    console.log('  Password: teacher123');
    console.log('\nCollege Students:');
    console.log('  Email: student1@yds.com / student2@yds.com');
    console.log('  Password: student123');
    console.log('\nPublic Students:');
    console.log('  Email: public1@yds.com / public2@yds.com');
    console.log('  Password: public123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
