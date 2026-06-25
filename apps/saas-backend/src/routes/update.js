import express from "express";

const router = express.Router();

// Tauri Updater Check Endpoint
// GET /api/update/:target/:current_version
router.get("/:target/:current_version", (req, res) => {
  const { target, current_version } = req.params;

  console.log(`[Tauri Updater] Update check requested from client. Platform: ${target}, Current Version: ${current_version}`);

  // In production, compare with latest release tag in database or GitHub releases
  const LATEST_VERSION = "0.1.0"; // current MVP version

  if (current_version === LATEST_VERSION) {
    // 204 No Content signifies the app is already up to date
    return res.status(204).end();
  }

  // If client version is older, return update instructions
  res.json({
    version: LATEST_VERSION,
    notes: "Maintenance updates, settings dashboard UI optimizations, and secure native directory pickers.",
    pub_date: new Date().toISOString(),
    platforms: {
      "darwin-aarch64": {
        signature: "",
        url: `https://github.com/khairulistiyak/desktop/releases/download/v${LATEST_VERSION}/desktop.app.tar.gz`
      },
      "darwin-x86_64": {
        signature: "",
        url: `https://github.com/khairulistiyak/desktop/releases/download/v${LATEST_VERSION}/desktop.app.tar.gz`
      },
      "windows-x86_64": {
        signature: "",
        url: `https://github.com/khairulistiyak/desktop/releases/download/v${LATEST_VERSION}/desktop.msi.zip`
      },
      "linux-x86_64": {
        signature: "",
        url: `https://github.com/khairulistiyak/desktop/releases/download/v${LATEST_VERSION}/desktop.AppImage.tar.gz`
      }
    }
  });
});

export default router;
