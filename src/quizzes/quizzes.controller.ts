import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { QuizzesService } from "./quizzes.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "../common/constants/roles.enum";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserId } from "../common/decorators/user-id.decorator";
import { UserDocument } from "../users/user.schema";
import { SubmitQuizDto } from "./dto/submit-quiz.dto";
import { SubmitQuizResponseDto } from "./dto/submit-quiz-response.dto";
import { LevelCompletionResponseDto } from "./dto/check-level-completion.dto";
import {
  GenerateRandomQuestionsDto,
  GenerateRandomQuestionsResponseDto,
} from "./dto/generate-random-questions.dto";

@UseGuards(JwtAuthGuard)
@Controller("quizzes")
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  findAll(
    @Query("subjectId") subjectId?: string,
    @Query("level") level?: string,
    @UserId() userId?: string
  ) {
    return this.quizzesService.findAll({ subjectId, level }, userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.quizzesService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateQuizDto, @CurrentUser() user: UserDocument) {
    return this.quizzesService.create(dto, user);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateQuizDto,
    @CurrentUser() user: UserDocument
  ) {
    return this.quizzesService.update(id, dto, user);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.quizzesService.remove(id);
  }

  @Post(":id/submit")
  async submit(
    @Param("id") id: string,
    @Body() dto: SubmitQuizDto,
    @UserId() userId: string
  ): Promise<SubmitQuizResponseDto> {
    return this.quizzesService.submit(id, dto, userId);
  }

  /**
   * GET /quizzes/level/:level/completion
   * Check if user has completed all quizzes for a specific level
   */
  @Get("level/:level/completion")
  async checkLevelCompletion(
    @Param("level") level: string,
    @UserId() userId: string
  ): Promise<LevelCompletionResponseDto> {
    return this.quizzesService.checkLevelCompletion(level as any, userId);
  }

  /**
   * POST /quizzes/generate-random-questions
   * Generate random questions for a level (only if user completed all quizzes for that level)
   * User must choose the level first
   */
  @Post("generate-random-questions")
  async generateRandomQuestions(
    @Body() dto: GenerateRandomQuestionsDto,
    @UserId() userId: string
  ): Promise<GenerateRandomQuestionsResponseDto> {
    return this.quizzesService.generateRandomQuestions(dto, userId);
  }

  /**
   * GET /quizzes/attempts/my
   * Get all quiz attempts for the current user
   */
  @Get("attempts/my")
  async getMyAttempts(@UserId() userId: string) {
    return this.quizzesService.getUserAttempts(userId);
  }

  /**
   * GET /quizzes/attempts/:attemptId
   * Get a specific quiz attempt with full details including answers
   */
  @Get("attempts/:attemptId")
  async getAttemptById(
    @Param("attemptId") attemptId: string,
    @UserId() userId: string
  ) {
    return this.quizzesService.getAttemptById(attemptId, userId);
  }
}
