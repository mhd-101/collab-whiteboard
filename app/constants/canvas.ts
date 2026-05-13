/**
 * Canvas-related constants
 *
 * This file contains all constants related to canvas operations,
 * including zoom limits, transform sizes, and drawing states.
 */

import { CanvasObject } from "../types/shapes";
import { Point } from "../utils/coordinates";

/**
 * Minimum zoom level for the canvas
 */
export const MIN_ZOOM = 0.1;

/**
 * Maximum zoom level for the canvas
 */
export const MAX_ZOOM = 3;

/**
 * Minimum size for transform operations (resizing, scaling)
 * Prevents objects from becoming too small to interact with
 */
export const MIN_TRANSFORM_SIZE = 5;

/**
 * Initial drawing state for canvas tools
 */
export const INITIAL_DRAWING_STATE = {
  isDrawing: false,
  start: { x: 0, y: 0 } as Point,
  currentObject: null as CanvasObject | null,
  penPoints: [] as number[],
} as const;
