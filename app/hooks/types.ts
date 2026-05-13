export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export interface CameraControls {
  pan: (dx: number, dy: number) => void;
  zoomAt: (point: { x: number; y: number }, delta: number) => void;
  resetView: () => void;
}
