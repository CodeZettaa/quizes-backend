import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UserId } from "../common/decorators/user-id.decorator";
import { QuizzesService } from "./quizzes.service";

@UseGuards(JwtAuthGuard)
@Controller("attempts")
export class AttemptsController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get(":attemptId")
  getAttemptById(
    @Param("attemptId") attemptId: string,
    @UserId() userId: string
  ) {
    return this.quizzesService.getAttemptById(attemptId, userId);
  }
}
