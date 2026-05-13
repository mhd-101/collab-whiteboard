import { create } from "zustand";
import { Tool } from "../types";

interface ToolStore {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

export const useToolStore = create<ToolStore>((set) => ({
  activeTool: "select",
  setActiveTool: (tool) => set({ activeTool: tool }),
}));
