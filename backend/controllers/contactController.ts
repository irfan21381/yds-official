import { Request, Response, NextFunction } from 'express';
import ContactMessage from '../models/ContactMessage';
import { CustomError } from '../utils/errorHandler';

interface ContactFormBody {
  name: string;
  email: string;
  message: string;
}

export const submitContactForm = async (
  req: Request<unknown, unknown, ContactFormBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      throw new CustomError('Please fill in all fields', 400);
    }

    // Basic email format validation (more robust validation can be added at schema level)
    if (!/.+@.+\..+/.test(email)) {
      throw new CustomError('Please enter a valid email address', 400);
    }

    const newContactMessage = await ContactMessage.create({
      name,
      email,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully!',
      data: newContactMessage,
    });
  } catch (error) {
    next(error);
  }
};
