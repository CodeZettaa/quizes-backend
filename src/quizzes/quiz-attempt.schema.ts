import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Quiz } from './quiz.schema';
import { User } from '../users/user.schema';

export type QuizAttemptDocument = QuizAttempt & Document;

@Schema({ timestamps: { createdAt: 'startedAt', updatedAt: 'finishedAt' }, collection: 'quiz_attempts' })
export class QuizAttempt {
  _id?: Types.ObjectId;

  // Note: Users can take the same quiz multiple times
  // There is NO unique constraint on (quiz, user) combination
  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quiz!: Types.ObjectId | Quiz;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId | User;

  @Prop({ type: Number, required: true })
  score!: number;

  @Prop({ type: Number, required: true })
  totalQuestions!: number;

  @Prop({ type: Number, required: true })
  correctAnswersCount!: number;

  @Prop({ type: Number, required: true })
  pointsEarned!: number;

  @Prop({ type: String, sparse: true, default: null })
  publicSlug?: string | null;

  // Store user's answers for review
  @Prop({
    type: [
      {
        questionId: { type: Types.ObjectId, ref: 'Question', required: true },
        selectedOptionId: { type: Types.ObjectId, ref: 'AnswerOption', required: true },
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

// Create a partial unique index that only indexes non-null publicSlug values
QuizAttemptSchema.index(
  { publicSlug: 1 },
  {
    unique: true,
    partialFilterExpression: { publicSlug: { $ne: null } },
  },
);

