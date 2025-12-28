export class PerSubjectStatsDto {
  subject!: string;
  quizzesTaken!: number;
  averageScore!: number; // 0-100
  totalPoints!: number;
}

export class UserStatsDto {
  totalQuizzesTaken!: number;
  totalCorrectAnswers!: number;
  totalQuestionsAnswered!: number;
  streakDays!: number;
  perSubjectStats!: PerSubjectStatsDto[];
}

