import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Quiz } from "./quiz.schema";
import { User } from "../users/user.schema";

export type QuizAttemptDocument = QuizAttempt & Document;

@Schema({
  timestamps: { createdAt: "startedAt", updatedAt: "finishedAt" },
  collection: "quiz_attempts",
})
export class QuizAttempt {
  _id?: Types.ObjectId;

  // Note: Users can only complete a quiz once
  @Prop({ type: Types.ObjectId, ref: "Quiz", required: true })
  quiz!: Types.ObjectId | Quiz;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user!: Types.ObjectId | User;

  @Prop({ type: Number, required: true })
  score!: number;

  @Prop({ type: Number, required: true })
  totalQuestions!: number;

  @Prop({ type: Number, required: true })
  correctAnswersCount!: number;

  @Prop({ type: Number, required: true })
  pointsEarned!: number;

  @Prop({ type: String, sparse: true, default: undefined, required: false })
  publicSlug?: string;

  // Store user's answers for review
  @Prop({
    type: [
      {
        questionId: { type: Types.ObjectId, ref: "Question", required: true },
        selectedOptionId: {
          type: Types.ObjectId,
          ref: "AnswerOption",
          required: true,
        },
        isCorrect: { type: Boolean, required: true },
        _id: false,
      },
    ],
    default: [],
  })
  answers!: Array<{
    questionId: Types.ObjectId;
    selectedOptionId: Types.ObjectId;
    isCorrect: boolean;
  }>;

  startedAt?: Date;
  finishedAt?: Date;
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);

// Create a sparse unique index that only indexes non-null publicSlug values
// Sparse indexes skip documents where the field is null/undefined
QuizAttemptSchema.index(
  { publicSlug: 1 },
  {
    unique: true,
    sparse: true, // Only index documents where publicSlug exists and is not null
  }
);

// Prevent duplicate completed attempts for the same user+quiz
QuizAttemptSchema.index({ user: 1, quiz: 1 }, { unique: true });
