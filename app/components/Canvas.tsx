"use client";

import { useRef, useState, useCallback } from "react";
import { Stage, Layer, Transformer } from "react-konva";
import Konva from "konva";
import { CanvasObject } from "../types/shapes";
import { useCamera } from "../hooks/useCamera";
import { useKonvaToolManager } from "../hooks/useKonvaToolManager";
import { useToolStore } from "../state/useToolStore";
import { CanvasShape } from "./CanvasShape";
import { useCanvasDimensions } from "../hooks/useCanvasDimensions";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { usePanZoom } from "../hooks/usePanZoom";
import { useCanvasSelection } from "../hooks/useCanvasSelection";
import { Box } from "konva/lib/shapes/Transformer";
import { MIN_TRANSFORM_SIZE } from "../constants";

interface CanvasProps {
  className?: string;
}

export function Canvas({ className }: CanvasProps) {
  const activeTool = useToolStore((state) => state.activeTool);
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);

  const dimensions = useCanvasDimensions(containerRef);
  const camera = useCamera(stageRef);
  const { transformerRef } = useCanvasSelection(selectedObjectId);
  const {
    handleWheel,
    handleMouseDown: handlePanMouseDown,
    handleMouseMove: handlePanMouseMove,
    handleMouseUp: handlePanMouseUp,
  } = usePanZoom(camera);

  useKeyboardShortcuts(selectedObjectId, setObjects, setSelectedObjectId);

  const upsertObject = useCallback(
    (obj: CanvasObject) => {
      const existed = objects.find((o) => o.id === obj.id);

      if (existed) {
        const withoutObj = objects.filter((o) => o.id !== obj.id);
        setObjects([...withoutObj, obj]);
      } else {
        setObjects((prev) => [...prev, obj]);
      }
    },
    [objects],
  );

  const toolManager = useKonvaToolManager(stageRef, upsertObject);

  const handleObjectClick = useCallback(
    (objId: string) => {
      if (activeTool === "select") {
        setSelectedObjectId(objId);
      }
    },
    [activeTool],
  );

  const boundTransformerBox = useCallback((oldBox: Box, newBox: Box) => {
    if (
      newBox.width < MIN_TRANSFORM_SIZE ||
      newBox.height < MIN_TRANSFORM_SIZE
    ) {
      return oldBox;
    }
    return newBox;
  }, []);

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // First handle panning if applicable
    handlePanMouseDown(e);

    // Skip panning-initiated events for tool operations
    if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.shiftKey)) return;

    // Deselect on click on empty area when in select mode
    if (e.target === e.target.getStage() && activeTool === "select") {
      setSelectedObjectId(null);
    }

    toolManager.handleMouseDown(e);
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // First handle panning if applicable
    handlePanMouseMove(e);
    toolManager.handleMouseMove(e);
  };

  const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // First handle panning if applicable
    handlePanMouseUp();
    toolManager.handleMouseUp(e);
  };

  const handleStageMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    toolManager.handleMouseLeave(e);
  };

  const fullClassName = `relative w-full h-full overflow-hidden 
      ${activeTool !== "select" && `cursor-crosshair`} 
      ${className || ""}`;

  return (
    <div ref={containerRef} className={fullClassName}>
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onMouseLeave={handleStageMouseLeave}
      >
        <Layer ref={layerRef}>
          {objects.map((obj) => (
            <CanvasShape
              key={obj.id}
              object={obj}
              onClick={() => handleObjectClick(obj.id)}
              onTap={() => handleObjectClick(obj.id)}
            />
          ))}
          {selectedObjectId && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={boundTransformerBox}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
