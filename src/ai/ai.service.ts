import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from '../subjects/subject.schema';
import { QuizzesService } from '../quizzes/quizzes.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { User, UserDocument } from '../users/user.schema';
import { QuizLevel } from '../common/constants/quiz-level.enum';
import { SubjectName } from '../common/constants/subject-type.enum';

@Injectable()
export class AiService {
  constructor(
    @InjectModel(Subject.name)
    private subjectModel: Model<SubjectDocument>,
    private quizzesService: QuizzesService,
  ) {}

  async generateQuiz(dto: GenerateQuizDto, user: UserDocument) {
    const subjectName = dto.subject as SubjectName;
    let subject = await this.subjectModel.findOne({ name: subjectName });
    
    if (!subject) {
      subject = new this.subjectModel({
        name: subjectName,
        description: `${dto.subject} subject auto-created`,
      });
      await subject.save();
    }

    const questions = this.generateQuestions(
      dto.subject,
      dto.level,
      dto.count || 5,
    );

    return this.quizzesService.create(
      {
        subjectId: subject._id.toString(),
        level: dto.level as QuizLevel,
        title: `AI ${dto.subject} ${dto.level} quiz`,
        questions,
      },
      user,
    );
  }

  private generateQuestions(subject: string, level: string, count: number) {
    const questions = [];
    for (let i = 1; i <= count; i++) {
      questions.push({
        text: `(${level}) ${subject} question #${i}`,
        type: 'mcq',
        options: [
          { text: 'Option A', isCorrect: i % 4 === 0 },
          { text: 'Option B', isCorrect: i % 4 === 1 },
          { text: 'Option C', isCorrect: i % 4 === 2 },
          { text: 'Option D', isCorrect: i % 4 === 3 },
        ],
      });
    }
    return questions;
  }
}
