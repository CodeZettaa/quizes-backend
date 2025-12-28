import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ShareService } from './share.service';
import { CreateShareLinkDto } from './dto/create-share-link.dto';
import { LinkedInPostDto } from './dto/linkedin-post.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  /**
   * POST /share/quiz-attempt
   * Creates a public shareable link for a quiz attempt
   */
  @UseGuards(JwtAuthGuard)
  @Post('share/quiz-attempt')
  async createShareLink(@Body() dto: CreateShareLinkDto) {
    return this.shareService.createShareLink(dto);
  }

  /**
   * GET /share/attempt/:slug
   * Public endpoint to view shared quiz results
   * Returns HTML page with Open Graph tags for LinkedIn preview
   */
  @Get('share/attempt/:slug')
  async getSharePage(@Param('slug') slug: string, @Res() res: Response) {
    try {
      const data = await this.shareService.getAttemptBySlug(slug);

      const { attempt, quiz, subject, user } = data;
      const percentage =
        attempt.totalQuestions > 0
          ? Math.round((attempt.correctAnswersCount / attempt.totalQuestions) * 100)
          : 0;

      const title = `I scored ${attempt.correctAnswersCount}/${attempt.totalQuestions} (${percentage}%) on ${subject?.name || 'Quiz'}!`;
      const description = `${user?.name || 'Someone'} scored ${percentage}% on ${subject?.name || 'a quiz'}! ${attempt.pointsEarned} points earned 🏆`;
      
      // Get frontend base URL for image
      const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:8888';
      const ogImage = `${frontendBaseUrl}/assets/quiz-share-preview.png`; // You can add a default image

      // Generate HTML with Open Graph tags
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  
  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${process.env.FRONTEND_BASE_URL || 'http://localhost:8888'}/share/attempt/${slug}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImage}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${process.env.FRONTEND_BASE_URL || 'http://localhost:8888'}/share/attempt/${slug}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
    }
    h1 {
      color: #333;
      margin-bottom: 20px;
      font-size: 28px;
    }
    .score {
      font-size: 72px;
      font-weight: bold;
      color: #667eea;
      margin: 20px 0;
    }
    .details {
      color: #666;
      font-size: 18px;
      margin: 10px 0;
    }
    .points {
      background: #f0f4ff;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      font-size: 20px;
      color: #667eea;
      font-weight: 600;
    }
    .button {
      display: inline-block;
      margin-top: 30px;
      padding: 15px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 Quiz Result</h1>
    <div class="score">${percentage}%</div>
    <div class="details">
      <p><strong>${attempt.correctAnswersCount}</strong> out of <strong>${attempt.totalQuestions}</strong> correct</p>
      <p>Subject: <strong>${subject?.name || 'Unknown'}</strong></p>
      ${quiz?.level ? `<p>Level: <strong>${quiz.level}</strong></p>` : ''}
    </div>
    <div class="points">
      🏆 ${attempt.pointsEarned} points earned!
    </div>
    <a href="${process.env.FRONTEND_BASE_URL || 'http://localhost:8888'}" class="button">
      Take a Quiz
    </a>
  </div>
</body>
</html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Share Link Not Found</title>
          <style>
            body {
              font-family: sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <h1>Share link not found</h1>
        </body>
        </html>
      `);
    }
  }

  /**
   * POST /social/linkedin/post
   * Optional endpoint to post quiz result directly to LinkedIn
   * Currently returns an error as it's not fully implemented
   */
  @UseGuards(JwtAuthGuard)
  @Post('social/linkedin/post')
  async postToLinkedIn(@Body() dto: LinkedInPostDto) {
    return this.shareService.postToLinkedIn(dto.attemptId);
  }
}

