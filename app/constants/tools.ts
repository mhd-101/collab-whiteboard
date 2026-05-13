/**
 * Tool-related constants
 *
 * This file contains all constants related to canvas tools,
 * including tool definitions and tool categories.
 */

import { Tool } from "../types";

/**
 * Array of all available tools with their metadata
 */
export const tools = [
  { id: "select" as Tool, label: "Select", icon: "↖" },
  { id: "rect" as Tool, label: "Rectangle", icon: "▭" },
  { id: "circle" as Tool, label: "Circle", icon: "○" },
  { id: "arrow" as Tool, label: "Arrow", icon: "→" },
  { id: "text" as Tool, label: "Text", icon: "T" },
  { id: "pen" as Tool, label: "Pen", icon: "✏" },
] as const;

/**
 * Tools that don't involve drawing operations
 * These tools are used for selection and interaction only
 */
export const NON_DRAWING_TOOLS: Tool[] = ["select", "text"];
