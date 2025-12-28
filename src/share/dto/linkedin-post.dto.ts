import { IsString } from 'class-validator';

export class LinkedInPostDto {
  @IsString()
  attemptId!: string;
}

export class LinkedInPostResponseDto {
  status!: 'posted';
  postUrl?: string;
}

