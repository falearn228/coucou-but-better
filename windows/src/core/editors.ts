import type { AgentTask } from "./state";

export type Editor = "code" | "zed";

/** An active session's host wins; idle pills use the chosen workspace. */
export function editorForTask(task: AgentTask | null | undefined, mainPill: string): Editor {
  if (task?.sessionEditor) return task.sessionEditor;
  if (task?.id === "agent_zed" || mainPill === "agent_zed") return "zed";
  return "code";
}
