import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/user.schema';

export type SocialAccountDocument = SocialAccount & Document;

export enum SocialProvider {
  GOOGLE = 'google',
  LINKEDIN = 'linkedin',
}

@Schema({ timestamps: true, collection: 'social_accounts' })
export class SocialAccount {
  _id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId | User;

  @Prop({ type: String, enum: Object.values(SocialProvider), required: true })
  provider!: SocialProvider;

  @Prop({ type: String, required: true })
  providerUserId!: string; // OIDC "sub"

  @Prop({ type: String, required: false, default: null })
  email?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SocialAccountSchema = SchemaFactory.createForClass(SocialAccount);

// Create compound unique index
SocialAccountSchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

