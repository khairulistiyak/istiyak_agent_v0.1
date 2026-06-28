import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { handleRegister, handleLogin } from "../controllers/authController.js";
import { findUserByEmail, createUser } from "../repositories/userRepository.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "istiyak_super_secret_token_key";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Standard register & login routes
router.post("/register", handleRegister);
router.post("/login", handleLogin);

// Helper for rendering Success Page
function renderSuccessPage(res: express.Response, token: string, email: string) {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Authentication Successful</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #07080d;
      color: #f3f4f6;
      font-family: 'Outfit', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      background: rgba(18, 20, 28, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 2.5rem;
      border-radius: 18px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      max-width: 400px;
      width: 100%;
    }
    h1 {
      color: #06b6d4;
      font-size: 1.8rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    p {
      color: #a1a1aa;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .status-connected {
      font-weight: 600;
      color: #10b981;
    }
    .status-error {
      font-weight: 600;
      color: #ef4444;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Authentication Successful</h1>
    <p id="message">Connecting with Istiyak AI Companion application...</p>
  </div>
  <script>
    const token = "${token}";
    const email = "${email}";
    
    fetch("http://localhost:3001/api/watcher/oauth-callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email })
    })
    .then(res => {
      if (res.ok) {
        document.getElementById("message").innerHTML = 'Connected successfully!<br/><br/><span class="status-connected">You can now close this tab and return to the Istiyak AI Companion app.</span>';
      } else {
        document.getElementById("message").innerHTML = '<span class="status-error">Failed to sync with local application. Please make sure the app is running and try again.</span>';
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("message").innerHTML = '<span class="status-error">Could not connect to local application daemon on port 3001. Ensure Istiyak Companion is open.</span>';
    });
  </script>
</body>
</html>
  `);
}

// Google Mock Page Renderer
function renderGoogleMockPage(res: express.Response) {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Google Account Login</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #07080d;
      color: #f3f4f6;
      font-family: 'Outfit', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      background: rgba(18, 20, 28, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 2.5rem;
      border-radius: 18px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      max-width: 400px;
      width: 100%;
    }
    h1 {
      color: #06b6d4;
      font-size: 1.6rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
      text-align: center;
    }
    .subtitle {
      color: #a1a1aa;
      font-size: 0.85rem;
      text-align: center;
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    label {
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #a1a1aa;
      margin-bottom: 0.5rem;
    }
    input {
      width: 100%;
      background: #121318;
      border: 1px solid #1f232b;
      border-radius: 8px;
      padding: 0.75rem;
      color: white;
      font-size: 0.85rem;
      box-sizing: border-box;
      outline: none;
    }
    input:focus {
      border-color: #06b6d4;
    }
    button {
      width: 100%;
      background: #06b6d4;
      color: #07080d;
      border: none;
      border-radius: 8px;
      padding: 0.75rem;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      margin-top: 1rem;
      transition: all 0.2s;
    }
    button:hover {
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.5);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Google Account Login</h1>
    <div class="subtitle">Google Sign-In Mock for local development</div>
    <form action="/api/auth/google/callback" method="POST">
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" name="email" value="google.mock.user@example.com" required />
      </div>
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" name="name" value="Mock Google User" required />
      </div>
      <button type="submit">SIGN IN WITH GOOGLE</button>
    </form>
  </div>
</body>
</html>
  `);
}

// GitHub Mock Page Renderer
function renderGithubMockPage(res: express.Response) {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>GitHub Account Login</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #07080d;
      color: #f3f4f6;
      font-family: 'Outfit', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      background: rgba(18, 20, 28, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 2.5rem;
      border-radius: 18px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      max-width: 400px;
      width: 100%;
    }
    h1 {
      color: #8b5cf6;
      font-size: 1.6rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
      text-align: center;
    }
    .subtitle {
      color: #a1a1aa;
      font-size: 0.85rem;
      text-align: center;
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    label {
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #a1a1aa;
      margin-bottom: 0.5rem;
    }
    input {
      width: 100%;
      background: #121318;
      border: 1px solid #1f232b;
      border-radius: 8px;
      padding: 0.75rem;
      color: white;
      font-size: 0.85rem;
      box-sizing: border-box;
      outline: none;
    }
    input:focus {
      border-color: #8b5cf6;
    }
    button {
      width: 100%;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.75rem;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      margin-top: 1rem;
      transition: all 0.2s;
    }
    button:hover {
      box-shadow: 0 0 12px rgba(139, 92, 246, 0.5);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>GitHub Account Login</h1>
    <div class="subtitle">GitHub Sign-In Mock for local development</div>
    <form action="/api/auth/github/callback" method="POST">
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" name="email" value="github.mock.user@example.com" required />
      </div>
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" name="name" value="Mock GitHub User" required />
      </div>
      <button type="submit">SIGN IN WITH GITHUB</button>
    </form>
  </div>
</body>
</html>
  `);
}

// Google Auth routes
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    (req: any, res) => {
      const user = req.user;
      const token = jwt.sign({ userId: user.id || user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      renderSuccessPage(res, token, user.email);
    }
  );
} else {
  // Google Sign-In Mock support
  router.get("/google", (req, res) => {
    renderGoogleMockPage(res);
  });
  
  router.post("/google/callback", async (req, res, next) => {
    try {
      const { email, name } = req.body;
      let user = await findUserByEmail(email);
      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-12);
        user = await createUser({
          email,
          password: randomPassword,
          name: name || "Mock Google User",
          registeredIp: req.ip || "127.0.0.1"
        });
      }
      const token = jwt.sign({ userId: user.id || user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      renderSuccessPage(res, token, user.email);
    } catch (err) {
      next(err);
    }
  });

  router.get("/google/callback", async (req, res, next) => {
    try {
      const email = (req.query.email as string) || "google.mock.user@example.com";
      const name = (req.query.name as string) || "Mock Google User";
      let user = await findUserByEmail(email);
      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-12);
        user = await createUser({
          email,
          password: randomPassword,
          name,
          registeredIp: req.ip || "127.0.0.1"
        });
      }
      const token = jwt.sign({ userId: user.id || user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      renderSuccessPage(res, token, user.email);
    } catch (err) {
      next(err);
    }
  });
}

// GitHub Auth routes
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
  router.get(
    "/github/callback",
    passport.authenticate("github", { session: false, failureRedirect: "/login" }),
    (req: any, res) => {
      const user = req.user;
      const token = jwt.sign({ userId: user.id || user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      renderSuccessPage(res, token, user.email);
    }
  );
} else {
  // GitHub Sign-In Mock support
  router.get("/github", (req, res) => {
    renderGithubMockPage(res);
  });
  
  router.post("/github/callback", async (req, res, next) => {
    try {
      const { email, name } = req.body;
      let user = await findUserByEmail(email);
      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-12);
        user = await createUser({
          email,
          password: randomPassword,
          name: name || "Mock GitHub User",
          registeredIp: req.ip || "127.0.0.1"
        });
      }
      const token = jwt.sign({ userId: user.id || user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      renderSuccessPage(res, token, user.email);
    } catch (err) {
      next(err);
    }
  });

  router.get("/github/callback", async (req, res, next) => {
    try {
      const email = (req.query.email as string) || "github.mock.user@example.com";
      const name = (req.query.name as string) || "Mock GitHub User";
      let user = await findUserByEmail(email);
      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-12);
        user = await createUser({
          email,
          password: randomPassword,
          name,
          registeredIp: req.ip || "127.0.0.1"
        });
      }
      const token = jwt.sign({ userId: user.id || user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      renderSuccessPage(res, token, user.email);
    } catch (err) {
      next(err);
    }
  });
}

export default router;
