import { useCallback, useRef } from "react";
import Konva from "konva";
import { CameraControls } from "./types";

export function usePanZoom(camera: CameraControls) {
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const delta = e.evt.deltaY > 0 ? 1.1 : 0.9;
      const stage = e.target.getStage();
      if (stage) {
        const pointer = stage.getPointerPosition();
        if (pointer) {
          camera.zoomAt(pointer, delta);
        }
      }
    },
    [camera],
  );

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.shiftKey)) {
        isPanningRef.current = true;
        const stage = e.target.getStage();
        if (stage) {
          const pointer = stage.getPointerPosition();
          if (pointer) {
            lastPointerRef.current = { x: pointer.x, y: pointer.y };
          }
        }
        e.evt.preventDefault();
      }
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isPanningRef.current) return;
      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const deltaX = pointer.x - lastPointerRef.current.x;
      const deltaY = pointer.y - lastPointerRef.current.y;

      camera.pan(deltaX, deltaY);
      lastPointerRef.current = { x: pointer.x, y: pointer.y };
    },
    [camera],
  );

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  return { handleWheel, handleMouseDown, handleMouseMove, handleMouseUp };
}
