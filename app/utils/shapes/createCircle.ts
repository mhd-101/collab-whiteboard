import { CircleObject } from "../../types/shapes";

export function createCircleObject(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  existingObject?: CircleObject | null,
): CircleObject {
  const radius = Math.sqrt(
    Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2),
  );

  return {
    id: existingObject?.id || crypto.randomUUID(),
    type: "circle",
    createdAt: existingObject?.createdAt || Date.now(),
    updatedAt: Date.now(),
    x: startX,
    y: startY,
    radius,
    fill: "rgba(255,0,0,0.3)",
    stroke: "#ff0000",
    strokeWidth: 1,
  };
}

export function finalizeCircleObject(object: CircleObject): CircleObject {
  return {
    ...object,
    updatedAt: Date.now(),
    fill: "rgba(255,0,0,0.1)",
  };
}
