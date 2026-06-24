import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { IpLog } from "../models/IpLog.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "istiyak_super_secret_token_key";

// Helper to get client IP
function getClientIp(req) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  // Normalize IPv6 localhost to IPv4 standard
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    return "127.0.0.1";
  }
  return ip.split(",")[0].trim();
}

// User Registration Route
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const ip = getClientIp(req);

    // IP Fingerprint check
    let ipLog = await IpLog.findOne({ ip });
    if (ipLog && ipLog.count >= 3) {
      return res.status(403).json({
        error: "Registration limit exceeded for this IP/device (Max 3 accounts per IP).",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = new User({
      email,
      password: hashedPassword,
      registeredIp: ip,
    });
    await newUser.save();

    // Increment or create IP Log
    if (ipLog) {
      ipLog.count += 1;
      await ipLog.save();
    } else {
      ipLog = new IpLog({ ip, count: 1 });
      await ipLog.save();
    }

    // Generate JWT
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      message: "Registration successful",
      token,
      email: newUser.email,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal server error during registration" });
  }
});

// User Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if account is blocked
    if (user.isBlocked) {
      return res.status(403).json({ error: "Access denied. This account has been blocked." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "30d" });

    res.json({
      message: "Login successful",
      token,
      email: user.email,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// Profile endpoint
router.get("/me", authenticateToken, (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    isActive: req.user.isActive,
    isBlocked: req.user.isBlocked,
    createdAt: req.user.createdAt,
  });
});

// Google OAuth login flow (Real flow if credentials configured, otherwise mock)
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3002/api/auth/google/callback";

  if (clientId) {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent("openid email profile")}`;
    return res.redirect(authUrl);
  }

  // Fallback to Mock page
  res.send(`
    <html>
      <head>
        <title>Google Sign-In Mock</title>
        <style>
          body { background: #07080d; color: #f3f4f6; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #12141c; border: 1px solid rgba(255,255,255,0.08); padding: 30px; border-radius: 12px; text-align: center; max-width: 360px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
          .btn { background: #06b6d4; color: #07080d; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-top: 15px; width: 100%; transition: opacity 0.2s; }
          .btn:hover { opacity: 0.9; }
          input { width: 100%; background: #07080d; border: 1px solid rgba(255,255,255,0.08); padding: 8px; color: white; border-radius: 6px; box-sizing: border-box; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Google Account Login</h2>
          <p style="font-size: 12px; color: #a1a1aa;">Sign in securely to ISTIYAK Companion using your Google Account.</p>
          <form action="/api/auth/google/callback" method="GET">
            <input type="email" name="email" required placeholder="name@gmail.com" value="user.google@gmail.com" />
            <button type="submit" class="btn">Authorize Google Login</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

router.get("/google/callback", async (req, res) => {
  const { code, email: queryEmail } = req.query;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3002/api/auth/google/callback";

  let email = queryEmail;

  try {
    // If it's a real OAuth code exchange flow
    if (code && clientId && clientSecret) {
      // Exchange code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok) {
        throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange authorization code");
      }

      // Fetch user profile from userinfo endpoint
      const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const userinfo = await userinfoResponse.json();
      if (!userinfoResponse.ok) {
        throw new Error("Failed to fetch Google userinfo");
      }

      email = userinfo.email;
    }

    if (!email) {
      return res.redirect("/api/auth/oauth-success?error=Email is required");
    }

    let user = await User.findOne({ email });
    if (!user) {
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
      user = new User({
        email,
        password: "OAUTH_LOGIN_GOOGLE",
        registeredIp: ip,
      });
      await user.save();
    }

    if (user.isBlocked) {
      return res.redirect("/api/auth/oauth-success?error=Blocked account");
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "30d" });
    res.redirect(`/api/auth/oauth-success?token=${token}&email=${email}`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    res.redirect(`/api/auth/oauth-success?error=${encodeURIComponent(err.message)}`);
  }
});

// GitHub OAuth login flow (Real flow if credentials configured, otherwise mock)
router.get("/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || "http://localhost:3002/api/auth/github/callback";

  if (clientId) {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent("user:email")}`;
    return res.redirect(authUrl);
  }

  // Fallback to Mock page
  res.send(`
    <html>
      <head>
        <title>GitHub Sign-In Mock</title>
        <style>
          body { background: #07080d; color: #f3f4f6; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #12141c; border: 1px solid rgba(255,255,255,0.08); padding: 30px; border-radius: 12px; text-align: center; max-width: 360px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
          .btn { background: #8b5cf6; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-top: 15px; width: 100%; transition: opacity 0.2s; }
          .btn:hover { opacity: 0.9; }
          input { width: 100%; background: #07080d; border: 1px solid rgba(255,255,255,0.08); padding: 8px; color: white; border-radius: 6px; box-sizing: border-box; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>GitHub Account Login</h2>
          <p style="font-size: 12px; color: #a1a1aa;">Sign in securely to ISTIYAK Companion using your GitHub Account.</p>
          <form action="/api/auth/github/callback" method="GET">
            <input type="email" name="email" required placeholder="username@github.com" value="user.github@github.com" />
            <button type="submit" class="btn">Authorize GitHub Login</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

router.get("/github/callback", async (req, res) => {
  const { code, email: queryEmail } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || "http://localhost:3002/api/auth/github/callback";

  let email = queryEmail;

  try {
    // If it's a real OAuth code exchange flow
    if (code && clientId && clientSecret) {
      // Exchange code for token
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange authorization code");
      }

      // Fetch user profile emails
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
          "User-Agent": "istiyak-companion-backend",
        },
      });

      const emails = await emailsResponse.json();
      if (!emailsResponse.ok || !Array.isArray(emails)) {
        // Fallback to fetch /user if email is public
        const userResponse = await fetch("https://api.github.com/user", {
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`,
            "User-Agent": "istiyak-companion-backend",
          },
        });
        const userdata = await userResponse.json();
        email = userdata.email;
      } else {
        // Select primary/verified email
        const primaryEmailObj = emails.find(e => e.primary && e.verified) || emails.find(e => e.primary) || emails[0];
        email = primaryEmailObj?.email;
      }
    }

    if (!email) {
      return res.redirect("/api/auth/oauth-success?error=Email is required");
    }

    let user = await User.findOne({ email });
    if (!user) {
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
      user = new User({
        email,
        password: "OAUTH_LOGIN_GITHUB",
        registeredIp: ip,
      });
      await user.save();
    }

    if (user.isBlocked) {
      return res.redirect("/api/auth/oauth-success?error=Blocked account");
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "30d" });
    res.redirect(`/api/auth/oauth-success?token=${token}&email=${email}`);
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    res.redirect(`/api/auth/oauth-success?error=${encodeURIComponent(err.message)}`);
  }
});

// OAuth Success landing page redirects back to local agent engine
router.get("/oauth-success", (req, res) => {
  const { token, email, error } = req.query;
  if (error) {
    return res.send(`
      <html>
        <body style="background: #07080d; color: #f87171; font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h2>Authentication Failed</h2>
          <p>\${error}</p>
        </body>
      </html>
    `);
  }

  res.send(`
    <html>
      <body style="background: #07080d; color: #10b981; font-family: sans-serif; text-align: center; padding-top: 50px;">
        <h2>Sign-in Successful!</h2>
        <p style="color: #a1a1aa;">Communicating with your local ISTIYAK Companion client...</p>
        <script>
          fetch("http://localhost:3001/api/watcher/oauth-callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: "${token}", email: "${email}" })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              document.body.innerHTML = '<h2>Connection Complete!</h2><p style="color: #a1a1aa;">Your desktop client is now logged in. You can close this window.</p>';
            } else {
              document.body.innerHTML = '<h2 style="color: #f87171;">Failed to connect</h2><p style="color: #a1a1aa;">Make sure the Companion Engine is running on port 3001.</p>';
            }
          })
          .catch(err => {
            document.body.innerHTML = '<h2 style="color: #f87171;">Failed to connect</h2><p style="color: #a1a1aa;">Local companion engine not reachable. Make sure it is running on port 3001.</p>';
          });
        </script>
      </body>
    </html>
  `);
});

export default router;
