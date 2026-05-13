import Konva from "konva";

export interface Point {
  x: number;
  y: number;
}

/**
 * Transforms a pointer position from screen coordinates to stage coordinates,
 * accounting for stage position (pan) and scale (zoom).
 */
export function getStagePointerPosition(stage: Konva.Stage): Point | null {
  const pointer = stage.getPointerPosition();
  if (!pointer) return null;

  const stagePos = stage.position();
  const stageScale = stage.scale();

  return {
    x: (pointer.x - stagePos.x) / stageScale.x,
    y: (pointer.y - stagePos.y) / stageScale.y,
  };
}
