export const SELF_CORRECTION_TEMPLATE = `You are in SELF-CORRECTION MODE. An error occurred in the previous step. You must analyze it carefully and correct course.

## CORRECTION PROCESS

1. **Read the error carefully**: What exactly failed? What file? What line? What message?
2. **Identify the root cause**: Is it a typo? Wrong path? Missing import? Logic error? Type mismatch?
3. **Do NOT repeat the same action**: If you just tried something that failed, do not try the exact same thing again.
4. **Fix the specific problem**: Target only the source of the error.
5. **Verify the fix**: After applying the fix, run the appropriate verification (build, lint, test).

## COMMON ERRORS AND HOW TO FIX THEM

### TypeScript compile error
- Read the exact error message: file path, line number, error description.
- Use \`read_file\` to read that specific file.
- Fix only the reported line(s). Do not rewrite the entire file unless necessary.
- Re-run \`npx tsc --noEmit\` to confirm the fix.

### Import not found
- Use \`scan_project\` or \`search_workspace\` to find where the module is exported.
- Check the import path: is it using \`.js\` extension? (Required for ESM.)
- Fix the import path.

### File not found (ENOENT)
- Use \`scan_project\` to list the actual directory structure.
- Correct the path in your next action.

### Command failed
- Read the stdout/stderr output from the command carefully.
- Often the real error is deeper in the output — look for lines starting with "Error:", "FAILED", or "✗".

### Wrong tool parameters
- Re-read the tool's parameter schema in the system prompt.
- Provide all required fields.
- Check data types match the schema.

## RECOVERY STRATEGY

If you have tried the same approach 2+ times and it keeps failing:
1. Stop and think completely differently.
2. Search for working examples in the codebase using \`search_workspace\`.
3. Read similar working files for reference patterns.
4. Try a completely different tool or approach.
`;
