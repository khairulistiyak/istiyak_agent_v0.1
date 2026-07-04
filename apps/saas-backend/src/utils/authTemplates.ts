import express from "express";

export function renderSuccessPage(res: express.Response, token: string, email: string) {
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
    const token = ${JSON.stringify(token)};
    const email = ${JSON.stringify(email)};
    
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

export function renderNotConfiguredPage(res: express.Response, provider: string) {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>${provider} Not Configured</title>
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
      max-width: 420px;
      width: 100%;
    }
    h1 { color: #f59e0b; font-size: 1.5rem; margin-bottom: 1rem; font-weight: 600; }
    p { color: #a1a1aa; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; }
    code { background: #1a1b1e; color: #22d3ee; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.8rem; }
    .env-box {
      background: #0d0e10;
      border: 1px solid #1e2533;
      border-radius: 12px;
      padding: 1rem;
      text-align: left;
      font-family: monospace;
      font-size: 0.75rem;
      color: #94a3b8;
      line-height: 1.8;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚠️ ${provider} OAuth Not Configured</h1>
    <p>To enable ${provider} sign-in, add the following environment variables to your <code>apps/saas-backend/.env</code> file:</p>
    <div class="env-box">
${
  provider === "Google"
    ? `GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3002/api/auth/google/callback`
    : `GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3002/api/auth/github/callback`
}
    </div>
  </div>
</body>
</html>
  `);
}
