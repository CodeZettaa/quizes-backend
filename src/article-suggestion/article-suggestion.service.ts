import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuestionDocument } from '../quizzes/question.schema';
import { ArticleRecommendationDto, ArticleProvider, ArticleLevel } from './dto/article-recommendation.dto';
import { SubjectName } from '../common/constants/subject-type.enum';
import { QuizLevel } from '../common/constants/quiz-level.enum';

@Injectable()
export class ArticleSuggestionService {
  constructor(private configService: ConfigService) {
    // Check if AI_API_KEY is set (even if we don't use it yet)
    const aiApiKey = this.configService.get<string>('AI_API_KEY');
    if (!aiApiKey) {
      console.log('[ArticleSuggestionService] AI_API_KEY not set, using stub implementation');
    }
  }

  async getSuggestionsForQuestion(
    question: QuestionDocument | any,
    subject: string | SubjectName,
    level: string | QuizLevel,
  ): Promise<ArticleRecommendationDto[]> {
    // First, check if question has pre-filled learningResources
    if (question.learningResources && Array.isArray(question.learningResources) && question.learningResources.length > 0) {
      return this.mapLearningResourcesToDto(question.learningResources);
    }

    // Otherwise, use AI-based stub (or real AI if implemented)
    return this.generateUsingAI(question, subject, level);
  }

  private mapLearningResourcesToDto(resources: any[]): ArticleRecommendationDto[] {
    return resources.map((resource, index) => ({
      id: resource.id || `article-${Date.now()}-${index}`,
      title: resource.title,
      url: resource.url,
      provider: resource.provider || ArticleProvider.BLOG,
      estimatedReadingTimeMinutes: resource.estimatedReadingTimeMinutes,
      subject: resource.subject,
      level: resource.level,
    }));
  }

  private async generateUsingAI(
    question: QuestionDocument | any,
    subject: string | SubjectName,
    level: string | QuizLevel,
  ): Promise<ArticleRecommendationDto[]> {
    // For now, use stub implementation based on topicSlug or subject
    const topicSlug = question.topicSlug;
    const subjectName = typeof subject === 'string' ? subject : (subject as SubjectName);
    const levelName = typeof level === 'string' ? level : (level as QuizLevel);

    // Use topicSlug if available, otherwise fall back to subject-based suggestions
    if (topicSlug) {
      return this.getSuggestionsByTopicSlug(topicSlug, subjectName, levelName);
    }

    return this.getSuggestionsBySubject(subjectName, levelName);
  }

  private getSuggestionsByTopicSlug(
    topicSlug: string,
    subject: string,
    level: string,
  ): ArticleRecommendationDto[] {
    // Map common topic slugs to articles
    const topicMap: Record<string, ArticleRecommendationDto[]> = {
      'html-forms': [
        {
          id: 'mdn-html-forms',
          title: 'HTML Forms - MDN Web Docs',
          url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form',
          provider: ArticleProvider.MDN,
          estimatedReadingTimeMinutes: 15,
          subject: 'HTML',
          level: level as ArticleLevel,
        },
        {
          id: 'fcc-html-forms',
          title: 'Learn HTML Forms - FreeCodeCamp',
          url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/learn-html-forms-by-building-a-registration-form/',
          provider: ArticleProvider.FREECODECAMP,
          estimatedReadingTimeMinutes: 30,
          subject: 'HTML',
          level: level as ArticleLevel,
        },
      ],
      'css-flexbox': [
        {
          id: 'mdn-flexbox',
          title: 'CSS Flexbox - MDN Web Docs',
          url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout',
          provider: ArticleProvider.MDN,
          estimatedReadingTimeMinutes: 20,
          subject: 'CSS',
          level: level as ArticleLevel,
        },
        {
          id: 'fcc-flexbox',
          title: 'Learn CSS Flexbox - FreeCodeCamp',
          url: 'https://www.freecodecamp.org/news/flexbox-the-ultimate-css-flex-cheatsheet/',
          provider: ArticleProvider.FREECODECAMP,
          estimatedReadingTimeMinutes: 25,
          subject: 'CSS',
          level: level as ArticleLevel,
        },
      ],
      'js-closures': [
        {
          id: 'mdn-closures',
          title: 'Closures - MDN Web Docs',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures',
          provider: ArticleProvider.MDN,
          estimatedReadingTimeMinutes: 15,
          subject: 'JavaScript',
          level: level as ArticleLevel,
        },
        {
          id: 'fcc-closures',
          title: 'Understanding JavaScript Closures - FreeCodeCamp',
          url: 'https://www.freecodecamp.org/news/javascript-closures-explained/',
          provider: ArticleProvider.FREECODECAMP,
          estimatedReadingTimeMinutes: 20,
          subject: 'JavaScript',
          level: level as ArticleLevel,
        },
      ],
      'angular-signals': [
        {
          id: 'angular-signals-docs',
          title: 'Angular Signals - Official Documentation',
          url: 'https://angular.dev/guide/signals',
          provider: ArticleProvider.BLOG,
          estimatedReadingTimeMinutes: 30,
          subject: 'Angular',
          level: level as ArticleLevel,
        },
        {
          id: 'angular-signals-blog',
          title: 'Understanding Angular Signals - Angular Blog',
          url: 'https://blog.angular.io/introducing-angular-signals-4a5b4a8c3c5a',
          provider: ArticleProvider.BLOG,
          estimatedReadingTimeMinutes: 25,
          subject: 'Angular',
          level: level as ArticleLevel,
        },
      ],
    };

    return topicMap[topicSlug] || this.getSuggestionsBySubject(subject, level);
  }

  private getSuggestionsBySubject(
    subject: string,
    level: string,
  ): ArticleRecommendationDto[] {
    const suggestions: Record<string, ArticleRecommendationDto[]> = {
      HTML: [
        {
          id: `mdn-html-${level}-1`,
          title: 'HTML: HyperText Markup Language - MDN',
          url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
          provider: ArticleProvider.MDN,
          estimatedReadingTimeMinutes: 20,
          subject: 'HTML',
          level: level as ArticleLevel,
        },
        {
          id: `fcc-html-${level}-1`,
          title: 'Learn HTML - FreeCodeCamp',
          url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
          provider: ArticleProvider.FREECODECAMP,
          estimatedReadingTimeMinutes: 40,
          subject: 'HTML',
          level: level as ArticleLevel,
        },
        {
          id: `w3-html-${level}-1`,
          title: 'HTML Tutorial - W3Schools',
          url: 'https://www.w3schools.com/html/',
          provider: ArticleProvider.W3SCHOOLS,
          estimatedReadingTimeMinutes: 30,
          subject: 'HTML',
          level: level as ArticleLevel,
        },
      ],
      CSS: [
        {
          id: `mdn-css-${level}-1`,
          title: 'CSS: Cascading Style Sheets - MDN',
          url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
          provider: ArticleProvider.MDN,
          estimatedReadingTimeMinutes: 25,
          subject: 'CSS',
          level: level as ArticleLevel,
        },
        {
          id: `fcc-css-${level}-1`,
          title: 'Learn CSS - FreeCodeCamp',
          url: 'https://www.freecodecamp.org/news/css-basics-everything-you-need-to-know/',
          provider: ArticleProvider.FREECODECAMP,
          estimatedReadingTimeMinutes: 35,
          subject: 'CSS',
          level: level as ArticleLevel,
        },
        {
          id: `w3-css-${level}-1`,
          title: 'CSS Tutorial - W3Schools',
          url: 'https://www.w3schools.com/css/',
          provider: ArticleProvider.W3SCHOOLS,
          estimatedReadingTimeMinutes: 30,
          subject: 'CSS',
          level: level as ArticleLevel,
        },
      ],
      JavaScript: [
        {
          id: `mdn-js-${level}-1`,
          title: 'JavaScript - MDN Web Docs',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
          provider: ArticleProvider.MDN,
          estimatedReadingTimeMinutes: 30,
          subject: 'JavaScript',
          level: level as ArticleLevel,
        },
        {
          id: `fcc-js-${level}-1`,
          title: 'Learn JavaScript - FreeCodeCamp',
          url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
          provider: ArticleProvider.FREECODECAMP,
          estimatedReadingTimeMinutes: 50,
          subject: 'JavaScript',
          level: level as ArticleLevel,
        },
        {
          id: `w3-js-${level}-1`,
          title: 'JavaScript Tutorial - W3Schools',
          url: 'https://www.w3schools.com/js/',
          provider: ArticleProvider.W3SCHOOLS,
          estimatedReadingTimeMinutes: 40,
          subject: 'JavaScript',
          level: level as ArticleLevel,
        },
      ],
      Angular: [
        {
          id: `angular-docs-${level}-1`,
          title: 'Angular Documentation',
          url: 'https://angular.dev',
          provider: ArticleProvider.BLOG,
          estimatedReadingTimeMinutes: 45,
          subject: 'Angular',
          level: level as ArticleLevel,
        },
        {
          id: `angular-tutorial-${level}-1`,
          title: 'Angular Tutorial - Official Guide',
          url: 'https://angular.dev/tutorials/first-app',
          provider: ArticleProvider.BLOG,
          estimatedReadingTimeMinutes: 60,
          subject: 'Angular',
          level: level as ArticleLevel,
        },
      ],
      React: [
        {
          id: `react-docs-${level}-1`,
          title: 'React Documentation',
          url: 'https://react.dev',
          provider: ArticleProvider.BLOG,
          estimatedReadingTimeMinutes: 40,
          subject: 'React',
          level: level as ArticleLevel,
        },
        {
          id: `react-tutorial-${level}-1`,
          title: 'Learn React - Official Tutorial',
          url: 'https://react.dev/learn',
          provider: ArticleProvider.BLOG,
          estimatedReadingTimeMinutes: 50,
          subject: 'React',
          level: level as ArticleLevel,
        },
      ],
      NextJS: [
        {
          id: `nextjs-docs-${level}-1`,
          title: 'Next.js Documentation',
          url: 'https://nextjs.org/docs',
          provider: ArticleProvider.BLOG,
          estimatedReadingTimeMinutes: 50,
          subject: 'NextJS',
          level: level as ArticleLevel,
        },
        {
          id: `nextjs-learn-${level}-1`,
          title: 'Learn Next.js',
          url: 'https://nextjs.org/learn',
          provider: ArticleProvider.BLOG,
          estimatedReadingTimeMinutes: 60,
          subject: 'NextJS',
          level: level as ArticleLevel,
        },
      ],
      NestJS: [
        {
          id: `nestjs-docs-${level}-1`,
          title: 'NestJS Documentation',
          url: 'https://docs.nestjs.com',
          provider: ArticleProvider.BLOG,
          estimatedReadingTimeMinutes: 45,
          subject: 'NestJS',
          level: level as ArticleLevel,
        },
        {
          id: `nestjs-overview-${level}-1`,
          title: 'NestJS Overview',
          url: 'https://docs.nestjs.com/first-steps',
          provider: ArticleProvider.BLOG,
          estimatedReadingTimeMinutes: 30,
          subject: 'NestJS',
          level: level as ArticleLevel,
        },
      ],
      NodeJS: [
        {
          id: `nodejs-docs-${level}-1`,
          title: 'Node.js Documentation',
          url: 'https://nodejs.org/docs',
          provider: ArticleProvider.BLOG,
          estimatedReadingTimeMinutes: 40,
          subject: 'NodeJS',
          level: level as ArticleLevel,
        },
        {
          id: `nodejs-guide-${level}-1`,
          title: 'The Node.js Guide',
          url: 'https://nodejs.org/en/docs/guides/',
          provider: ArticleProvider.BLOG,
          estimatedReadingTimeMinutes: 50,
          subject: 'NodeJS',
          level: level as ArticleLevel,
        },
      ],
    };

    return suggestions[subject] || [
      {
        id: `generic-${subject.toLowerCase()}-${level}-1`,
        title: `Learn ${subject} - General Resources`,
        url: 'https://developer.mozilla.org',
        provider: ArticleProvider.MDN,
        estimatedReadingTimeMinutes: 30,
        subject: subject,
        level: level as ArticleLevel,
      },
    ];
  }

  /**
   * Future: Real AI integration
   * This method can be implemented to call an actual AI API
   */
  private async generateUsingRealAI(
    question: QuestionDocument | any,
    subject: string,
    level: string,
  ): Promise<ArticleRecommendationDto[]> {
    const aiApiKey = this.configService.get<string>('AI_API_KEY');
    if (!aiApiKey) {
      throw new Error('AI_API_KEY not configured');
    }

    // TODO: Implement real AI API call
    // Example prompt:
    // "Suggest 3 high-quality, free articles to learn about [topic] suitable for [level] developers..."
    
    // For now, return empty array
    return [];
  }
}

