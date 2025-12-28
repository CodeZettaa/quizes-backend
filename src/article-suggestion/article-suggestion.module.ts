import { Module } from '@nestjs/common';
import { ArticleSuggestionService } from './article-suggestion.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ArticleSuggestionService],
  exports: [ArticleSuggestionService],
})
export class ArticleSuggestionModule {}

