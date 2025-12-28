import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SubjectName } from '../common/constants/subject-type.enum';

export type SubjectDocument = Subject & Document;

@Schema({ timestamps: true, collection: 'subjects' })
export class Subject {
  _id?: Types.ObjectId;

  @Prop({ required: true, unique: true, type: String, enum: Object.values(SubjectName) })
  name!: SubjectName;

  @Prop({ default: '' })
  description!: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);

