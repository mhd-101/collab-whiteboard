"use client";

import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Toolbar />
      <div className="flex-1">
        <Canvas />
      </div>
    </div>
  );
}
