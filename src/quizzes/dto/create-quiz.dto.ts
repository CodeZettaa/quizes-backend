import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuizLevel } from '../../common/constants/quiz-level.enum';

export class CreateAnswerOptionDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  isCorrect!: boolean;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  type = 'mcq';

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerOptionDto)
  options!: CreateAnswerOptionDto[];
}

export class CreateQuizDto {
  @IsString()
  subjectId!: string;

  level!: QuizLevel;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions!: CreateQuestionDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  timerMinutes?: number;
}
