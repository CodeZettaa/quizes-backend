import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Quiz } from './quiz.schema';
import { User } from '../users/user.schema';
import { QuizAttempt } from './quiz-attempt.schema';

export type QuizSessionDocument = QuizSession & Document;

export type QuizSessionStatus = 'active' | 'submitted' | 'abandoned';

@Schema({ timestamps: true, collection: 'quiz_sessions' })
export class QuizSession {
  _id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quiz!: Types.ObjectId | Quiz;

  @Prop({ type: String, enum: ['active', 'submitted', 'abandoned'], required: true })
  status!: QuizSessionStatus;

  @Prop({ type: Date, required: true })
  startedAt!: Date;

  @Prop({ type: Date, required: true })
  lastSeenAt!: Date;

  @Prop({ type: Date, required: true })
  expiresAt!: Date;

  @Prop({ type: Types.ObjectId, ref: 'QuizAttempt', default: null })
  attemptId?: Types.ObjectId | QuizAttempt | null;
}

export const QuizSessionSchema = SchemaFactory.createForClass(QuizSession);

QuizSessionSchema.index(
  { user: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } },
);
QuizSessionSchema.index({ expiresAt: 1 });
QuizSessionSchema.index({ lastSeenAt: 1 });
