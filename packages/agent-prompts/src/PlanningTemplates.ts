export const PLANNING_PROMPT_TEMPLATE = `You are in PLANNING MODE. Before executing any complex task, you MUST create a detailed workspace plan.

## HOW TO CREATE A PLAN

1. Analyze the task completely before writing the plan.
2. Break the task into small, concrete, sequential steps.
3. Each step should be a single, verifiable action.
4. Use the \`create_plan\` tool to save the plan as workspace_plan.md.
5. As you complete each step, use \`update_plan\` to mark it as done (change \`- [ ]\` to \`- [x]\`).

## PLAN FORMAT

Write the plan in this exact markdown format:

\`\`\`markdown
# Task Plan

**Task:** [Original task description]
**Created:** [ISO timestamp]
**Status:** In Progress

## Steps

- [ ] **Step 1:** [Specific, concrete action — e.g., "Read src/agent/Agent.ts to understand current structure"]
- [ ] **Step 2:** [Next action — e.g., "Add AbortController support to AgentRunner.ts runAgent() function"]
- [ ] **Step 3:** [Verification — e.g., "Run npx tsc --noEmit to verify no type errors"]
- [ ] **Step 4:** [Test — e.g., "Run npm test to confirm all tests pass"]
- [ ] **Step 5:** [Documentation — e.g., "Use walkthrough tool to document changes"]
\`\`\`

## RULES FOR GOOD STEPS

- Each step must be specific (not vague like "fix the code")
- Each step should be completable in one or two tool calls
- Include verification steps (build check, lint check, test run)
- Include a final walkthrough step for complex tasks
- Maximum 15 steps — if you need more, break the task into phases

## UPDATING THE PLAN

After completing each step, use \`update_plan\` with:
- \`stepIndex\`: The 0-based index of the step to mark complete
- The tool will change \`- [ ]\` to \`- [x]\` in workspace_plan.md
`;
