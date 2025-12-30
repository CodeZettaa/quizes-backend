import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-oauth2";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

export interface LinkedInProfile {
  provider: "linkedin";
  providerUserId: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
}

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, "linkedin") {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>("LINKEDIN_CLIENT_ID") || "dummy";
    const clientSecret =
      configService.get<string>("LINKEDIN_CLIENT_SECRET") || "dummy";
    const callbackURL =
      configService.get<string>("LINKEDIN_CALLBACK_URL") ||
      "http://localhost:3000/api/auth/linkedin/callback";

    if (clientID === "dummy" || clientSecret === "dummy") {
      console.warn(
        "[LinkedInStrategy] OAuth credentials not configured. LinkedIn login will not work."
      );
    }

    super({
      authorizationURL: "https://www.linkedin.com/oauth/v2/authorization",
      tokenURL: "https://www.linkedin.com/oauth/v2/accessToken",
      clientID,
      clientSecret,
      callbackURL,
      scope: ["openid", "profile", "email"],
      state: true, // Enable state parameter for security
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: LinkedInProfile) => void
  ): Promise<void> {
    try {
      console.log("[LinkedInStrategy] Validating with access token");

      // Try LinkedIn OIDC userinfo endpoint first
      let userInfo: any;
      try {
        const response = await axios.get(
          "https://api.linkedin.com/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        userInfo = response.data;
        console.log(
          "[LinkedInStrategy] User info from userinfo endpoint:",
          JSON.stringify(userInfo, null, 2)
        );
      } catch (userinfoError: any) {
        console.error("[LinkedInStrategy] userinfo endpoint failed:", {
          status: userinfoError?.response?.status,
          statusText: userinfoError?.response?.statusText,
          data: userinfoError?.response?.data,
          headers: userinfoError?.response?.headers,
        });

        // Fallback to profile endpoint if userinfo fails
        try {
          const profileResponse = await axios.get(
            "https://api.linkedin.com/v2/me",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log(
            "[LinkedInStrategy] Profile response:",
            JSON.stringify(profileResponse.data, null, 2)
          );

          let email = null;
          try {
            const emailResponse = await axios.get(
              "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            email =
              emailResponse?.data?.elements?.[0]?.["handle~"]?.emailAddress ||
              null;
          } catch (emailError: any) {
            console.warn("[LinkedInStrategy] Email endpoint failed:", {
              status: emailError?.response?.status,
              data: emailError?.response?.data,
            });
          }

          userInfo = {
            sub: profileResponse.data.id,
            id: profileResponse.data.id,
            name: `${profileResponse.data.localizedFirstName || ""} ${profileResponse.data.localizedLastName || ""}`.trim(),
            email: email,
            picture:
              profileResponse.data.profilePicture?.["displayImage~"]
                ?.elements?.[0]?.identifiers?.[0]?.identifier || null,
          };
          console.log(
            "[LinkedInStrategy] User info from profile endpoint:",
            JSON.stringify(userInfo, null, 2)
          );
        } catch (profileError: any) {
          console.error("[LinkedInStrategy] Profile endpoint also failed:", {
            status: profileError?.response?.status,
            statusText: profileError?.response?.statusText,
            data: profileError?.response?.data,
          });
          throw new Error(
            `LinkedIn API error: ${profileError?.response?.status} - ${profileError?.response?.statusText || profileError?.message}`
          );
        }
      }

      if (!userInfo.sub && !userInfo.id) {
        throw new Error("LinkedIn userinfo missing user ID");
      }

      const payload: LinkedInProfile = {
        provider: "linkedin",
        providerUserId: userInfo.sub || userInfo.id,
        email: userInfo.email || null,
        name:
          userInfo.name ||
          (userInfo.given_name && userInfo.family_name
            ? `${userInfo.given_name} ${userInfo.family_name}`
            : userInfo.given_name || userInfo.family_name || null),
        avatarUrl: userInfo.picture || null,
      };

      console.log(
        "[LinkedInStrategy] Created profile payload:",
        JSON.stringify(payload, null, 2)
      );
      done(null, payload);
    } catch (error: any) {
      console.error("[LinkedInStrategy] Validation error:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        config: {
          url: error?.config?.url,
          method: error?.config?.method,
        },
      });
      done(error, undefined);
    }
  }
}
