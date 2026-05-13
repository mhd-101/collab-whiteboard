import { TextObject } from "../../types/shapes";

export function createTextObject(x: number, y: number): TextObject {
  return {
    id: crypto.randomUUID(),
    type: "text",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    x,
    y,
    text: "Double click to edit",
    fontSize: 16,
    fill: "#000000",
  };
}
