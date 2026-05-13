import { Rect, Circle, Arrow, Text, Line } from "react-konva";
import { CanvasObject } from "../types/shapes";
import { useToolStore } from "../state/useToolStore";

interface CanvasShapeProps {
  object: CanvasObject;
  onClick: () => void;
  onTap: () => void;
}

const SHAPE_DEFAULTS: Record<
  CanvasObject["type"],
  Record<string, string | number>
> = {
  rect: {
    fill: "rgba(0,0,255,0.1)",
    stroke: "#0000ff",
    strokeWidth: 1,
  },
  circle: {
    fill: "rgba(255,0,0,0.1)",
    stroke: "#ff0000",
    strokeWidth: 1,
  },
  arrow: {
    fill: "#000000",
    stroke: "#000000",
    strokeWidth: 2,
  },
  text: {
    fill: "#000000",
    fontSize: 16,
  },
  pen: {
    stroke: "#000000",
    strokeWidth: 2,
  },
};

function getDefault<K extends string | number>(
  type: CanvasObject["type"],
  key: string,
): K | undefined {
  return SHAPE_DEFAULTS[type]?.[key] as K;
}

export function CanvasShape({ object: obj, onClick, onTap }: CanvasShapeProps) {
  const activeTool = useToolStore((state) => state.activeTool);
  const id = obj.id;
  const commonProps = {
    id,
    name: id,
    onClick,
    onTap,
    draggable: activeTool === "select",
  };

  switch (obj.type) {
    case "rect":
      return (
        <Rect
          {...commonProps}
          key={obj.id}
          x={obj.x}
          y={obj.y}
          width={obj.width ?? 0}
          height={obj.height ?? 0}
          fill={obj.fill ?? getDefault("rect", "fill")}
          stroke={obj.stroke ?? getDefault("rect", "stroke")}
          strokeWidth={obj.strokeWidth ?? getDefault("rect", "strokeWidth")}
        />
      );

    case "circle":
      return (
        <Circle
          {...commonProps}
          key={obj.id}
          x={obj.x}
          y={obj.y}
          radius={obj.radius ?? 0}
          fill={obj.fill ?? getDefault("circle", "fill")}
          stroke={obj.stroke ?? getDefault("circle", "stroke")}
          strokeWidth={obj.strokeWidth ?? getDefault("circle", "strokeWidth")}
        />
      );

    case "arrow":
      return (
        <Arrow
          {...commonProps}
          key={obj.id}
          points={obj.points ?? []}
          pointerLength={10}
          pointerWidth={10}
          fill={obj.fill ?? getDefault("arrow", "fill")}
          stroke={obj.stroke ?? getDefault("arrow", "stroke")}
          strokeWidth={obj.strokeWidth ?? getDefault("arrow", "strokeWidth")}
        />
      );

    case "text":
      return (
        <Text
          {...commonProps}
          key={obj.id}
          x={obj.x}
          y={obj.y}
          text={obj.text ?? ""}
          fontSize={obj.fontSize ?? getDefault("text", "fontSize")}
          fill={obj.fill ?? getDefault("text", "fill")}
        />
      );

    case "pen":
      return (
        <Line
          {...commonProps}
          key={obj.id}
          points={obj.points ?? []}
          stroke={obj.stroke ?? getDefault("pen", "stroke")}
          strokeWidth={obj.strokeWidth ?? getDefault("pen", "strokeWidth")}
          lineCap="round"
          lineJoin="round"
        />
      );

    default:
      return null;
  }
}
