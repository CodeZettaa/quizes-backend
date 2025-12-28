import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Subject } from '../subjects/subject.schema';
import { QuizLevel } from '../common/constants/quiz-level.enum';
import { User } from '../users/user.schema';
import { Question } from './question.schema';
import { QuizAttempt } from './quiz-attempt.schema';

export type QuizDocument = Quiz & Document;

@Schema({ timestamps: true, collection: 'quizzes' })
export class Quiz {
  _id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subject!: Types.ObjectId | Subject;

  @Prop({ type: String, enum: Object.values(QuizLevel), required: true })
  level!: QuizLevel;

  @Prop({ required: true })
  title!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId | User;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Question' }], default: [] })
  questions!: Types.ObjectId[] | Question[];

  @Prop({ type: Number, default: 20, required: false })
  timerMinutes?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

