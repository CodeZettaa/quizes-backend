import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Quiz, QuizDocument } from "./quiz.schema";
import { Subject, SubjectDocument } from "../subjects/subject.schema";
import { User, UserDocument } from "../users/user.schema";
import { CreateQuizDto, CreateQuestionDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";
import { Question, QuestionDocument } from "./question.schema";
import { AnswerOption, AnswerOptionDocument } from "./answer-option.schema";
import { SubmitQuizDto } from "./dto/submit-quiz.dto";
import { QuizAttempt, QuizAttemptDocument } from "./quiz-attempt.schema";
import { UsersService } from "../users/users.service";
import { ArticleSuggestionService } from "../article-suggestion/article-suggestion.service";
import { WrongAnswerFeedbackDto } from "../article-suggestion/dto/wrong-answer-feedback.dto";
import { SubmitQuizResponseDto } from "./dto/submit-quiz-response.dto";
import { LevelCompletionResponseDto } from "./dto/check-level-completion.dto";
import {
  GenerateRandomQuestionsDto,
  GenerateRandomQuestionsResponseDto,
  RandomQuestionDto,
} from "./dto/generate-random-questions.dto";
import { QuizLevel } from "../common/constants/quiz-level.enum";

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(AnswerOption.name)
    private optionModel: Model<AnswerOptionDocument>,
    @InjectModel(QuizAttempt.name)
    private attemptModel: Model<QuizAttemptDocument>,
    private usersService: UsersService,
    private articleSuggestionService: ArticleSuggestionService
  ) {}

  async findAll(filter?: { subjectId?: string; level?: string }, userId?: string) {
    const query: any = {};
    if (filter?.subjectId) query.subject = new Types.ObjectId(filter.subjectId);
    if (filter?.level) query.level = filter.level;
    const quizzes = await this.quizModel
      .find(query)
      .populate("subject")
      .lean()
      .sort({ createdAt: -1 })
      .exec();

    // Log for debugging - remove in production
    console.log(
      `[QuizzesService] Found ${quizzes.length} quizzes with filter:`,
      filter
    );

    // Get quiz IDs that user has attempted (if userId is provided)
    let attemptedQuizIds = new Set<string>();
    if (userId) {
      const userObjectId = new Types.ObjectId(userId);
      const attempts = await this.attemptModel
        .find({ user: userObjectId })
        .select("quiz")
        .lean()
        .exec();
      attemptedQuizIds = new Set(
        attempts.map((attempt) => {
          const quizId = attempt.quiz as any;
          return quizId?._id ? quizId._id.toString() : quizId.toString();
        })
      );
    }

    // Manually fetch questions for all quizzes to ensure they're populated
    const quizzesWithQuestions = await Promise.all(
      quizzes.map(async (quiz: any) => {
        let questions: any[] = [];
        const quizId = quiz._id.toString();

        if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
          const questionIds = quiz.questions
            .map((q: any) => {
              if (typeof q === "string") return new Types.ObjectId(q);
              if (q && q._id) return q._id;
              return q;
            })
            .filter((id: any) => id);

          if (questionIds.length > 0) {
            questions = await this.questionModel
              .find({ _id: { $in: questionIds } })
              .sort({ _id: 1 })
              .lean()
              .exec();

            // Manually fetch options for each question
            questions = await Promise.all(
              questions.map(async (q: any) => {
                if (Array.isArray(q.options) && q.options.length > 0) {
                  const optionIds = q.options
                    .map((opt: any) => {
                      if (typeof opt === "string")
                        return new Types.ObjectId(opt);
                      if (opt && opt._id) return opt._id;
                      if (opt && opt._bsontype === "ObjectId") return opt;
                      return opt;
                    })
                    .filter((id: any) => id);

                  if (optionIds.length > 0) {
                    const fetchedOptions = await this.optionModel
                      .find({ _id: { $in: optionIds } })
                      .lean()
                      .exec();
                    q.options = fetchedOptions;
                  } else {
                    q.options = [];
                  }
                } else {
                  q.options = [];
                }
                return q;
              })
            );
          }
        }

        const strippedQuiz = this.stripCorrectAnswers({
          ...quiz,
          questions: questions || [],
        });

        // Add hasTaken flag if userId is provided
        if (userId) {
          return {
            ...strippedQuiz,
            hasTaken: attemptedQuizIds.has(quizId),
          };
        }

        return strippedQuiz;
      })
    );

    return quizzesWithQuestions;
  }

  async findOne(id: string) {
    if (!id || id === "undefined") {
      throw new NotFoundException("Quiz ID is required");
    }
    const quiz = await this.quizModel
      .findById(id)
      .populate("subject")
      .populate("createdBy")
      .lean()
      .exec();
    if (!quiz) throw new NotFoundException("Quiz not found");

    // Manually fetch questions with options to ensure they're populated
    let questions: any[] = [];
    if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
      const questionIds = (quiz.questions as any[])
        .map((q: any) => {
          if (typeof q === "string") return new Types.ObjectId(q);
          if (q && q._id) return q._id;
          return q;
        })
        .filter((id: any) => id);

      if (questionIds.length > 0) {
        questions = await this.questionModel
          .find({ _id: { $in: questionIds } })
          .sort({ _id: 1 })
          .lean()
          .exec();

        // Manually fetch options for each question
        questions = await Promise.all(
          questions.map(async (q: any) => {
            if (Array.isArray(q.options) && q.options.length > 0) {
              const optionIds = q.options
                .map((opt: any) => {
                  if (typeof opt === "string") return new Types.ObjectId(opt);
                  if (opt && opt._id) return opt._id;
                  if (opt && opt._bsontype === "ObjectId") return opt;
                  return opt;
                })
                .filter((id: any) => id);

              if (optionIds.length > 0) {
                const fetchedOptions = await this.optionModel
                  .find({ _id: { $in: optionIds } })
                  .lean()
                  .exec();
                q.options = fetchedOptions;
              } else {
                q.options = [];
              }
            } else {
              q.options = [];
            }
            return q;
          })
        );
      }
    }

    return this.stripCorrectAnswers({
      ...quiz,
      questions,
    });
  }

  async findRaw(id: string) {
    if (!id || id === "undefined") {
      throw new NotFoundException("Quiz ID is required");
    }
    const quiz = await this.quizModel
      .findById(id)
      .populate("subject")
      .populate("createdBy")
      .populate({
        path: "questions",
        populate: { path: "options" },
      })
      .exec();
    if (!quiz) throw new NotFoundException("Quiz not found");
    return quiz;
  }

  async create(dto: CreateQuizDto, creator: UserDocument) {
    const subject = await this.subjectModel.findById(dto.subjectId);
    if (!subject) throw new NotFoundException("Subject not found");

    // First create the quiz to get its ID
    const quiz = new this.quizModel({
      title: dto.title,
      level: dto.level,
      subject: subject._id,
      createdBy: creator._id,
      questions: [],
      timerMinutes: dto.timerMinutes || 20,
    });
    const savedQuiz = await quiz.save();

    const questionIds = [];
    for (const qDto of dto.questions) {
      const optionIds = [];
      // Create question first to get its ID
      const question = new this.questionModel({
        quiz: savedQuiz._id,
        text: qDto.text,
        type: qDto.type || "mcq",
        options: [],
      });
      await question.save();

      // Create options with question reference
      for (const optDto of qDto.options) {
        const option = new this.optionModel({
          question: question._id,
          text: optDto.text,
          isCorrect: !!optDto.isCorrect,
        });
        await option.save();
        optionIds.push(option._id);
      }

      // Update question with option IDs
      question.options = optionIds;
      await question.save();
      questionIds.push(question._id);
    }

    // Update quiz with question IDs
    savedQuiz.questions = questionIds;
    const finalQuiz = await savedQuiz.save();

    if (!finalQuiz._id) {
      throw new Error("Failed to create quiz");
    }

    return this.findOne(finalQuiz._id.toString());
  }

  async update(id: string, dto: UpdateQuizDto, updater: UserDocument) {
    const quiz = await this.findRaw(id);
    const subject = await this.subjectModel.findById(dto.subjectId);
    if (!subject) throw new NotFoundException("Subject not found");

    // Delete old questions and options
    const oldQuestions = await this.questionModel.find({ quiz: id });
    for (const q of oldQuestions) {
      await this.optionModel.deleteMany({ _id: { $in: q.options } });
    }
    await this.questionModel.deleteMany({ quiz: id });

    // Create new questions and options
    const questionIds = [];
    for (const qDto of dto.questions) {
      const optionIds = [];
      // Create question first to get its ID
      const question = new this.questionModel({
        quiz: id,
        text: qDto.text,
        type: qDto.type || "mcq",
        options: [],
      });
      await question.save();

      // Create options with question reference
      for (const optDto of qDto.options) {
        const option = new this.optionModel({
          question: question._id,
          text: optDto.text,
          isCorrect: !!optDto.isCorrect,
        });
        await option.save();
        optionIds.push(option._id);
      }

      // Update question with option IDs
      question.options = optionIds;
      await question.save();
      questionIds.push(question._id);
    }

    quiz.title = dto.title;
    quiz.level = dto.level;
    quiz.subject = subject._id;
    quiz.createdBy = updater._id;
    quiz.questions = questionIds;

    const saved = await quiz.save();
    if (!saved._id) {
      throw new Error("Failed to update quiz");
    }
    return this.findOne(saved._id.toString());
  }

  async remove(id: string) {
    await this.findRaw(id);

    // Delete related questions and options
    const questions = await this.questionModel.find({ quiz: id });
    for (const q of questions) {
      await this.optionModel.deleteMany({ _id: { $in: q.options } });
    }
    await this.questionModel.deleteMany({ quiz: id });

    await this.quizModel.findByIdAndDelete(id);
    return { deleted: true };
  }

  /**
   * Submit a quiz attempt
   * Note: Users can retake quizzes multiple times - each submission creates a new attempt
   */
  async submit(id: string, dto: SubmitQuizDto, userId: string) {
    if (!id || id === "undefined") {
      throw new NotFoundException("Quiz ID is required");
    }
    const quiz = await this.quizModel.findById(id).lean().exec();
    if (!quiz) throw new NotFoundException("Quiz not found");

    // Extract question IDs properly
    const questionIds = Array.isArray(quiz.questions)
      ? quiz.questions
          .map((q: any) => {
            if (typeof q === "string") return new Types.ObjectId(q);
            if (q && q._id) return q._id;
            if (q && q._bsontype === "ObjectId") return q;
            return new Types.ObjectId(q.toString());
          })
          .filter((id: any) => id)
      : [];

    if (questionIds.length === 0) {
      throw new NotFoundException("Quiz has no questions");
    }

    // Fetch questions
    let questions = await this.questionModel
      .find({ _id: { $in: questionIds } })
      .lean()
      .exec();

    // Manually fetch options for each question
    questions = await Promise.all(
      questions.map(async (q: any) => {
        if (Array.isArray(q.options) && q.options.length > 0) {
          const optionIds = q.options
            .map((opt: any) => {
              if (typeof opt === "string") return new Types.ObjectId(opt);
              if (opt && opt._id) return opt._id;
              if (opt && opt._bsontype === "ObjectId") return opt;
              return new Types.ObjectId(opt.toString());
            })
            .filter((id: any) => id);

          if (optionIds.length > 0) {
            const fetchedOptions = await this.optionModel
              .find({ _id: { $in: optionIds } })
              .lean()
              .exec();
            q.options = fetchedOptions;
          } else {
            q.options = [];
          }
        } else {
          q.options = [];
        }
        return q;
      })
    );

    // Fetch subject for article suggestions
    const subject = await this.subjectModel
      .findById(quiz.subject)
      .lean()
      .exec();
    const subjectName = subject?.name || "Unknown";

    const answersMap = new Map(
      dto.answers.map((a) => [a.questionId, a.selectedOptionId])
    );
    let correctAnswersCount = 0;
    const wrongAnswers: WrongAnswerFeedbackDto[] = [];
    const savedAnswers: Array<{
      questionId: Types.ObjectId;
      selectedOptionId: Types.ObjectId;
      isCorrect: boolean;
    }> = [];

    // Process each question to determine correctness and collect wrong answers
    for (const question of questions) {
      const selectedOptionId = answersMap.get(question._id.toString());
      const correctOption = (question.options || []).find(
        (o: any) => o.isCorrect === true
      );

      const isCorrect = Boolean(
        selectedOptionId &&
        correctOption &&
        correctOption._id &&
        correctOption._id.toString() === selectedOptionId
      );

      // Save the answer for review
      if (selectedOptionId) {
        savedAnswers.push({
          questionId: new Types.ObjectId(question._id),
          selectedOptionId: new Types.ObjectId(selectedOptionId),
          isCorrect,
        });
      }

      if (isCorrect) {
        correctAnswersCount += 1;
      } else {
        // This is a wrong answer - get article suggestions
        const suggestedArticles =
          await this.articleSuggestionService.getSuggestionsForQuestion(
            question,
            subjectName,
            quiz.level
          );

        const correctOptionId =
          correctOption && correctOption._id
            ? correctOption._id.toString()
            : "";

        wrongAnswers.push({
          questionId: question._id.toString(),
          questionText: question.text || "",
          selectedOptionId: selectedOptionId || "",
          correctOptionId: correctOptionId,
          explanation: undefined, // Can be added later if we store explanations
          suggestedArticles: suggestedArticles,
        });
      }
    }

    const totalQuestions = questions.length;
    const score = correctAnswersCount;
    const pointsEarned = correctAnswersCount * 10;

    // Convert userId string to ObjectId
    const userObjectId = new Types.ObjectId(userId);

    // Fetch user to verify it exists and get user document
    const user = await this.usersService.findById(userId);

    const attempt = new this.attemptModel({
      quiz: new Types.ObjectId(id),
      user: userObjectId,
      score,
      totalQuestions,
      correctAnswersCount,
      pointsEarned,
      answers: savedAnswers,
    });
    await attempt.save();

    const updatedUser = await this.usersService.incrementPoints(
      userId,
      pointsEarned
    );

    const response: SubmitQuizResponseDto = {
      attemptId: attempt._id.toString(),
      score,
      totalQuestions,
      correctAnswersCount,
      pointsEarned,
      updatedUserTotalPoints: updatedUser.totalPoints,
      wrongAnswers,
    };

    return response;
  }

  private stripCorrectAnswers(quiz: any) {
    // Convert to plain object if it's a Mongoose document
    const quizObj =
      typeof quiz.toObject === "function" ? quiz.toObject() : quiz;

    // Process questions
    let questions: any[] = [];
    if (Array.isArray(quizObj.questions)) {
      questions = quizObj.questions
        .map((q: any) => {
          // Skip if it's just an ObjectId (not populated)
          if (
            !q ||
            typeof q === "string" ||
            (q._bsontype && q._bsontype === "ObjectId")
          ) {
            return null;
          }

          // Convert to plain object if it's a Mongoose document
          const questionObj =
            typeof q.toObject === "function" ? q.toObject() : q;

          // Process options
          let options: any[] = [];
          if (
            Array.isArray(questionObj.options) &&
            questionObj.options.length > 0
          ) {
            options = questionObj.options
              .map((opt: any) => {
                // Skip if it's just an ObjectId (not populated)
                if (
                  !opt ||
                  typeof opt === "string" ||
                  (opt._bsontype && opt._bsontype === "ObjectId")
                ) {
                  return null;
                }

                // Convert to plain object if it's a Mongoose document
                const optObj =
                  typeof opt.toObject === "function" ? opt.toObject() : opt;

                return {
                  _id: optObj._id?.toString() || String(optObj._id),
                  text: optObj.text || "",
                };
              })
              .filter((opt: any) => opt !== null);
          }

          return {
            _id: questionObj._id?.toString() || String(questionObj._id),
            text: questionObj.text || "",
            type: questionObj.type || "mcq",
            options: options,
          };
        })
        .filter((q: any) => q !== null);
    }

    return {
      ...quizObj,
      _id: quizObj._id?.toString() || String(quizObj._id),
      questions: questions,
    };
  }

  /**
   * Check if user has completed all quizzes for a specific level
   */
  async checkLevelCompletion(
    level: QuizLevel,
    userId: string
  ): Promise<LevelCompletionResponseDto> {
    const userObjectId = new Types.ObjectId(userId);

    // Get all quizzes for this level
    const quizzesForLevel = await this.quizModel
      .find({ level })
      .select("_id")
      .lean()
      .exec();

    const totalQuizzes = quizzesForLevel.length;

    if (totalQuizzes === 0) {
      return {
        level,
        totalQuizzes: 0,
        completedQuizzes: 0,
        isCompleted: false,
        canGenerateRandom: false,
      };
    }

    const quizIds = quizzesForLevel.map((q) => q._id);

    // Get all unique quizzes the user has attempted for this level
    const userAttempts = await this.attemptModel
      .find({
        user: userObjectId,
        quiz: { $in: quizIds },
      })
      .select("quiz")
      .lean()
      .exec();

    // Get unique quiz IDs the user has attempted
    const completedQuizIds = new Set(
      userAttempts.map((attempt) => {
        const quizId = attempt.quiz as any;
        // Handle both ObjectId and string formats
        return quizId?._id ? quizId._id.toString() : quizId.toString();
      })
    );

    const completedQuizzes = completedQuizIds.size;
    const isCompleted = completedQuizzes >= totalQuizzes;

    return {
      level,
      totalQuizzes,
      completedQuizzes,
      isCompleted,
      canGenerateRandom: isCompleted,
    };
  }

  /**
   * Generate random questions for a specific level
   * This should only be called after user has completed all quizzes for that level
   */
  async generateRandomQuestions(
    dto: GenerateRandomQuestionsDto,
    userId: string
  ): Promise<GenerateRandomQuestionsResponseDto> {
    // First verify user has completed all quizzes for this level
    const completionStatus = await this.checkLevelCompletion(dto.level, userId);

    if (!completionStatus.isCompleted) {
      throw new NotFoundException(
        `You must complete all ${completionStatus.totalQuizzes} quizzes for ${dto.level} level before generating random questions. You have completed ${completionStatus.completedQuizzes}.`
      );
    }

    const questionCount = dto.count || 20;
    const questions = this.generateRandomQuestionsForLevel(
      dto.level,
      questionCount
    );

    return {
      questions,
      level: dto.level,
      count: questionCount,
    };
  }

  /**
   * Generate random questions for a level
   * Creates questions across different subjects for variety
   */
  private generateRandomQuestionsForLevel(
    level: QuizLevel,
    count: number
  ): RandomQuestionDto[] {
    const questions: RandomQuestionDto[] = [];
    const subjects = [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Angular",
      "NodeJS",
    ];

    // Question templates based on level
    const levelTemplates: Record<
      QuizLevel,
      Array<{ question: string; options: string[]; correctIndex: number }>
    > = {
      [QuizLevel.BEGINNER]: [
        {
          question: `What is a basic concept in ${subjects[Math.floor(Math.random() * subjects.length)]}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctIndex: 0,
        },
        {
          question: `Which is the correct syntax for ${level} level?`,
          options: ["Syntax A", "Syntax B", "Syntax C", "Syntax D"],
          correctIndex: 1,
        },
        {
          question: `What does this ${level} code do?`,
          options: ["Action A", "Action B", "Action C", "Action D"],
          correctIndex: 2,
        },
      ],
      [QuizLevel.MIDDLE]: [
        {
          question: `What is an intermediate concept in ${subjects[Math.floor(Math.random() * subjects.length)]}?`,
          options: ["Concept A", "Concept B", "Concept C", "Concept D"],
          correctIndex: 1,
        },
        {
          question: `How do you implement ${level} patterns?`,
          options: ["Pattern A", "Pattern B", "Pattern C", "Pattern D"],
          correctIndex: 2,
        },
      ],
      [QuizLevel.INTERMEDIATE]: [
        {
          question: `What is an advanced concept in ${subjects[Math.floor(Math.random() * subjects.length)]}?`,
          options: ["Advanced A", "Advanced B", "Advanced C", "Advanced D"],
          correctIndex: 2,
        },
        {
          question: `How do you optimize ${level} code?`,
          options: [
            "Optimization A",
            "Optimization B",
            "Optimization C",
            "Optimization D",
          ],
          correctIndex: 3,
        },
      ],
    };

    const templates =
      levelTemplates[level] || levelTemplates[QuizLevel.BEGINNER];

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];

      questions.push({
        text: `${template.question.replace(level, subject)} (Random Question ${i + 1})`,
        type: "mcq",
        options: template.options.map((opt, idx) => ({
          text: opt,
          isCorrect: idx === template.correctIndex,
        })),
      });
    }

    return questions;
  }

  /**
   * Get all quiz attempts for a user
   */
  async getUserAttempts(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const attempts = await this.attemptModel
      .find({ user: userObjectId })
      .populate({
        path: "quiz",
        populate: { path: "subject" },
      })
      .sort({ finishedAt: -1 })
      .lean()
      .exec();

    return attempts.map((attempt: any) => ({
      _id: attempt._id.toString(),
      quiz: {
        _id: attempt.quiz?._id?.toString() || attempt.quiz?.toString(),
        title: attempt.quiz?.title || "Unknown Quiz",
        subject: attempt.quiz?.subject || null,
        level: attempt.quiz?.level || null,
      },
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      correctAnswersCount: attempt.correctAnswersCount,
      pointsEarned: attempt.pointsEarned,
      startedAt: attempt.startedAt,
      finishedAt: attempt.finishedAt,
    }));
  }

  /**
   * Get a specific quiz attempt with full details including answers
   */
  async getAttemptById(attemptId: string, userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const attempt = await this.attemptModel
      .findOne({
        _id: new Types.ObjectId(attemptId),
        user: userObjectId,
      })
      .populate({
        path: "quiz",
        populate: { path: "subject" },
      })
      .lean()
      .exec();

    if (!attempt) {
      throw new NotFoundException("Quiz attempt not found");
    }

    // Extract quiz ID (handle both populated and non-populated cases)
    const quizId = attempt.quiz?._id
      ? attempt.quiz._id.toString()
      : attempt.quiz?.toString() || "";

    if (!quizId) {
      throw new NotFoundException("Quiz ID not found in attempt");
    }

    // Get the quiz with questions
    const quiz = await this.findRaw(quizId);
    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }

    // Fetch questions with options
    let questions: any[] = [];
    if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
      const questionIds = (quiz.questions as any[])
        .map((q: any) => {
          if (typeof q === "string") return new Types.ObjectId(q);
          if (q && q._id) return q._id;
          return q;
        })
        .filter((id: any) => id);

      if (questionIds.length > 0) {
        questions = await this.questionModel
          .find({ _id: { $in: questionIds } })
          .sort({ _id: 1 })
          .lean()
          .exec();

        // Manually fetch options for each question
        questions = await Promise.all(
          questions.map(async (q: any) => {
            if (Array.isArray(q.options) && q.options.length > 0) {
              const optionIds = q.options
                .map((opt: any) => {
                  if (typeof opt === "string") return new Types.ObjectId(opt);
                  if (opt && opt._id) return opt._id;
                  if (opt && opt._bsontype === "ObjectId") return opt;
                  return opt;
                })
                .filter((id: any) => id);

              if (optionIds.length > 0) {
                const fetchedOptions = await this.optionModel
                  .find({ _id: { $in: optionIds } })
                  .lean()
                  .exec();
                q.options = fetchedOptions;
              } else {
                q.options = [];
              }
            } else {
              q.options = [];
            }
            return q;
          })
        );
      }
    }

    // Map answers to questions
    const answersMap = new Map(
      (attempt.answers || []).map((a: any) => {
        const questionId = a.questionId?._id
          ? a.questionId._id.toString()
          : a.questionId?.toString() || "";
        const selectedOptionId = a.selectedOptionId?._id
          ? a.selectedOptionId._id.toString()
          : a.selectedOptionId?.toString() || "";
        return [
          questionId,
          {
            selectedOptionId: selectedOptionId,
            isCorrect: a.isCorrect,
          },
        ];
      })
    );

    const questionsWithAnswers = questions.map((q: any) => {
      const answer = answersMap.get(q._id.toString());
      return {
        _id: q._id.toString(),
        text: q.text,
        type: q.type,
        options: (q.options || []).map((opt: any) => ({
          _id: opt._id.toString(),
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
        userAnswer: answer
          ? {
              selectedOptionId: answer.selectedOptionId,
              isCorrect: answer.isCorrect,
            }
          : null,
      };
    });

    return {
      _id: attempt._id.toString(),
      quiz: {
        _id: quiz._id.toString(),
        title: quiz.title,
        subject: quiz.subject,
        level: quiz.level,
      },
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      correctAnswersCount: attempt.correctAnswersCount,
      pointsEarned: attempt.pointsEarned,
      startedAt: attempt.startedAt,
      finishedAt: attempt.finishedAt,
      questions: questionsWithAnswers,
    };
  }
}
