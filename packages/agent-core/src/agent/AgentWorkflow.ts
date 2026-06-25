import { Agent } from "./Agent.js";
import { TaskClassifier } from "./TaskClassifier.js";
import { ResponseParser } from "../llm/ResponseParser.js";
import { ExceptionHandler } from "./ExceptionHandler.js";
import { Reflection } from "./Reflection.js";
import { ContextBuilder } from "./ContextBuilder.js";
import { PromptBuilder } from "./PromptBuilder.js";
import { ChatMessage } from "@istiyak/shared-types";

export class AgentWorkflow {
  private agent: Agent;
  private maxSteps: number = 40;

  constructor(agent: Agent) {
    this.agent = agent;
  }

  public async run(taskDescription: string, onUpdate: (log: string) => void): Promise<string> {
    this.agent.state.clear();
    this.agent.state.setStatus("running");

    onUpdate(`[Workflow] Initializing task: "${taskDescription}"`);

    // Route complexity
    const activeProvider = this.agent.providers.getActiveProvider();
    const targetModel = TaskClassifier.classifyAndRoute(taskDescription, activeProvider.id);
    this.agent.state.addStepLog({
      step: this.agent.state.getStep(),
      status: "thought",
      content: `Selected model '${targetModel}' on provider '${activeProvider.id}' based on task routing analysis.`
    });
    this.agent.state.incrementStep();

    // Planning step
    onUpdate(`[Workflow] Generating execution plan...`);
    const systemPrompt = PromptBuilder.buildSystemPrompt(this.agent.workspacePath);
    const planPrompt = PromptBuilder.buildPlanningPrompt(taskDescription);

    const planResponse = await activeProvider.generateText({
      systemPrompt,
      userMessage: planPrompt
    });

    const parsedPlan = ResponseParser.parse(planResponse.content);
    const planContent = parsedPlan.thought;
    
    // Save plan to workspace
    const planTool = this.agent.registry.getTool("create_plan");
    if (planTool) {
      await planTool.execute({ planContent }, { workspacePath: this.agent.workspacePath });
    }

    this.agent.state.addStepLog({
      step: this.agent.state.getStep(),
      status: "action",
      content: `Generated plan saved:\n${planContent}`,
      actionName: "create_plan"
    });
    this.agent.state.incrementStep();
    onUpdate(`[Plan Saved]`);

    // Main Run Loop
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `You are executing the task: "${taskDescription}". Here is the plan you created: ${planContent}` }
    ];

    const reflection = new Reflection(this.agent.providers);
    let currentStep = this.agent.state.getStep();

    while (currentStep < this.maxSteps) {
      onUpdate(`[Step ${currentStep}] Analyzing status...`);

      // Retrieve memory facts from SQLite/JSON
      const memoryRules = this.agent.memory.workspace.getRules();
      const workspaceCtx = ContextBuilder.buildWorkspaceContext(
        this.agent.workspacePath,
        memoryRules,
        this.agent.registry.getAllTools()
      );

      const userMsgContext = `${workspaceCtx}\n\nAnalyze the current workspace files, review your plan, and output the next step inside <agent_step name="toolName" arg1="val1">your thought process</agent_step> tag.`;

      // Update system context or insert as latest context
      const tempMessages = [
        ...messages,
        { role: "system" as const, content: userMsgContext }
      ];

      const response = await activeProvider.generateText({
        systemPrompt: systemPrompt,
        userMessage: tempMessages.map(m => `[${m.role}] ${m.content}`).join("\n")
      });

      const parsed = ResponseParser.parse(response.content);
      onUpdate(`[Thought] ${parsed.thought}`);

      if (parsed.action) {
        const tool = this.agent.registry.getTool(parsed.action);
        if (!tool) {
          const errMsg = `Tool '${parsed.action}' is not registered.`;
          this.agent.state.addStepLog({
            step: currentStep,
            status: "error",
            content: errMsg
          });
          messages.push({ role: "assistant", content: response.content });
          messages.push({ role: "user", content: ExceptionHandler.handle(errMsg) });
        } else {
          // Check security permissions
          const args = parsed.params || {};
          const detail = `${parsed.action}(${JSON.stringify(args)})`;
          const permitted = await this.agent.permissions.checkPermission(parsed.action, detail);

          if (!permitted) {
            const blockMsg = `Permission denied by user for command: ${detail}`;
            this.agent.state.addStepLog({
              step: currentStep,
              status: "error",
              content: blockMsg,
              actionName: parsed.action
            });
            messages.push({ role: "assistant", content: response.content });
            messages.push({ role: "user", content: ExceptionHandler.handle(blockMsg) });
          } else {
            onUpdate(`[Action] Executing tool: ${parsed.action}`);
            try {
              const toolResult = await tool.execute(args, { workspacePath: this.agent.workspacePath });
              const resultStr = typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult);

              this.agent.state.addStepLog({
                step: currentStep,
                status: "success",
                content: `Tool '${parsed.action}' completed successfully. Result: ${resultStr}`,
                actionName: parsed.action
              });

              this.agent.memory.workspace.logStep(currentStep, parsed.action, resultStr);
              messages.push({ role: "assistant", content: response.content });
              messages.push({ role: "user", content: `Tool outcome: ${resultStr}` });
            } catch (err: any) {
              const trace = ExceptionHandler.handle(err);
              this.agent.state.addStepLog({
                step: currentStep,
                status: "error",
                content: `Tool '${parsed.action}' encountered an error: ${err.message}`,
                actionName: parsed.action
              });
              messages.push({ role: "assistant", content: response.content });
              messages.push({ role: "user", content: trace });
            }
          }
        }
      } else {
        // No tool action returned, reflect if we are finished
        onUpdate(`[Workflow] No tool action requested. Verifying completion...`);
        const evaluation = await reflection.evaluate(
          taskDescription,
          planContent,
          "None",
          parsed.thought
        );

        if (evaluation.complete) {
          this.agent.state.addStepLog({
            step: currentStep,
            status: "success",
            content: `Task successfully verified: ${evaluation.feedback}`
          });
          break;
        } else {
          // Force tool suggestion if incomplete
          const retryMsg = `Task remains incomplete. Detail: ${evaluation.feedback}. You must invoke a workspace tool to proceed.`;
          messages.push({ role: "assistant", content: response.content });
          messages.push({ role: "user", content: retryMsg });
        }
      }

      this.agent.state.incrementStep();
      currentStep = this.agent.state.getStep();
    }

    this.agent.state.setStatus("done");
    return "Agent loop completed task.";
  }
}

export default AgentWorkflow;
