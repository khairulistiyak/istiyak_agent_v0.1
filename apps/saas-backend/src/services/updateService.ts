export async function getLatestUpdate(platform: string, arch: string, currentVersion: string) {
  if (currentVersion === "0.1.0" || currentVersion === "0.1") {
    return {
      version: "1.0.0",
      notes: "Production grade monorepo architecture updates.",
      pub_date: new Date().toISOString(),
      signature: "binary_sig_base64_stub",
      url: `https://updates.istiyak.ai/releases/v1.0.0/desktop_${platform}_${arch}.zip`
    };
  }
  return null;
}
