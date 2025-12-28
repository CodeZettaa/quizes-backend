import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { QuizAttempt, QuizAttemptDocument } from '../quizzes/quiz-attempt.schema';
import { Quiz, QuizDocument } from '../quizzes/quiz.schema';
import { Subject, SubjectDocument } from '../subjects/subject.schema';
import { User, UserDocument } from '../users/user.schema';
import { CreateShareLinkDto } from './dto/create-share-link.dto';
import { ShareLinkResponseDto } from './dto/share-link-response.dto';
import { LinkedInPostResponseDto } from './dto/linkedin-post.dto';
import * as crypto from 'crypto';

@Injectable()
export class ShareService {
  constructor(
    @InjectModel(QuizAttempt.name)
    private attemptModel: Model<QuizAttemptDocument>,
    @InjectModel(Quiz.name)
    private quizModel: Model<QuizDocument>,
    @InjectModel(Subject.name)
    private subjectModel: Model<SubjectDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  /**
   * Generate a unique public slug for sharing
   */
  private generatePublicSlug(): string {
    // Generate a random 16-character alphanumeric string
    return crypto.randomBytes(8).toString('base64url');
  }

  /**
   * Create a shareable link for a quiz attempt
   */
  async createShareLink(dto: CreateShareLinkDto): Promise<ShareLinkResponseDto> {
    const attemptId = new Types.ObjectId(dto.attemptId);
    const attempt = await this.attemptModel.findById(attemptId).lean().exec();

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    // Generate or reuse public slug
    let publicSlug = attempt.publicSlug;
    if (!publicSlug) {
      // Generate a unique slug
      let slug: string;
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        slug = this.generatePublicSlug();
        const existing = await this.attemptModel.findOne({ publicSlug: slug }).exec();
        if (!existing) {
          isUnique = true;
          publicSlug = slug;
        }
        attempts++;
      }

      if (!publicSlug) {
        throw new BadRequestException('Failed to generate unique share link');
      }

      // Save the slug to the attempt
      await this.attemptModel.findByIdAndUpdate(attemptId, { publicSlug }).exec();
    }

    // Get frontend base URL from config or use default
    const frontendBaseUrl =
      this.configService.get<string>('FRONTEND_BASE_URL') ||
      'http://localhost:8888';
    
    const shareUrl = `${frontendBaseUrl}/share/attempt/${publicSlug}`;

    // Fetch quiz and subject for OG tags
    const quiz = await this.quizModel.findById(attempt.quiz).lean().exec();
    const subject = quiz
      ? await this.subjectModel.findById(quiz.subject).lean().exec()
      : null;
    const user = await this.userModel.findById(attempt.user).lean().exec();

    const percentage = attempt.totalQuestions > 0
      ? Math.round((attempt.correctAnswersCount / attempt.totalQuestions) * 100)
      : 0;

    const ogTitle = `I scored ${attempt.correctAnswersCount}/${attempt.totalQuestions} (${percentage}%) on ${subject?.name || 'Quiz'}!`;
    const ogDescription = `Check out my quiz result on CodeZetta! ${attempt.pointsEarned} points earned 🏆`;

    return {
      url: shareUrl,
      ogTitle,
      ogDescription,
    };
  }

  /**
   * Get quiz attempt details by public slug (for public share page)
   */
  async getAttemptBySlug(slug: string) {
    const attempt = await this.attemptModel
      .findOne({ publicSlug: slug })
      .lean()
      .exec();

    if (!attempt) {
      throw new NotFoundException('Share link not found');
    }

    // Populate quiz and subject
    const quiz = await this.quizModel.findById(attempt.quiz).lean().exec();
    const subject = quiz
      ? await this.subjectModel.findById(quiz.subject).lean().exec()
      : null;
    const user = await this.userModel.findById(attempt.user).lean().exec();

    return {
      attempt,
      quiz,
      subject,
      user,
    };
  }

  /**
   * Post quiz result to LinkedIn (optional - requires LinkedIn API integration)
   * This is a placeholder implementation
   */
  async postToLinkedIn(attemptId: string): Promise<LinkedInPostResponseDto> {
    const attempt = await this.attemptModel
      .findById(new Types.ObjectId(attemptId))
      .lean()
      .exec();

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    // TODO: Implement actual LinkedIn API integration
    // This would require:
    // 1. LinkedIn OAuth app setup
    // 2. Storing user's LinkedIn access token
    // 3. Using LinkedIn API to create a post
    
    // For now, return a placeholder response
    throw new BadRequestException(
      'LinkedIn posting is not yet implemented. Please use the share link feature instead.',
    );
  }
}

