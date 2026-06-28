import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../repositories/userRepository.js";
import { logIpAddress, getIpLog } from "../repositories/ipLogRepository.js";

const JWT_SECRET = process.env.JWT_SECRET || "istiyak_super_secret_token_key";

export async function registerUser(email: string, password: string, name: string, ip: string) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("User with this email already exists.");
  }

  // Enforce IP Fingerprint rule: max 3 registrations per IP
  const ipLog = await getIpLog(ip);
  if (ipLog && ipLog.count >= 3) {
    throw new Error("IP registration limit exceeded. Only 3 free accounts allowed per IP.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({ email, password: hashedPassword, name, registeredIp: ip });
  await logIpAddress(user.id || user._id, ip);

  const token = jwt.sign({ userId: user.id || user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

  return { 
    status: "success", 
    token, 
    user: { id: user.id || user._id, email: user.email, name: user.name } 
  };
}

export async function loginUser(email: string, password: string, ip: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
  if (!isMatch) {
    throw new Error("Invalid email or password.");
  }

  if (user.isBlocked) {
    throw new Error("Access denied. Account is blocked.");
  }

  await logIpAddress(user.id || user._id, ip);

  const token = jwt.sign({ userId: user.id || user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

  return { 
    status: "success", 
    token, 
    user: { id: user.id || user._id, email: user.email, name: user.name } 
  };
}

