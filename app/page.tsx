"use client";

import { useState } from "react";
import { Canvas } from "../src/components/Canvas";
import { Toolbar } from "../src/components/Toolbar";
import { Tool, DEFAULT_TOOL_STATE } from "../src/state/toolState";

export default function Home() {
  const [activeTool, setActiveTool] = useState<Tool>(
    DEFAULT_TOOL_STATE.activeTool,
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />
      <div className="flex-1">
        <Canvas activeTool={activeTool} />
      </div>
    </div>
  );
}
