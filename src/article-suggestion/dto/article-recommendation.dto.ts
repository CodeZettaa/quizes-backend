import { Expose } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum ArticleProvider {
  MDN = 'MDN',
  FREECODECAMP = 'FreeCodeCamp',
  BLOG = 'Blog',
  W3SCHOOLS = 'W3Schools',
  STACKOVERFLOW = 'StackOverflow',
}

export enum ArticleLevel {
  BEGINNER = 'beginner',
  MIDDLE = 'middle',
  INTERMEDIATE = 'intermediate',
}

export class ArticleRecommendationDto {
  @Expose()
  @IsString()
  id!: string;

  @Expose()
  @IsString()
  title!: string;

  @Expose()
  @IsString()
  url!: string;

  @Expose()
  @IsEnum(ArticleProvider)
  provider!: ArticleProvider;

  @Expose()
  @IsOptional()
  @IsNumber()
  estimatedReadingTimeMinutes?: number;

  @Expose()
  @IsOptional()
  @IsString()
  subject?: string;

  @Expose()
  @IsOptional()
  @IsEnum(ArticleLevel)
  level?: ArticleLevel;
}

