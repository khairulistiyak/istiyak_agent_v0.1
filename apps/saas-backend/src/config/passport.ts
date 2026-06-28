import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { findUserByEmail, createUser } from "../repositories/userRepository.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3002/api/auth/google/callback";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || "http://localhost:3002/api/auth/github/callback";

export function initPassport() {
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email found in Google profile"));
            }
            let user = await findUserByEmail(email);
            if (!user) {
              const randomPassword = Math.random().toString(36).slice(-12);
              user = await createUser({
                email,
                password: randomPassword,
                name: profile.displayName || profile.name?.givenName || "Google User",
                registeredIp: "127.0.0.1"
              });
            }
            return done(null, user);
          } catch (err) {
            return done(err as Error);
          }
        }
      )
    );
    console.log("✅ Google OAuth Passport Strategy initialized.");
  } else {
    console.log("⚠️ Google OAuth credentials missing. Google strategy disabled.");
  }

  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET,
          callbackURL: GITHUB_CALLBACK_URL,
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.mock.com`;
            let user = await findUserByEmail(email);
            if (!user) {
              const randomPassword = Math.random().toString(36).slice(-12);
              user = await createUser({
                email,
                password: randomPassword,
                name: profile.displayName || profile.username || "GitHub User",
                registeredIp: "127.0.0.1"
              });
            }
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
    console.log("✅ GitHub OAuth Passport Strategy initialized.");
  } else {
    console.log("⚠️ GitHub OAuth credentials missing. GitHub strategy disabled.");
  }
}
