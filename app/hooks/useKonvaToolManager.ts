import { useCallback, useRef, RefObject } from "react";
import Konva from "konva";
import {
  CanvasObject,
  isCircleObject,
  isPenObject,
  isRectObject,
} from "../types/shapes";
import { getStagePointerPosition, Point } from "../utils/coordinates";
import {
  createRectObject,
  finalizeRectObject,
  createCircleObject,
  finalizeCircleObject,
  createArrowObject,
  createPenObject,
  createTextObject,
} from "../utils/shapes";
import { useToolStore } from "../state/useToolStore";
import { INITIAL_DRAWING_STATE, NON_DRAWING_TOOLS } from "../constants";

export interface KonvaToolManager {
  handleMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  handleMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  handleMouseUp: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  handleMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

interface DrawingState {
  isDrawing: boolean;
  start: Point;
  currentObject: CanvasObject | null;
  penPoints: number[];
}

export function useKonvaToolManager(
  stageRef: RefObject<Konva.Stage | null>,
  onObjectCreated?: (object: CanvasObject) => void,
): KonvaToolManager {
  const activeTool = useToolStore((state) => state.activeTool);
  const drawingStateRef = useRef<DrawingState>(INITIAL_DRAWING_STATE);

  const getStagePoint = useCallback((): Point | null => {
    const currentStage = stageRef.current;
    if (!currentStage) return null;
    return getStagePointerPosition(currentStage);
  }, [stageRef]);

  const handleMouseDown = useCallback(() => {
    const point = getStagePoint();
    if (!point) return;

    // Text tool creates an object immediately on click
    if (activeTool === "text") {
      const textObject = createTextObject(point.x, point.y);
      onObjectCreated?.(textObject);
      return;
    }

    // Non-drawing tools don't initiate drawing
    if (NON_DRAWING_TOOLS.includes(activeTool)) return;

    // Start drawing for rect, circle, arrow, pen
    drawingStateRef.current = {
      isDrawing: true,
      start: point,
      currentObject: null,
      penPoints: activeTool === "pen" ? [point.x, point.y] : [],
    };
  }, [activeTool, onObjectCreated, getStagePoint]);

  const handleMouseMove = useCallback(() => {
    const state = drawingStateRef.current;
    if (!state.isDrawing) return;

    const point = getStagePoint();
    if (!point) return;

    let newObject: CanvasObject | undefined;

    switch (activeTool) {
      case "rect":
        newObject = createRectObject(
          state.start.x,
          state.start.y,
          point.x,
          point.y,
          isRectObject(state.currentObject) ? state.currentObject : undefined,
        );
        break;
      case "circle":
        newObject = createCircleObject(
          state.start.x,
          state.start.y,
          point.x,
          point.y,
          isCircleObject(state.currentObject) ? state.currentObject : undefined,
        );
        break;
      case "arrow":
        newObject = createArrowObject(
          state.start.x,
          state.start.y,
          point.x,
          point.y,
          {
            id: state.currentObject?.id,
            createdAt: state.currentObject?.createdAt,
          },
        );
        break;
      case "pen":
        newObject = createPenObject(
          state.start.x,
          state.start.y,
          [...state.penPoints, point.x, point.y],
          isPenObject(state.currentObject) ? state.currentObject : undefined,
        );
        break;
      default:
        return;
    }

    if (newObject.type === "pen") {
      drawingStateRef.current = {
        ...drawingStateRef.current,
        currentObject: newObject,
        penPoints: [...state.penPoints, point.x, point.y],
      };
    } else {
      drawingStateRef.current = {
        ...drawingStateRef.current,
        currentObject: newObject,
      };
    }

    onObjectCreated?.(newObject);
  }, [getStagePoint, activeTool, onObjectCreated]);

  const handleMouseUp = useCallback(() => {
    const state = drawingStateRef.current;
    if (!state.isDrawing || !state.currentObject) {
      drawingStateRef.current = INITIAL_DRAWING_STATE;
      return;
    }

    const finalizedObject = finalizeObject(state.currentObject);
    onObjectCreated?.(finalizedObject);
    drawingStateRef.current = INITIAL_DRAWING_STATE;
  }, [onObjectCreated]);

  const handleMouseLeave = useCallback(() => {
    if (drawingStateRef.current.isDrawing) {
      handleMouseUp();
    }
  }, [handleMouseUp]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
}

function finalizeObject(object: CanvasObject): CanvasObject {
  switch (object.type) {
    case "rect":
      return finalizeRectObject(object);
    case "circle":
      return finalizeCircleObject(object);
    default:
      return { ...object, updatedAt: Date.now() };
  }
}
