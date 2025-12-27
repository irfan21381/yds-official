import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string; // Store the correct option text
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  teacherId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  materialId?: mongoose.Types.ObjectId; // Quiz can be based on a material
  collegeId?: mongoose.Types.ObjectId; // Made optional for public quizzes
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const QuizSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    materialId: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      // No longer strictly required, allowing for public quizzes
    },
    questions: [QuestionSchema],
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);
export default Quiz;