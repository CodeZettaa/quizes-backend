import { IsString, IsOptional, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserPreferences } from './user-preferences.dto';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @ValidateNested()
  @Type(() => UserPreferences)
  @IsOptional()
  preferences?: Partial<UserPreferences>;
}

