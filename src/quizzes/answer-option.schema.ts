import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Question } from './question.schema';

export type AnswerOptionDocument = AnswerOption & Document;

@Schema({ collection: 'answer_options' })
export class AnswerOption {
  _id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Question' })
  question?: Types.ObjectId | Question;

  @Prop({ required: true })
  text!: string;

  @Prop({ default: false })
  isCorrect!: boolean;
}

export const AnswerOptionSchema = SchemaFactory.createForClass(AnswerOption);

