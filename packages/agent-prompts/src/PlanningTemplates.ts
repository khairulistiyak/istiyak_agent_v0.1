export const PLANNING_TEMPLATE = `
You need to create a step-by-step implementation plan for the requested task.
Generate your plan in markdown containing:
- Proposed file modifications
- Verification commands (tests/compilations)
- Core architectural design decisions

Format the output inside the <agent_step> tag with name="create_plan".
`;
