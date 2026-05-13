import { useEffect, useState } from "react";

type CanvasDimensions = {
  width: number;
  height: number;
};

export function useCanvasDimensions(
  containerRef: React.RefObject<HTMLDivElement | null>,
): CanvasDimensions {
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    // Use ResizeObserver for element-specific size changes
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    updateDimensions(); // Get initial dimensions
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return dimensions;
}
