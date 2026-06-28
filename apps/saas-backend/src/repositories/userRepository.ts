import { User } from "@istiyak/database";

export async function createUser({ email, password, name, registeredIp }: any) {
  const user = new User({
    email: email.toLowerCase(),
    password,
    name,
    registeredIp: registeredIp || "127.0.0.1",
  });
  await user.save();
  return user;
}

export async function findUserByEmail(email: string) {
  if (!email) return null;
  return await User.findOne({ email: email.toLowerCase() });
}

export async function findUserById(id: string) {
  return await User.findById(id);
}

