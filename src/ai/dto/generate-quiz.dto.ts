import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class GenerateQuizDto {
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsIn(['beginner', 'middle', 'intermediate'])
  level!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;
}
