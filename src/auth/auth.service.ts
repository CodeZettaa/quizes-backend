import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { User, UserDocument } from "../users/user.schema";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UserRole } from "../common/constants/roles.enum";
import {
  SocialAccount,
  SocialAccountDocument,
} from "./schemas/social-account.schema";
import { GoogleProfile } from "./strategies/google.strategy";
import { LinkedInProfile } from "./strategies/linkedin.strategy";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(SocialAccount.name)
    private socialAccountModel: Model<SocialAccountDocument>,
    private jwtService: JwtService
  ) {}

  async register(payload: RegisterDto) {
    const existing = await this.userModel.findOne({ email: payload.email });
    if (existing) {
      throw new BadRequestException("Email already in use");
    }
    const hashed = await bcrypt.hash(payload.password, 10);
    const { selectedSubjects, ...userData } = payload;
    const user = new this.userModel({
      ...userData,
      password: hashed,
      role: UserRole.STUDENT,
      selectedSubjects: selectedSubjects || [],
    });
    await user.save();
    return this.buildAuthResponse(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) return null;
    if (!user.password) return null; // Social-only users can't use password login
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    return user;
  }

  async login(payload: LoginDto) {
    const user = await this.validateUser(payload.email, payload.password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return this.buildAuthResponse(user);
  }

  async socialLogin(
    payload: GoogleProfile | LinkedInProfile
  ): Promise<{ accessToken: string; user: any; newUser: boolean }> {
    // 1. Find SocialAccount by (provider, providerUserId)
    let socialAccount = await this.socialAccountModel.findOne({
      provider: payload.provider,
      providerUserId: payload.providerUserId,
    });

    let user: UserDocument | null = null;
    let newUser = false;

    if (socialAccount) {
      // SocialAccount exists => get linked user
      user = await this.userModel.findById(socialAccount.userId);
      if (!user) {
        // Orphaned SocialAccount (user was deleted but account wasn't)
        // Delete the orphaned account and continue to create/link logic below
        console.warn(
          `Orphaned SocialAccount found for ${payload.provider}:${payload.providerUserId}, removing it`
        );
        await this.socialAccountModel.deleteOne({ _id: socialAccount._id });
        socialAccount = null;
      }
    }
    
    if (!socialAccount && payload.email) {
      // 2. Try to find User by email
      user = await this.userModel.findOne({ email: payload.email });
      if (user) {
        // Link SocialAccount to existing user
        socialAccount = new this.socialAccountModel({
          userId: user._id,
          provider: payload.provider,
          providerUserId: payload.providerUserId,
          email: payload.email,
        });
        await socialAccount.save();
      }
    }

    if (!user) {
      // 3. Create new User and SocialAccount
      newUser = true;
      // Extract name from email if not provided by social provider
      let userName = payload.name;
      if (!userName && payload.email) {
        // Use email prefix (before @) as fallback name
        userName = payload.email.split("@")[0];
        // Capitalize first letter
        userName = userName.charAt(0).toUpperCase() + userName.slice(1);
      }
      if (!userName) {
        userName = "User"; // Fallback to "User" instead of "New User"
      }

      user = new this.userModel({
        name: userName,
        email: payload.email || null,
        password: null, // Social-only user
        role: UserRole.STUDENT,
        avatarUrl: payload.avatarUrl || null,
        totalPoints: 0,
      });
      await user.save();

      socialAccount = new this.socialAccountModel({
        userId: user._id,
        provider: payload.provider,
        providerUserId: payload.providerUserId,
        email: payload.email || null,
      });
      await socialAccount.save();
    } else {
      // Update user info if needed (avatar, name)
      const updates: any = {};
      if (payload.avatarUrl && !user.avatarUrl) {
        updates.avatarUrl = payload.avatarUrl;
      }
      // Always update name if social provider provides a valid name
      // This ensures the name stays in sync with the social account
      if (payload.name && payload.name.trim()) {
        const currentName = user.name?.trim() || "";
        const newName = payload.name.trim();

        // Update if name is different and either:
        // 1. Current name is generic ("New User", "User", or email prefix)
        // 2. Current name is empty
        // 3. New name from social provider is different (to sync changes)
        const isGenericName =
          currentName === "New User" ||
          currentName === "User" ||
          (payload.email && currentName === payload.email.split("@")[0]);

        if (
          newName !== currentName &&
          (isGenericName || !currentName || newName.length > currentName.length)
        ) {
          updates.name = newName;
        }
      }
      if (Object.keys(updates).length > 0) {
        await this.userModel.findByIdAndUpdate(user._id, updates);
        const updatedUser = await this.userModel.findById(user._id);
        if (updatedUser) {
          user = updatedUser;
        }
      }
    }

    if (!user) {
      throw new BadRequestException("Failed to create or retrieve user");
    }

    return this.buildAuthResponse(user, newUser);
  }

  private buildAuthResponse(
    user: UserDocument,
    newUser = false
  ): { accessToken: string; user: any; newUser: boolean } {
    const token = this.jwtService.sign({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    const { password, ...safeUser } = user.toObject();
    return { accessToken: token, user: safeUser, newUser };
  }
}
