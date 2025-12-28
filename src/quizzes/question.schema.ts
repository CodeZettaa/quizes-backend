import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Quiz } from './quiz.schema';
import { AnswerOption } from './answer-option.schema';

export type QuestionDocument = Question & Document;

@Schema({ collection: 'questions' })
export class Question {
  _id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Quiz' })
  quiz?: Types.ObjectId | Quiz;

  @Prop({ required: true })
  text!: string;

  @Prop({ default: 'mcq' })
  type!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'AnswerOption' }], default: [] })
  options!: Types.ObjectId[] | AnswerOption[];

  @Prop({ type: String, required: false, default: null })
  topicSlug?: string | null;

  @Prop({ type: Object, required: false, default: null })
  learningResources?: any; // JSON field for ArticleRecommendation[]
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

