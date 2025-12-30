import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsArray, IsEnum } from 'class-validator';
import { SubjectName } from '../../common/constants/subject-type.enum';

export class RegisterDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsArray()
  @IsEnum(SubjectName, { each: true })
  selectedSubjects?: SubjectName[];
}
