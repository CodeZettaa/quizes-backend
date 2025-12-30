import { UserPreferences } from "./user-preferences.dto";
import { SubjectName } from "../../common/constants/subject-type.enum";

export class UserResponseDto {
  _id!: string;
  name!: string;
  email!: string | null;
  role!: string;
  avatarUrl?: string | null;
  bio?: string | null;
  totalPoints!: number;
  selectedSubjects?: SubjectName[];
  preferences?: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}
