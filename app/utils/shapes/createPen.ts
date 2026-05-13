import { PenObject } from "../../types/shapes";

export function createPenObject(
  startX: number,
  startY: number,
  points: number[],
  existingObject?: PenObject | null,
): PenObject {
  return {
    id: existingObject?.id || crypto.randomUUID(),
    type: "pen",
    createdAt: existingObject?.createdAt || Date.now(),
    updatedAt: Date.now(),
    x: startX,
    y: startY,
    points,
    stroke: "#000000",
    strokeWidth: 2,
  };
}
