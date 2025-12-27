import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  questionText: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface IQuizAttempt extends Document {
  studentId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  collegeId?: mongoose.Types.ObjectId; // Optional for public students
  score: number;
  totalQuestions: number;
  answers: IAnswer[];
  attemptedAt: Date;
}

const AnswerSchema: Schema = new Schema({
  questionText: { type: String, required: true },
  selectedAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const QuizAttemptSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: 'College',
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    answers: [AnswerSchema],
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
export default QuizAttempt;