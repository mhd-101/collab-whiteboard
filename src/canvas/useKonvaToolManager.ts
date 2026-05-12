import { useCallback, useState, useEffect, useRef } from "react";
import Konva from "konva";
import { Tool } from "../state/toolState";
import { CanvasObject } from "./KonvaCanvasEngine";

export interface KonvaToolManager {
  handleMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  handleMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  handleMouseUp: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  handleMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  getDrawingState: () => DrawingState;
}

interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  currentObject: CanvasObject | null;
  penPoints: number[];
}

export function useKonvaToolManager(
  stage: Konva.Stage | null,
  layer: Konva.Layer | null,
  activeTool: Tool,
  onObjectCreated?: (object: CanvasObject) => void,
): KonvaToolManager {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentObject: null,
    penPoints: [],
  });

  // Use a ref to track drawing state synchronously, avoiding stale closures
  // during rapid mouse events before React re-renders.
  const drawingStateRef = useRef<DrawingState>(drawingState);
  drawingStateRef.current = drawingState;

  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  useEffect(() => {
    stageRef.current = stage;
    layerRef.current = layer;
  }, [stage, layer]);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const currentStage = stageRef.current;
      const currentLayer = layerRef.current;
      if (!currentStage || !currentLayer) return;

      const pointer = currentStage.getPointerPosition();
      if (!pointer) return;

      const stagePos = currentStage.position();
      const stageScale = currentStage.scale();
      const absoluteX = (pointer.x - stagePos.x) / stageScale.x;
      const absoluteY = (pointer.y - stagePos.y) / stageScale.y;

      switch (activeTool) {
        case "rect":
        case "circle":
        case "arrow":
          setDrawingState({
            isDrawing: true,
            startX: absoluteX,
            startY: absoluteY,
            currentObject: null,
            penPoints: [],
          });
          break;

        case "text":
          const textObject: CanvasObject = {
            id: crypto.randomUUID(),
            type: "text",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            x: absoluteX,
            y: absoluteY,
            text: "Double click to edit",
            fontSize: 16,
            fill: "#000000",
          };

          if (onObjectCreated) {
            onObjectCreated(textObject);
          }
          break;

        case "pen":
          setDrawingState({
            isDrawing: true,
            startX: absoluteX,
            startY: absoluteY,
            currentObject: null,
            penPoints: [absoluteX, absoluteY],
          });
          break;
      }
    },
    [activeTool, onObjectCreated],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const currentStage = stageRef.current;
      const currentLayer = layerRef.current;
      // Read from ref to avoid stale closure issues during rapid mouse events
      const state = drawingStateRef.current;
      if (!currentStage || !currentLayer || !state.isDrawing) return;

      const pointer = currentStage.getPointerPosition();
      if (!pointer) return;

      const stagePos = currentStage.position();
      const stageScale = currentStage.scale();
      const absoluteX = (pointer.x - stagePos.x) / stageScale.x;
      const absoluteY = (pointer.y - stagePos.y) / stageScale.y;

      switch (activeTool) {
        case "rect":
          const rectWidth = Math.abs(absoluteX - state.startX);
          const rectHeight = Math.abs(absoluteY - state.startY);
          const rectX = Math.min(absoluteX, state.startX);
          const rectY = Math.min(absoluteY, state.startY);

          const rectObject: CanvasObject = {
            id: state.currentObject?.id || crypto.randomUUID(),
            type: "rect",
            createdAt: state.currentObject?.createdAt || Date.now(),
            updatedAt: Date.now(),
            x: rectX,
            y: rectY,
            width: rectWidth,
            height: rectHeight,
            fill: "rgba(0,0,255,0.3)",
            stroke: "#0000ff",
            strokeWidth: 1,
          };

          setDrawingState((prev) => ({
            ...prev,
            currentObject: rectObject,
          }));

          if (onObjectCreated) {
            onObjectCreated(rectObject);
          }
          break;

        case "circle":
          const radius = Math.sqrt(
            Math.pow(absoluteX - state.startX, 2) +
              Math.pow(absoluteY - state.startY, 2),
          );

          const circleObject: CanvasObject = {
            id: state.currentObject?.id || crypto.randomUUID(),
            type: "circle",
            createdAt: state.currentObject?.createdAt || Date.now(),
            updatedAt: Date.now(),
            x: state.startX,
            y: state.startY,
            radius: radius,
            fill: "rgba(255,0,0,0.3)",
            stroke: "#ff0000",
            strokeWidth: 1,
          };

          setDrawingState((prev) => ({
            ...prev,
            currentObject: circleObject,
          }));

          if (onObjectCreated) {
            onObjectCreated(circleObject);
          }
          break;

        case "arrow":
          const arrowObject: CanvasObject = {
            id: state.currentObject?.id || crypto.randomUUID(),
            type: "arrow",
            createdAt: state.currentObject?.createdAt || Date.now(),
            updatedAt: Date.now(),
            x: state.startX,
            y: state.startY,
            points: [state.startX, state.startY, absoluteX, absoluteY],
            fill: "#000000",
            stroke: "#000000",
            strokeWidth: 2,
          };

          setDrawingState((prev) => ({
            ...prev,
            currentObject: arrowObject,
          }));

          if (onObjectCreated) {
            onObjectCreated(arrowObject);
          }
          break;

        case "pen":
          const newPenPoints = [...state.penPoints, absoluteX, absoluteY];
          const penObject: CanvasObject = {
            id: state.currentObject?.id || crypto.randomUUID(),
            type: "pen",
            createdAt: state.currentObject?.createdAt || Date.now(),
            updatedAt: Date.now(),
            x: state.startX,
            y: state.startY,
            points: newPenPoints,
            stroke: "#000000",
            strokeWidth: 2,
          };

          setDrawingState((prev) => ({
            ...prev,
            currentObject: penObject,
            penPoints: newPenPoints,
          }));

          if (onObjectCreated) {
            onObjectCreated(penObject);
          }
          break;
      }
    },
    [activeTool, onObjectCreated],
  );

  const handleMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const state = drawingStateRef.current;
      if (!state.isDrawing) return;

      // Finalize the object
      if (state.currentObject) {
        const finalizedObject: CanvasObject = {
          ...state.currentObject,
          updatedAt: Date.now(),
          // Remove preview styling and add final styling
          fill:
            activeTool === "rect"
              ? "rgba(0,0,255,0.1)"
              : activeTool === "circle"
                ? "rgba(255,0,0,0.1)"
                : state.currentObject.fill,
        };

        if (onObjectCreated) {
          onObjectCreated(finalizedObject);
        }
      }

      setDrawingState({
        isDrawing: false,
        startX: 0,
        startY: 0,
        currentObject: null,
        penPoints: [],
      });
    },
    [activeTool, onObjectCreated],
  );

  const handleMouseLeave = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (drawingStateRef.current.isDrawing) {
        handleMouseUp(e);
      }
    },
    [handleMouseUp],
  );

  const getDrawingState = useCallback(() => {
    return drawingState;
  }, [drawingState]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    getDrawingState,
  };
}
