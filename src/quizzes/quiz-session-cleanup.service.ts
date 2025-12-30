import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizSession, QuizSessionDocument } from './quiz-session.schema';

const CLEANUP_INTERVAL_MS = 2 * 60 * 1000;
const INACTIVE_TIMEOUT_MS = 2 * 60 * 1000;

@Injectable()
export class QuizSessionCleanupService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @InjectModel(QuizSession.name)
    private sessionModel: Model<QuizSessionDocument>,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => {
      this.abandonExpiredSessions().catch((error) => {
        console.error('Failed to cleanup quiz sessions:', error);
      });
    }, CLEANUP_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async abandonExpiredSessions() {
    const now = new Date();
    const inactiveThreshold = new Date(now.getTime() - INACTIVE_TIMEOUT_MS);

    await this.sessionModel.updateMany(
      {
        status: 'active',
        $or: [
          { expiresAt: { $lte: now } },
          { lastSeenAt: { $lte: inactiveThreshold } },
        ],
      },
      { $set: { status: 'abandoned' } },
    );
  }
}
