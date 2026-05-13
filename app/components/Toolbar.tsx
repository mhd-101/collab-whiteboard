"use client";

import { tools } from "../constants";
import { useToolStore } from "../state/useToolStore";

export function Toolbar() {
  const activeTool = useToolStore((state) => state.activeTool);
  const setActiveTool = useToolStore((state) => state.setActiveTool);
  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-100 border-r border-gray-300">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Tools</h3>
      <div className="flex flex-col gap-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
              activeTool === tool.id
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
            title={tool.label}
          >
            <span className="text-lg">{tool.icon}</span>
            <span className="text-sm">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
