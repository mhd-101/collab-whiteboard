import { ArrowObject } from "../../types/shapes";

export interface ArrowOptions {
  id?: string;
  type?: "arrow";
  createdAt?: number;
  updatedAt?: number;
  strokeWidth?: number;
  fill?: string;
  stroke?: string;
  pointerLength?: number;
  pointerWidth?: number;
}

export function createArrowObject(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: Partial<ArrowOptions> = {},
): ArrowObject {
  const id = options.id || crypto.randomUUID();
  const now = Date.now();

  return {
    id,
    type: "arrow",
    createdAt: options.createdAt || now,
    updatedAt: now,
    x: startX,
    y: startY,
    points: [startX, startY, endX, endY],
    fill: options.fill || options.stroke || "#000000",
    stroke: options.stroke || "#000000",
    strokeWidth: options.strokeWidth || 2,
    pointerLength: options.pointerLength || 15,
    pointerWidth: options.pointerWidth || 10,
  };
}
