import Konva from "konva";

export interface CanvasObject {
  id: string;
  type: "rect" | "circle" | "arrow" | "text" | "pen";
  createdAt: number;
  updatedAt: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  text?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
}

export class KonvaCanvasEngine {
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private objects: Map<string, CanvasObject> = new Map();
  private shapeNodes: Map<string, Konva.Shape> = new Map();

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with id "${containerId}" not found`);
    }

    this.stage = new Konva.Stage({
      container: containerId,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener("resize", () => {
      this.stage.width(window.innerWidth);
      this.stage.height(window.innerHeight);
    });
  }

  getStage(): Konva.Stage {
    return this.stage;
  }

  getLayer(): Konva.Layer {
    return this.layer;
  }

  addObject(obj: CanvasObject): string {
    const now = Date.now();
    const canvasObject = {
      ...obj,
      id: obj.id || crypto.randomUUID(),
      createdAt: obj.createdAt || now,
      updatedAt: now,
    };

    this.objects.set(canvasObject.id, canvasObject);
    this.renderObject(canvasObject);
    return canvasObject.id;
  }

  private renderObject(obj: CanvasObject) {
    let shape: Konva.Shape | null = null;

    switch (obj.type) {
      case "rect":
        shape = new Konva.Rect({
          x: obj.x,
          y: obj.y,
          width: obj.width || 0,
          height: obj.height || 0,
          fill: obj.fill || "rgba(0,0,255,0.1)",
          stroke: obj.stroke || "#0000ff",
          strokeWidth: obj.strokeWidth || 1,
          draggable: true,
        });
        break;

      case "circle":
        shape = new Konva.Circle({
          x: obj.x,
          y: obj.y,
          radius: obj.radius || 0,
          fill: obj.fill || "rgba(255,0,0,0.1)",
          stroke: obj.stroke || "#ff0000",
          strokeWidth: obj.strokeWidth || 1,
          draggable: true,
        });
        break;

      case "arrow":
        if (obj.points && obj.points.length >= 4) {
          shape = new Konva.Arrow({
            points: obj.points,
            pointerLength: 10,
            pointerWidth: 10,
            fill: obj.fill || "#000000",
            stroke: obj.stroke || "#000000",
            strokeWidth: obj.strokeWidth || 2,
            draggable: true,
          });
        }
        break;

      case "text":
        shape = new Konva.Text({
          x: obj.x,
          y: obj.y,
          text: obj.text || "",
          fontSize: obj.fontSize || 16,
          fill: obj.fill || "#000000",
          draggable: true,
        });
        break;

      case "pen":
        if (obj.points && obj.points.length >= 2) {
          shape = new Konva.Line({
            points: obj.points,
            stroke: obj.stroke || "#000000",
            strokeWidth: obj.strokeWidth || 2,
            lineCap: "round",
            lineJoin: "round",
            draggable: true,
          });
        }
        break;
    }

    if (shape) {
      shape.id(obj.id);
      this.layer.add(shape);
      this.shapeNodes.set(obj.id, shape);
      this.layer.batchDraw();
    }
  }

  removeObject(id: string): boolean {
    const shape = this.shapeNodes.get(id);
    if (shape) {
      shape.destroy();
      this.shapeNodes.delete(id);
      this.objects.delete(id);
      this.layer.batchDraw();
      return true;
    }
    return false;
  }

  getObject(id: string): CanvasObject | undefined {
    return this.objects.get(id);
  }

  updateObject(id: string, updates: Partial<CanvasObject>): boolean {
    const obj = this.objects.get(id);
    if (!obj) return false;

    const updatedObj = {
      ...obj,
      ...updates,
      updatedAt: Date.now(),
    };

    this.objects.set(id, updatedObj);

    // Re-render the object
    const shape = this.shapeNodes.get(id);
    if (shape) {
      shape.destroy();
      this.shapeNodes.delete(id);
    }

    this.renderObject(updatedObj);
    return true;
  }

  clear() {
    this.layer.destroyChildren();
    this.objects.clear();
    this.shapeNodes.clear();
    this.layer.batchDraw();
  }

  exportCanvas(): string {
    const exportData = {
      objects: Array.from(this.objects.values()),
      stage: {
        width: this.stage.width(),
        height: this.stage.height(),
        scale: this.stage.scale(),
        position: this.stage.position(),
      },
    };
    return JSON.stringify(exportData);
  }

  importCanvas(json: string): void {
    try {
      const data = JSON.parse(json);
      this.clear();

      if (data.objects && Array.isArray(data.objects)) {
        data.objects.forEach((obj: CanvasObject) => {
          this.addObject(obj);
        });
      }

      if (data.stage) {
        this.stage.width(data.stage.width || window.innerWidth);
        this.stage.height(data.stage.height || window.innerHeight);
        this.stage.scale(data.stage.scale || { x: 1, y: 1 });
        this.stage.position(data.stage.position || { x: 0, y: 0 });
      }

      this.layer.batchDraw();
    } catch (error) {
      console.error("Failed to import canvas:", error);
    }
  }

  destroy() {
    this.stage.destroy();
  }
}
