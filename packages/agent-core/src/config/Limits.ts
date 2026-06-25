export const LIMITS = {
  MAX_STEPS: 40,
  WARN_STEPS: 20,
  MAX_TOKEN_SPENT_USD: 2.00, // Safe cut-off cost per run to protect API bills
  CONTEXT_COMPRESSION_THRESHOLD: 25, // Compress history context at 25 steps
  MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024 // 2MB max file size limit for read safety
};
export default LIMITS;
