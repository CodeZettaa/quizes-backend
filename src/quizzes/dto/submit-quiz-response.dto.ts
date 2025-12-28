import { Expose, Type } from 'class-transformer';
import { IsNumber, IsArray, ValidateNested, IsString } from 'class-validator';
import { WrongAnswerFeedbackDto } from '../../article-suggestion/dto/wrong-answer-feedback.dto';

export class SubmitQuizResponseDto {
  @Expose()
  @IsString()
  attemptId!: string;

  @Expose()
  @IsNumber()
  score!: number;

  @Expose()
  @IsNumber()
  totalQuestions!: number;

  @Expose()
  @IsNumber()
  correctAnswersCount!: number;

  @Expose()
  @IsNumber()
  pointsEarned!: number;

  @Expose()
  @IsNumber()
  updatedUserTotalPoints!: number;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WrongAnswerFeedbackDto)
  wrongAnswers!: WrongAnswerFeedbackDto[];
}

