import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { AttemptsController } from './attempts.controller';
import { Quiz, QuizSchema } from './quiz.schema';
import { Subject, SubjectSchema } from '../subjects/subject.schema';
import { Question, QuestionSchema } from './question.schema';
import { AnswerOption, AnswerOptionSchema } from './answer-option.schema';
import { QuizAttempt, QuizAttemptSchema } from './quiz-attempt.schema';
import { QuizSession, QuizSessionSchema } from './quiz-session.schema';
import { UsersModule } from '../users/users.module';
import { ArticleSuggestionModule } from '../article-suggestion/article-suggestion.module';
import { QuizSessionCleanupService } from './quiz-session-cleanup.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: AnswerOption.name, schema: AnswerOptionSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: QuizSession.name, schema: QuizSessionSchema },
    ]),
    UsersModule,
    ArticleSuggestionModule,
  ],
  controllers: [QuizzesController, AttemptsController],
  providers: [QuizzesService, QuizSessionCleanupService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
