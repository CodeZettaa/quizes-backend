import { IsString } from 'class-validator';

export class CreateShareLinkDto {
  @IsString()
  attemptId!: string;
}

