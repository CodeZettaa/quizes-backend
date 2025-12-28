import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../common/constants/roles.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: String, required: false, unique: true, sparse: true, default: null })
  email?: string | null;

  @Prop({ type: String, required: false, default: null })
  password?: string | null;

  @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.STUDENT })
  role!: UserRole;

  @Prop({ type: String, default: null })
  avatarUrl?: string | null;

  @Prop({ type: String, default: null })
  bio?: string | null;

  @Prop({ type: Number, default: 0 })
  totalPoints!: number;

  @Prop({
    type: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      language: { type: String, enum: ['en', 'ar'], default: 'en' },
      primarySubject: { type: String, enum: ['HTML', 'CSS', 'JavaScript', 'Angular', 'React', 'NextJS', 'NestJS', 'NodeJS'], default: null },
      preferredLevel: { type: String, enum: ['beginner', 'middle', 'intermediate', 'mixed'], default: null },
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
    },
    default: {
      theme: 'system',
      language: 'en',
      emailNotifications: true,
      pushNotifications: true,
    },
    _id: false,
  })
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: 'en' | 'ar';
    primarySubject?: string;
    preferredLevel?: 'beginner' | 'middle' | 'intermediate' | 'mixed';
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

