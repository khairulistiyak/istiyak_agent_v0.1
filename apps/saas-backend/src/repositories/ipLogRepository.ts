import { IpLog } from "@istiyak/database";

export async function logIpAddress(userId: string, ip: string) {
  if (!ip) return null;
  let logEntry = await IpLog.findOne({ ip });
  if (logEntry) {
    logEntry.count += 1;
    await logEntry.save();
  } else {
    logEntry = new IpLog({ ip, count: 1 });
    await logEntry.save();
  }
  return logEntry;
}

export async function getIpLog(ip: string) {
  if (!ip) return null;
  return await IpLog.findOne({ ip });
}

