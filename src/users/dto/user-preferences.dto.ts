import { IsEnum, IsBoolean, IsOptional, IsString } from 'class-validator';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum Language {
  EN = 'en',
  AR = 'ar',
}

export enum PrimarySubject {
  HTML = 'HTML',
  CSS = 'CSS',
  JAVASCRIPT = 'JavaScript',
  ANGULAR = 'Angular',
  REACT = 'React',
  NEXTJS = 'NextJS',
  NESTJS = 'NestJS',
  NODEJS = 'NodeJS',
}

export enum PreferredLevel {
  BEGINNER = 'beginner',
  MIDDLE = 'middle',
  INTERMEDIATE = 'intermediate',
  MIXED = 'mixed',
}

export class UserPreferences {
  @IsEnum(Theme)
  @IsOptional()
  theme?: Theme;

  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @IsEnum(PrimarySubject)
  @IsOptional()
  primarySubject?: PrimarySubject;

  @IsEnum(PreferredLevel)
  @IsOptional()
  preferredLevel?: PreferredLevel;

  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;
}

