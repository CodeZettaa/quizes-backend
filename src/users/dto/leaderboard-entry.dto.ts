export class LeaderboardEntryDto {
  rank!: number;
  userId!: string;
  name!: string;
  avatarUrl?: string | null;
  totalPoints!: number;
}

