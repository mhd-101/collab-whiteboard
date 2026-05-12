export type Tool = "select" | "rect" | "circle" | "arrow" | "text" | "pen";

export interface ToolState {
  activeTool: Tool;
}

export const DEFAULT_TOOL_STATE: ToolState = {
  activeTool: "select",
};
