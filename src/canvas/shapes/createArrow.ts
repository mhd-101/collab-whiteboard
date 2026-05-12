import Konva from "konva";

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

export function createKonvaArrow(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: Partial<ArrowOptions> = {},
): Konva.Arrow {
  const id = options.id || crypto.randomUUID();
  const now = Date.now();

  // Calculate angle for arrow direction
  const dx = endX - startX;
  const dy = endY - startY;
  const angle = Math.atan2(dy, dx);

  // Create Konva Arrow
  const arrow = new Konva.Arrow({
    points: [startX, startY, endX, endY],
    pointerLength: options.pointerLength || 15,
    pointerWidth: options.pointerWidth || 10,
    fill: options.fill || options.stroke || "#000000",
    stroke: options.stroke || "#000000",
    strokeWidth: options.strokeWidth || 2,
    draggable: true,
  });

  // Add metadata as custom properties
  arrow.setAttr("id", id);
  arrow.setAttr("type", "arrow");
  arrow.setAttr("createdAt", options.createdAt || now);
  arrow.setAttr("updatedAt", now);

  return arrow;
}

export function createArrowObject(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: Partial<ArrowOptions> = {},
) {
  const id = options.id || crypto.randomUUID();
  const now = Date.now();

  return {
    id,
    type: "arrow" as const,
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
