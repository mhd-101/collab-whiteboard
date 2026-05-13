import { RectObject } from "../../types/shapes";

export function createRectObject(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  existingObject?: RectObject | null,
): RectObject {
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  const x = Math.min(currentX, startX);
  const y = Math.min(currentY, startY);

  return {
    id: existingObject?.id || crypto.randomUUID(),
    type: "rect",
    createdAt: existingObject?.createdAt || Date.now(),
    updatedAt: Date.now(),
    x,
    y,
    width,
    height,
    fill: "rgba(0,0,255,0.3)",
    stroke: "#0000ff",
    strokeWidth: 1,
  };
}

export function finalizeRectObject(object: RectObject): RectObject {
  return {
    ...object,
    updatedAt: Date.now(),
    fill: "rgba(0,0,255,0.1)",
  };
}
