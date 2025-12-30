import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UsersService } from './users.service';
import { UsersController, LeaderboardController } from './users.controller';
import { QuizAttempt, QuizAttemptSchema } from '../quizzes/quiz-attempt.schema';
import { Quiz, QuizSchema } from '../quizzes/quiz.schema';
import { Subject, SubjectSchema } from '../subjects/subject.schema';
import { QuizSession, QuizSessionSchema } from '../quizzes/quiz-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: QuizSession.name, schema: QuizSessionSchema },
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController, LeaderboardController],
  exports: [UsersService],
})
export class UsersModule {}
