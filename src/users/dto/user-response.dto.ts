import { UserPreferences } from "./user-preferences.dto";

export class UserResponseDto {
  _id!: string;
  name!: string;
  email!: string | null;
  role!: string;
  avatarUrl?: string | null;
  bio?: string | null;
  totalPoints!: number;
  preferences?: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}
