import { IsIn, IsString } from 'class-validator';
import { QuizLevel } from '../../common/constants/quiz-level.enum';

export class CheckLevelCompletionDto {
  @IsString()
  @IsIn(Object.values(QuizLevel))
  level!: QuizLevel;
}

export class LevelCompletionResponseDto {
  level!: QuizLevel;
  totalQuizzes!: number;
  completedQuizzes!: number;
  isCompleted!: boolean;
  canGenerateRandom!: boolean;
}



