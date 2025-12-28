import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserDocument } from './user.schema';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Modern User Module Endpoints
  @Get('me')
  async getMe(@CurrentUser() user: UserDocument) {
    return this.usersService.getMe(user._id.toString());
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateMe(user._id.toString(), dto);
  }

  @Patch('me/password')
  async updatePassword(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(user._id.toString(), dto);
  }

  @Get('me/stats')
  async getStats(@CurrentUser() user: UserDocument) {
    return this.usersService.getUserStats(user._id.toString());
  }

  // Legacy/Additional Endpoints
  @Get('me/points')
  async getPoints(@CurrentUser() user: UserDocument) {
    const freshUser = await this.usersService.findById(user._id.toString());
    return { totalPoints: freshUser.totalPoints };
  }

  @Get('me/profile')
  async getProfile(@CurrentUser() user: UserDocument) {
    return this.usersService.getProfileWithAttempts(user._id.toString());
  }

  @Get('me/leaderboard-position')
  async getLeaderboardPosition(@CurrentUser() user: UserDocument) {
    return this.usersService.getLeaderboardPosition(user._id.toString());
  }

  @Put('me/profile')
  async updateProfile(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateProfileDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(
      user._id.toString(),
      dto,
    );
    const { password, ...safeUser } = updatedUser.toObject();
    return safeUser;
  }

  @Put('me/password')
  async changePassword(
    @CurrentUser() user: UserDocument,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user._id.toString(), dto);
  }

  @Get('me/attempts')
  getAttempts(@CurrentUser() user: UserDocument) {
    return this.usersService.getAttempts(user._id.toString());
  }

  @Post('me/sync-points')
  async syncPoints(@CurrentUser() user: UserDocument) {
    return this.usersService.syncPointsFromAttempts(user._id.toString());
  }

  // This route must be last to avoid matching /users/me
  @Get(':id')
  async getById(@Param('id') id: string) {
    // Validate that id is not 'me' to avoid conflicts
    if (id === 'me') {
      throw new NotFoundException('User not found');
    }
    const user = await this.usersService.findById(id);
    const { password, ...safeUser } = user.toObject();
    return safeUser;
  }
}

@UseGuards(JwtAuthGuard)
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getLeaderboard(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.usersService.getLeaderboard(limit);
  }
}
