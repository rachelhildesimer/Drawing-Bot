import { useEffect, useRef } from "react";
import { drawOnCanvas } from "../../drawing/draw";
import type { DrawingData } from "../../types/drawing";

export function CanvasBoard(props: { data: DrawingData }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    drawOnCanvas(canvasRef.current, props.data);
  }, [props.data]);

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={props.data.width || 500}
        height={props.data.height || 400}
        className="main-canvas"
      />
    </div>
  );
}