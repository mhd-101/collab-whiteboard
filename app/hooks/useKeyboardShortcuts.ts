import { useCallback, useEffect } from "react";
import { CanvasObject } from "../types/shapes";

export function useKeyboardShortcuts(
  selectedObjectId: string | null,
  setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>,
  setSelectedObjectId: React.Dispatch<React.SetStateAction<string | null>>,
) {
  const deleteSelectedObject = useCallback(() => {
    if (selectedObjectId) {
      setObjects((prev) => prev.filter((obj) => obj.id !== selectedObjectId));
      setSelectedObjectId(null);
    }
  }, [selectedObjectId, setObjects, setSelectedObjectId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedObjectId) {
        deleteSelectedObject();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedObject, selectedObjectId]);
}
