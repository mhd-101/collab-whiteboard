import { useCallback, useRef, useEffect } from "react";
import Konva from "konva";

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export interface CameraControls {
  pan: (dx: number, dy: number) => void;
  zoomAt: (point: { x: number; y: number }, delta: number) => void;
  resetView: () => void;
  getState: () => CameraState;
  setState: (state: CameraState) => void;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;

export function useCamera(stage: Konva.Stage | null): CameraControls {
  const stageRef = useRef<Konva.Stage | null>(null);
  const cameraState = useRef<CameraState>({
    x: 0,
    y: 0,
    zoom: 1,
  });

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  const pan = useCallback((dx: number, dy: number) => {
    const currentStage = stageRef.current;
    if (!currentStage) return;

    const position = currentStage.position();
    const newPosition = {
      x: position.x + dx,
      y: position.y + dy,
    };

    currentStage.position(newPosition);
    cameraState.current.x = newPosition.x;
    cameraState.current.y = newPosition.y;
    currentStage.batchDraw();
  }, []);

  const zoomAt = useCallback(
    (point: { x: number; y: number }, delta: number) => {
      const currentStage = stageRef.current;
      if (!currentStage) return;

      const oldScale = currentStage.scaleX();
      const newScale = oldScale * delta;

      // Clamp zoom
      const clampedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));

      if (clampedScale === oldScale) return;

      const mousePointTo = {
        x: (point.x - currentStage.x()) / oldScale,
        y: (point.y - currentStage.y()) / oldScale,
      };

      const newPos = {
        x: point.x - mousePointTo.x * clampedScale,
        y: point.y - mousePointTo.y * clampedScale,
      };

      currentStage.scale({ x: clampedScale, y: clampedScale });
      currentStage.position(newPos);
      cameraState.current.zoom = clampedScale;
      cameraState.current.x = newPos.x;
      cameraState.current.y = newPos.y;
      currentStage.batchDraw();
    },
    [],
  );

  const resetView = useCallback(() => {
    const currentStage = stageRef.current;
    if (!currentStage) return;

    currentStage.scale({ x: 1, y: 1 });
    currentStage.position({ x: 0, y: 0 });
    cameraState.current = { x: 0, y: 0, zoom: 1 };
    currentStage.batchDraw();
  }, []);

  const getState = useCallback(() => {
    return { ...cameraState.current };
  }, []);

  const setState = useCallback((state: CameraState) => {
    const currentStage = stageRef.current;
    if (!currentStage) return;

    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.zoom));

    currentStage.scale({ x: clampedZoom, y: clampedZoom });
    currentStage.position({ x: state.x, y: state.y });
    cameraState.current = { ...state, zoom: clampedZoom };
    currentStage.batchDraw();
  }, []);

  return {
    pan,
    zoomAt,
    resetView,
    getState,
    setState,
  };
}
