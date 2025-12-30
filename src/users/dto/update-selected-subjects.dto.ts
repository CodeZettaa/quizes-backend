import { IsArray, IsEnum } from 'class-validator';
import { SubjectName } from '../../common/constants/subject-type.enum';

export class UpdateSelectedSubjectsDto {
  @IsArray()
  @IsEnum(SubjectName, { each: true })
  selectedSubjects!: SubjectName[];
}

