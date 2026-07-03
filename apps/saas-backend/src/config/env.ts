import dotenv from "dotenv";

// Load environment variables immediately on import to ensure they are available
// to other modules during their evaluation phase (ESM module load time).
dotenv.config();
console.log("🌱 Environment variables loaded early via config/env.ts");
