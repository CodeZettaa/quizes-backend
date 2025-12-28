import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { QuizLevel } from '../../common/constants/quiz-level.enum';

export class GenerateRandomQuestionsDto {
  @IsString()
  @IsIn(Object.values(QuizLevel))
  level!: QuizLevel;

  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number; // Default to 20 questions
}

export class RandomQuestionDto {
  text!: string;
  type!: string;
  options!: Array<{ text: string; isCorrect: boolean }>;
}

export class GenerateRandomQuestionsResponseDto {
  questions!: RandomQuestionDto[];
  level!: QuizLevel;
  count!: number;
}



