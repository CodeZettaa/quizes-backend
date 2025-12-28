import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { User, UserDocument } from "../users/user.schema";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { GoogleProfile } from "./strategies/google.strategy";
import { LinkedInProfile } from "./strategies/linkedin.strategy";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { LinkedInAuthGuard } from "./guards/linkedin-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: any) {
    // User is already sanitized (password removed) by JWT strategy
    // Handle both Mongoose documents and plain objects
    if (user && typeof user.toObject === 'function') {
      const { password, ...safeUser } = user.toObject();
      return safeUser;
    }
    // Already a plain object from JWT strategy
    const { password, ...safeUser } = user;
    return safeUser;
  }

  // Google OAuth routes
  @Get("google")
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Initiates Google OAuth flow - Passport handles redirect
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() req: any,
    @Res() res: Response,
    @Query("state") state?: string
  ) {
    try {
      const profile = req.user as GoogleProfile;
      if (!profile) {
        throw new Error("No profile received from Google");
      }

      const result = await this.authService.socialLogin(profile);

      const frontendSuccessUrl = this.configService.get<string>(
        "FRONTEND_SUCCESS_REDIRECT"
      );
      if (!frontendSuccessUrl) {
        throw new Error("FRONTEND_SUCCESS_REDIRECT not configured");
      }

      const redirectUrl = `${frontendSuccessUrl}?token=${result.accessToken}&newUser=${result.newUser}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google OAuth error:", error);
      const frontendFailureUrl =
        this.configService.get<string>("FRONTEND_FAILURE_REDIRECT") ||
        "http://localhost:8888/auth/login";
      res.redirect(`${frontendFailureUrl}?error=social_login_failed`);
    }
  }

  // LinkedIn OAuth routes
  @Get("linkedin")
  @UseGuards(LinkedInAuthGuard)
  linkedinAuth() {
    // Initiates LinkedIn OAuth flow - Passport handles redirect
  }

  @Get("linkedin/callback")
  @UseGuards(LinkedInAuthGuard)
  async linkedinCallback(
    @Req() req: any,
    @Res() res: Response,
    @Query("state") state?: string
  ) {
    try {
      const profile = req.user as LinkedInProfile;
      if (!profile) {
        throw new Error("No profile received from LinkedIn");
      }

      const result = await this.authService.socialLogin(profile);

      const frontendSuccessUrl = this.configService.get<string>(
        "FRONTEND_SUCCESS_REDIRECT"
      );
      if (!frontendSuccessUrl) {
        throw new Error("FRONTEND_SUCCESS_REDIRECT not configured");
      }

      const redirectUrl = `${frontendSuccessUrl}?token=${result.accessToken}&newUser=${result.newUser}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("LinkedIn OAuth error:", error);
      const frontendFailureUrl =
        this.configService.get<string>("FRONTEND_FAILURE_REDIRECT") ||
        "http://localhost:8888/auth/login";
      res.redirect(`${frontendFailureUrl}?error=social_login_failed`);
    }
  }
}
