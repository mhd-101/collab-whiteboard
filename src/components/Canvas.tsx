"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Arrow,
  Text,
  Line,
  Transformer,
} from "react-konva";
import Konva from "konva";
import { CanvasObject } from "../canvas/KonvaCanvasEngine";
import { useCamera } from "../canvas/useCamera";
import { useKonvaToolManager } from "../canvas/useKonvaToolManager";
import { Tool } from "../state/toolState";

interface CanvasProps {
  className?: string;
  activeTool: Tool;
}

export function Canvas({ className, activeTool }: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Track actual Stage/Layer instances via state so hooks receive non-null values
  const [stageInstance, setStageInstance] = useState<Konva.Stage | null>(null);
  const [layerInstance, setLayerInstance] = useState<Konva.Layer | null>(null);

  const camera = useCamera(stageInstance);
  const toolManager = useKonvaToolManager(
    stageInstance,
    layerInstance,
    activeTool,
    useCallback((obj: CanvasObject) => {
      setObjects((prev) => {
        const existingIndex = prev.findIndex((o) => o.id === obj.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = obj;
          return updated;
        }
        return [...prev, obj];
      });
    }, []),
  );

  // Callback refs to capture Stage/Layer instances and propagate to state
  const stageRefCallback = useCallback((node: Konva.Stage | null) => {
    stageRef.current = node;
    if (node) {
      setStageInstance(node);
    }
  }, []);

  const layerRefCallback = useCallback((node: Konva.Layer | null) => {
    layerRef.current = node;
    if (node) {
      setLayerInstance(node);
    }
  }, []);

  // Track container dimensions for the Stage
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Handle keyboard shortcuts (delete selected objects)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedObjectId) {
          setObjects((prev) =>
            prev.filter((obj) => obj.id !== selectedObjectId),
          );
          setSelectedObjectId(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObjectId]);

  // Update Transformer when selection changes
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    if (selectedObjectId) {
      const node = stage.findOne("#" + selectedObjectId);
      if (node) {
        transformer.nodes([node]);
        return;
      }
    }
    transformer.nodes([]);
    transformer.getLayer()?.batchDraw();
  }, [selectedObjectId]);

  // Handle pan and zoom
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let isPanning = false;
    let lastPointerPosition = { x: 0, y: 0 };

    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const delta = e.evt.deltaY > 0 ? 1.1 : 0.9;
      const pointer = stage.getPointerPosition();
      if (pointer) {
        camera.zoomAt(pointer, delta);
      }
    };

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.shiftKey)) {
        isPanning = true;
        const pointer = stage.getPointerPosition();
        if (pointer) {
          lastPointerPosition = { x: pointer.x, y: pointer.y };
        }
        e.evt.preventDefault();
      }
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isPanning) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const deltaX = pointer.x - lastPointerPosition.x;
      const deltaY = pointer.y - lastPointerPosition.y;

      camera.pan(deltaX, deltaY);
      lastPointerPosition = { x: pointer.x, y: pointer.y };
    };

    const handleMouseUp = () => {
      isPanning = false;
    };

    stage.on("wheel", handleWheel);
    stage.on("mousedown", handleMouseDown);
    stage.on("mousemove", handleMouseMove);
    stage.on("mouseup", handleMouseUp);

    return () => {
      stage.off("wheel", handleWheel);
      stage.off("mousedown", handleMouseDown);
      stage.off("mousemove", handleMouseMove);
      stage.off("mouseup", handleMouseUp);
    };
  }, [camera]);

  // Drawing tool event handlers
  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only handle drawing if not panning
    if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.shiftKey)) return;

    // Deselect on click on empty area when in select mode
    if (e.target === e.target.getStage() && activeTool === "select") {
      setSelectedObjectId(null);
    }

    // Always let the tool manager handle the event for drawing tools.
    // For "select" tool, handleMouseDown is a no-op (no matching case).
    toolManager.handleMouseDown(e);
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    toolManager.handleMouseMove(e);
  };

  const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    toolManager.handleMouseUp(e);
  };

  const handleStageMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    toolManager.handleMouseLeave(e);
  };

  // Handle object click for selection
  const handleObjectClick = (objId: string) => {
    if (activeTool === "select") {
      setSelectedObjectId(objId);
    }
  };

  // Render shape based on object type
  const renderShape = (obj: CanvasObject) => {
    const commonProps = {
      key: obj.id,
      id: obj.id,
      name: obj.id,
      onClick: () => handleObjectClick(obj.id),
      onTap: () => handleObjectClick(obj.id),
      draggable: activeTool === "select",
    };

    switch (obj.type) {
      case "rect":
        return (
          <Rect
            {...commonProps}
            x={obj.x}
            y={obj.y}
            width={obj.width || 0}
            height={obj.height || 0}
            fill={obj.fill || "rgba(0,0,255,0.1)"}
            stroke={obj.stroke || "#0000ff"}
            strokeWidth={obj.strokeWidth || 1}
          />
        );

      case "circle":
        return (
          <Circle
            {...commonProps}
            x={obj.x}
            y={obj.y}
            radius={obj.radius || 0}
            fill={obj.fill || "rgba(255,0,0,0.1)"}
            stroke={obj.stroke || "#ff0000"}
            strokeWidth={obj.strokeWidth || 1}
          />
        );

      case "arrow":
        return (
          <Arrow
            {...commonProps}
            points={obj.points || []}
            pointerLength={10}
            pointerWidth={10}
            fill={obj.fill || "#000000"}
            stroke={obj.stroke || "#000000"}
            strokeWidth={obj.strokeWidth || 2}
          />
        );

      case "text":
        return (
          <Text
            {...commonProps}
            x={obj.x}
            y={obj.y}
            text={obj.text || ""}
            fontSize={obj.fontSize || 16}
            fill={obj.fill || "#000000"}
          />
        );

      case "pen":
        return (
          <Line
            {...commonProps}
            points={obj.points || []}
            stroke={obj.stroke || "#000000"}
            strokeWidth={obj.strokeWidth || 2}
            lineCap="round"
            lineJoin="round"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className || ""}`}
      style={{ cursor: activeTool === "select" ? "default" : "crosshair" }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Stage
          ref={stageRefCallback}
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onMouseLeave={handleStageMouseLeave}
        >
          <Layer ref={layerRefCallback}>
            {objects.map(renderShape)}
            {selectedObjectId && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Prevent Transformer from shrinking to negative size
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
