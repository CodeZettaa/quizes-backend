import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { QuizAttempt, QuizAttemptDocument } from '../quizzes/quiz-attempt.schema';
import { Quiz, QuizDocument } from '../quizzes/quiz.schema';
import { Subject, SubjectDocument } from '../subjects/subject.schema';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserStatsDto, PerSubjectStatsDto } from './dto/user-stats.dto';
import { LeaderboardEntryDto } from './dto/leaderboard-entry.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(QuizAttempt.name)
    private attemptModel: Model<QuizAttemptDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
  ) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async incrementPoints(userId: string, amount: number) {
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { totalPoints: amount },
    });
    return this.findById(userId);
  }

  async syncPointsFromAttempts(userId: string) {
    // Recalculate totalPoints from actual QuizAttempt records
    const userObjectId = new Types.ObjectId(userId);
    const attempts = await this.attemptModel
      .find({ user: userObjectId })
      .lean()
      .exec();
    
    const calculatedPoints = attempts.reduce((sum, attempt) => sum + (attempt.pointsEarned || 0), 0);
    
    // Update user's totalPoints to match actual attempts
    await this.userModel.findByIdAndUpdate(userId, {
      totalPoints: calculatedPoints,
    });
    
    return {
      previousPoints: (await this.findById(userId)).totalPoints,
      calculatedPoints,
      attemptsCount: attempts.length,
    };
  }

  async getProfileWithAttempts(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    
    const attempts = await this.attemptModel
      .find({ user: userId })
      .populate('quiz')
      .sort({ finishedAt: -1 })
      .exec();
    
    const { password, ...safeUser } = user.toObject();
    return { 
      ...safeUser,
      _id: safeUser._id.toString(),
      totalPoints: user.totalPoints, // Ensure fresh totalPoints
      attempts 
    };
  }

  async getAttempts(userId: string) {
    return this.attemptModel
      .find({ user: userId })
      .sort({ finishedAt: -1 })
      .exec();
  }


  async getProfileStats(userId: string) {
    const user = await this.findById(userId);
    const attempts = await this.attemptModel
      .find({ user: userId })
      .populate('quiz')
      .sort({ finishedAt: -1 })
      .lean()
      .exec();

    const totalQuizzes = attempts.length;
    const totalQuestions = attempts.reduce((sum, a) => sum + (a.totalQuestions || 0), 0);
    const totalCorrect = attempts.reduce((sum, a) => sum + (a.correctAnswersCount || 0), 0);
    const averageScore = totalQuizzes > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;
    const bestScore = attempts.length > 0
      ? Math.max(...attempts.map(a => Math.round(((a.correctAnswersCount || 0) / (a.totalQuestions || 1)) * 100)))
      : 0;
    const totalPointsEarned = attempts.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);

    // Subject-wise performance
    const subjectStats = new Map();
    for (const attempt of attempts) {
      const quiz = attempt.quiz as any;
      if (quiz && quiz.subject) {
        const subjectId = typeof quiz.subject === 'string' 
          ? quiz.subject 
          : (quiz.subject._id || quiz.subject).toString();
        
        const subject = await this.subjectModel.findById(subjectId).lean().exec();
        if (subject) {
          const subjectName = subject.name;
          if (!subjectStats.has(subjectName)) {
            subjectStats.set(subjectName, {
              subject: subjectName,
              attempts: 0,
              totalQuestions: 0,
              correctAnswers: 0,
              totalPoints: 0,
            });
          }
          const stat = subjectStats.get(subjectName);
          stat.attempts += 1;
          stat.totalQuestions += attempt.totalQuestions || 0;
          stat.correctAnswers += attempt.correctAnswersCount || 0;
          stat.totalPoints += attempt.pointsEarned || 0;
        }
      }
    }

    // Level-wise performance
    const levelStats = new Map();
    for (const attempt of attempts) {
      const quiz = attempt.quiz as any;
      if (quiz && quiz.level) {
        const level = quiz.level;
        if (!levelStats.has(level)) {
          levelStats.set(level, {
            level,
            attempts: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            totalPoints: 0,
          });
        }
        const stat = levelStats.get(level);
        stat.attempts += 1;
        stat.totalQuestions += attempt.totalQuestions || 0;
        stat.correctAnswers += attempt.correctAnswersCount || 0;
        stat.totalPoints += attempt.pointsEarned || 0;
      }
    }

    // Calculate leaderboard position
    const usersAbove = await this.userModel.countDocuments({
      totalPoints: { $gt: user.totalPoints },
    });
    const leaderboardPosition = usersAbove + 1;

    // Recent activity (last 10 attempts)
    const recentAttempts = attempts.slice(0, 10).map((a: any) => ({
      quizId: a.quiz?._id?.toString() || a.quiz?.toString(),
      quizTitle: (a.quiz as any)?.title || 'Unknown Quiz',
      score: a.score,
      totalQuestions: a.totalQuestions,
      correctAnswers: a.correctAnswersCount,
      pointsEarned: a.pointsEarned,
      percentage: a.totalQuestions > 0 
        ? Math.round((a.correctAnswersCount / a.totalQuestions) * 100) 
        : 0,
      finishedAt: a.finishedAt,
    }));

    // Achievements/Badges
    const achievements = [];
    if (totalQuizzes >= 1) achievements.push({ name: 'First Quiz', icon: '🎯' });
    if (totalQuizzes >= 10) achievements.push({ name: 'Quiz Master', icon: '🏆' });
    if (totalQuizzes >= 50) achievements.push({ name: 'Quiz Legend', icon: '👑' });
    if (bestScore >= 100) achievements.push({ name: 'Perfect Score', icon: '💯' });
    if (averageScore >= 80) achievements.push({ name: 'Excellent Student', icon: '⭐' });
    if (user.totalPoints >= 100) achievements.push({ name: 'Centurion', icon: '💪' });
    if (user.totalPoints >= 500) achievements.push({ name: 'Point Collector', icon: '💰' });
    if (user.totalPoints >= 1000) achievements.push({ name: 'Point Master', icon: '🌟' });

    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        totalPoints: user.totalPoints,
        createdAt: user.createdAt,
      },
      statistics: {
        totalQuizzes,
        totalQuestions,
        totalCorrectAnswers: totalCorrect,
        averageScore,
        bestScore,
        totalPointsEarned,
        leaderboardPosition,
      },
      subjectPerformance: Array.from(subjectStats.values()).map(stat => ({
        ...stat,
        averageScore: stat.totalQuestions > 0
          ? Math.round((stat.correctAnswers / stat.totalQuestions) * 100)
          : 0,
      })),
      levelPerformance: Array.from(levelStats.values()).map(stat => ({
        ...stat,
        averageScore: stat.totalQuestions > 0
          ? Math.round((stat.correctAnswers / stat.totalQuestions) * 100)
          : 0,
      })),
      recentActivity: recentAttempts,
      achievements,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.findById(userId);
    
    // Check if email is being changed and if it's already taken
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new BadRequestException('Email already in use');
      }
    }

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.email) updateData.email = dto.email;

    await this.userModel.findByIdAndUpdate(userId, updateData);
    return this.findById(userId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto | UpdatePasswordDto) {
    const user = await this.findById(userId);
    
    // Check if user has a password (social-only users can't change password this way)
    if (!user.password) {
      throw new BadRequestException('Password change not available for social-only accounts');
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    
    await this.userModel.findByIdAndUpdate(userId, { password: hashedPassword });
    return { message: 'Password updated successfully' };
  }

  async getLeaderboardPosition(userId: string) {
    const user = await this.findById(userId);
    const usersAbove = await this.userModel.countDocuments({
      totalPoints: { $gt: user.totalPoints },
    });
    const totalUsers = await this.userModel.countDocuments();
    
    return {
      position: usersAbove + 1,
      totalUsers,
      percentile: totalUsers > 0 
        ? Math.round(((totalUsers - usersAbove) / totalUsers) * 100) 
        : 100,
      totalPoints: user.totalPoints,
    };
  }

  // New modern User module methods
  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.findById(userId);
    const userObj = user.toObject();
    const { password, ...safeUser } = userObj;
    return {
      _id: safeUser._id.toString(),
      name: safeUser.name,
      email: safeUser.email || null,
      role: safeUser.role,
      avatarUrl: safeUser.avatarUrl || null,
      bio: safeUser.bio || null,
      totalPoints: safeUser.totalPoints,
      preferences: (safeUser.preferences as any) || {
        theme: 'system',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
      },
      createdAt: safeUser.createdAt,
      updatedAt: safeUser.updatedAt,
    };
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findById(userId);
    
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl || null;
    if (dto.bio !== undefined) updateData.bio = dto.bio || null;
    if (dto.preferences !== undefined) {
      // Merge preferences with existing ones
      const currentPrefs = user.preferences || {};
      updateData.preferences = {
        ...currentPrefs,
        ...dto.preferences,
      } as any;
    }

    await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
    return this.getMe(userId);
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto): Promise<{ message: string }> {
    const user = await this.findById(userId);
    
    // Check if user has a password (social-only users can't change password this way)
    if (!user.password) {
      throw new BadRequestException('Password change not available for social-only accounts');
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, { password: hashedPassword });
    
    return { message: 'Password updated successfully' };
  }

  async getUserStats(userId: string): Promise<UserStatsDto> {
    // Convert userId to ObjectId for proper querying
    const userObjectId = new Types.ObjectId(userId);
    const attempts = await this.attemptModel
      .find({ user: userObjectId })
      .populate({
        path: 'quiz',
        populate: { path: 'subject' },
      })
      .lean()
      .exec();

    const totalQuizzesTaken = attempts.length;
    const totalQuestionsAnswered = attempts.reduce((sum, a) => sum + (a.totalQuestions || 0), 0);
    const totalCorrectAnswers = attempts.reduce((sum, a) => sum + (a.correctAnswersCount || 0), 0);

    // Calculate streak days
    const streakDays = this.calculateStreakDays(attempts);

    // Calculate per-subject stats
    const perSubjectStats = await this.calculatePerSubjectStats(attempts);

    return {
      totalQuizzesTaken,
      totalCorrectAnswers,
      totalQuestionsAnswered,
      streakDays,
      perSubjectStats,
    };
  }

  private calculateStreakDays(attempts: any[]): number {
    if (attempts.length === 0) return 0;

    // Get distinct dates from attempts (using finishedAt or startedAt)
    const dates = attempts
      .map(a => {
        const date = a.finishedAt || a.startedAt || a.createdAt;
        if (!date) return null;
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      })
      .filter((d): d is number => d !== null)
      .sort((a, b) => b - a); // Sort descending

    if (dates.length === 0) return 0;

    // Remove duplicates
    const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);

    // Count consecutive days from today backwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    let streak = 0;
    let currentDate = todayTime;

    for (const dateTime of uniqueDates) {
      if (dateTime === currentDate) {
        streak++;
        currentDate -= 24 * 60 * 60 * 1000; // Subtract one day
      } else if (dateTime < currentDate) {
        // Gap found, stop counting
        break;
      }
    }

    return streak;
  }

  private async calculatePerSubjectStats(attempts: any[]): Promise<PerSubjectStatsDto[]> {
    const subjectMap = new Map<string, { quizzesTaken: number; totalScore: number; totalPoints: number; count: number }>();

    for (const attempt of attempts) {
      const quiz = attempt.quiz as any;
      if (!quiz) continue;

      // Get subject from quiz (handles both populated and non-populated cases)
      let subjectName = 'Unknown';
      if (quiz.subject) {
        if (typeof quiz.subject === 'string') {
          // Subject is just an ObjectId string, fetch it
          const subject = await this.subjectModel.findById(quiz.subject).lean().exec();
          subjectName = subject?.name || 'Unknown';
        } else if (quiz.subject.name) {
          // Subject is populated and has name
          subjectName = quiz.subject.name;
        } else if (quiz.subject._id) {
          // Subject is an object with _id
          const subject = await this.subjectModel.findById(quiz.subject._id).lean().exec();
          subjectName = subject?.name || 'Unknown';
        }
      }

      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, {
          quizzesTaken: 0,
          totalScore: 0,
          totalPoints: 0,
          count: 0,
        });
      }

      const stat = subjectMap.get(subjectName)!;
      stat.quizzesTaken += 1;
      
      // Calculate score percentage (0-100)
      const scorePercentage = attempt.totalQuestions > 0
        ? (attempt.correctAnswersCount / attempt.totalQuestions) * 100
        : 0;
      stat.totalScore += scorePercentage;
      stat.count += 1;
      stat.totalPoints += attempt.pointsEarned || 0;
    }

    return Array.from(subjectMap.entries())
      .map(([subject, stat]) => ({
        subject,
        quizzesTaken: stat.quizzesTaken,
        averageScore: stat.count > 0 ? Math.round(stat.totalScore / stat.count) : 0,
        totalPoints: stat.totalPoints,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints); // Sort by total points descending
  }

  async getLeaderboard(limit: number = 20): Promise<LeaderboardEntryDto[]> {
    const maxLimit = Math.min(limit, 100);
    const users = await this.userModel
      .find()
      .select('_id name avatarUrl totalPoints')
      .sort({ totalPoints: -1 })
      .limit(maxLimit)
      .lean()
      .exec();

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user._id.toString(),
      name: user.name,
      avatarUrl: user.avatarUrl || null,
      totalPoints: user.totalPoints,
    }));
  }
}
