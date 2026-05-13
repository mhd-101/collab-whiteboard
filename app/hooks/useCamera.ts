import { useCallback, useRef, RefObject } from "react";
import { Stage } from "konva/lib/Stage";
import { CameraState, CameraControls } from "./types";
import { MAX_ZOOM, MIN_ZOOM } from "../constants/canvas";

export function useCamera(stageRef: RefObject<Stage | null>): CameraControls {
  const cameraState = useRef<CameraState>({
    x: 0,
    y: 0,
    zoom: 1,
  });

  const pan = useCallback(
    (dx: number, dy: number) => {
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
    },
    [stageRef],
  );

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
    },
    [stageRef],
  );

  const resetView = useCallback(() => {
    const currentStage = stageRef.current;
    if (!currentStage) return;

    currentStage.scale({ x: 1, y: 1 });
    currentStage.position({ x: 0, y: 0 });
    cameraState.current = { x: 0, y: 0, zoom: 1 };
  }, [stageRef]);

  return {
    pan,
    zoomAt,
    resetView,
  };
}
