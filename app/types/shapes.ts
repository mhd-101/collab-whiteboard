/**
 * Type definitions for canvas shapes using discriminated unions
 */

/**
 * Base interface for common fields across all canvas objects
 */
interface BaseCanvasObject {
  id: string;
  type: CanvasObjectType;
  createdAt: number;
  updatedAt: number;
  x: number;
  y: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

/**
 * Type union for all canvas object types
 */
type CanvasObjectType = "rect" | "circle" | "arrow" | "text" | "pen";

/**
 * Rectangle shape
 */
export interface RectObject extends BaseCanvasObject {
  type: "rect";
  width: number;
  height: number;
}

/**
 * Circle shape
 */
export interface CircleObject extends BaseCanvasObject {
  type: "circle";
  radius: number;
}

/**
 * Arrow shape (uses points for start and end positions)
 */
export interface ArrowObject extends BaseCanvasObject {
  type: "arrow";
  points: number[]; // [x1, y1, x2, y2] format
  pointerLength?: number;
  pointerWidth?: number;
}

/**
 * Text shape
 */
export interface TextObject extends BaseCanvasObject {
  type: "text";
  text: string;
  fontSize?: number;
}

/**
 * Pen/freehand drawing shape
 */
export interface PenObject extends BaseCanvasObject {
  type: "pen";
  points: number[]; // Array of [x, y, x, y, ...] coordinates
}

/**
 * Union type representing any canvas object
 */
export type CanvasObject =
  | RectObject
  | CircleObject
  | ArrowObject
  | TextObject
  | PenObject;

/**
 * Type guard to check if an object is a specific shape type
 */
export function isRectObject(
  obj: CanvasObject | undefined | null,
): obj is RectObject {
  if (!obj) return false;

  return obj.type === "rect";
}

export function isCircleObject(
  obj: CanvasObject | undefined | null,
): obj is CircleObject {
  if (!obj) return false;

  return obj.type === "circle";
}

export function isPenObject(
  obj: CanvasObject | undefined | null,
): obj is PenObject {
  if (!obj) return false;

  return obj.type === "pen";
}
