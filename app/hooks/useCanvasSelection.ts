import { useEffect, useRef } from "react";
import Konva from "konva";

export function useCanvasSelection(selectedObjectId: string | null) {
  const transformerRef = useRef<Konva.Transformer>(null);

  // Attach transformer to the selected node
  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    if (selectedObjectId) {
      // Find the node by traversing the transformer's parent layer
      const layer = transformer.getLayer();
      if (!layer) return;

      const node = layer.findOne("#" + selectedObjectId);
      if (node && node instanceof Konva.Shape) {
        transformer.nodes([node]);
        return;
      }
    }
    transformer.nodes([]);
  }, [selectedObjectId]);

  return { transformerRef };
}
