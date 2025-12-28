import { Expose, Type } from 'class-transformer';
import { IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { ArticleRecommendationDto } from './article-recommendation.dto';

export class WrongAnswerFeedbackDto {
  @Expose()
  @IsString()
  questionId!: string;

  @Expose()
  @IsString()
  questionText!: string;

  @Expose()
  @IsString()
  selectedOptionId!: string;

  @Expose()
  @IsString()
  correctOptionId!: string;

  @Expose()
  @IsOptional()
  @IsString()
  explanation?: string;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticleRecommendationDto)
  suggestedArticles!: ArticleRecommendationDto[];
}

