import type { CanvasCommand, DrawingData } from "../types/drawing";

export function drawOnCanvas(canvas: HTMLCanvasElement, data: DrawingData) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = data.width ?? 500;
  canvas.height = data.height ?? 400;

  // clear + background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = data.background ?? "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const cmd of data.commands ?? []) {
    drawCommand(ctx, cmd);
  }
}

/**
 * Gemini/LLM sometimes returns slightly different field names:
 * - rect: width/height instead of w/h
 * - line: sometimes sends x,y (start) + x1,y1 (end) instead of x1,y1,x2,y2
 * - triangle: sometimes mixes x,y with x1,y1,x2,y2 and misses x3,y3
 * This function normalizes the command to what our renderer expects.
 */
function normalizeCommand(cmd: any): any {
  if (!cmd || typeof cmd !== "object") return cmd;

  if (cmd.type === "rect") {
    // Support both: w/h and width/height
    const w = cmd.w ?? cmd.width;
    const h = cmd.h ?? cmd.height;

    return {
      ...cmd,
      w: Number(w),
      h: Number(h),
    };
  }

  if (cmd.type === "line") {
    // Already correct format?
    if (
      Number.isFinite(cmd.x1) &&
      Number.isFinite(cmd.y1) &&
      Number.isFinite(cmd.x2) &&
      Number.isFinite(cmd.y2)
    ) {
      return cmd;
    }

    // Model sometimes returns: x,y (start) + x1,y1 (end)
    const hasWeird =
      Number.isFinite(cmd.x) &&
      Number.isFinite(cmd.y) &&
      Number.isFinite(cmd.x1) &&
      Number.isFinite(cmd.y1) &&
      (cmd.x2 === undefined || cmd.y2 === undefined);

    if (hasWeird) {
      return {
        ...cmd,
        x1: cmd.x,
        y1: cmd.y,
        x2: cmd.x1,
        y2: cmd.y1,
      };
    }

    return cmd;
  }

  if (cmd.type === "triangle") {
    // If x3/y3 missing but we have x,y,x1,y1,x2,y2 -> map them to 3 points
    const missingX3Y3 = cmd.x3 === undefined || cmd.y3 === undefined;

    const hasWeirdTriangle =
      typeof cmd.x === "number" &&
      typeof cmd.y === "number" &&
      typeof cmd.x1 === "number" &&
      typeof cmd.y1 === "number" &&
      typeof cmd.x2 === "number" &&
      typeof cmd.y2 === "number" &&
      missingX3Y3;

    if (hasWeirdTriangle) {
      return {
        ...cmd,
        x1: cmd.x,
        y1: cmd.y,
        x2: cmd.x1,
        y2: cmd.y1,
        x3: cmd.x2,
        y3: cmd.y2,
      };
    }
  }

  return cmd;
}

function drawCommand(ctx: CanvasRenderingContext2D, original: CanvasCommand) {
  const cmd: any = normalizeCommand(original);

  switch (cmd.type) {
    case "circle": {
      ctx.beginPath();
      ctx.arc(cmd.x, cmd.y, cmd.r, 0, Math.PI * 2);

      if (cmd.fill) {
        ctx.fillStyle = cmd.fill;
        ctx.fill();
      }
      if (cmd.stroke) {
        ctx.lineWidth = cmd.lineWidth ?? 1;
        ctx.strokeStyle = cmd.stroke;
        ctx.stroke();
      }
      return;
    }

    case "line": {
      if (
        !Number.isFinite(cmd.x1) ||
        !Number.isFinite(cmd.y1) ||
        !Number.isFinite(cmd.x2) ||
        !Number.isFinite(cmd.y2)
      ) {
        return;
      }

      ctx.beginPath();
      ctx.moveTo(cmd.x1, cmd.y1);
      ctx.lineTo(cmd.x2, cmd.y2);
      ctx.lineWidth = cmd.lineWidth ?? 1;
      ctx.strokeStyle = cmd.stroke ?? "#000";
      ctx.stroke();
      return;
    }

    case "rect": {
      // After normalization we expect cmd.w/cmd.h to exist
      const w = cmd.w;
      const h = cmd.h;

      // Guard against invalid values so canvas doesn't behave weirdly
      if (!Number.isFinite(w) || !Number.isFinite(h)) return;

      if (cmd.fill) {
        ctx.fillStyle = cmd.fill;
        ctx.fillRect(cmd.x, cmd.y, w, h);
      }
      if (cmd.stroke) {
        ctx.lineWidth = cmd.lineWidth ?? 1;
        ctx.strokeStyle = cmd.stroke ?? "#000";
        ctx.strokeRect(cmd.x, cmd.y, w, h);
      }
      return;
    }

    case "triangle": {
      // After normalization we expect x1..x3,y1..y3
      if (
        !Number.isFinite(cmd.x1) ||
        !Number.isFinite(cmd.y1) ||
        !Number.isFinite(cmd.x2) ||
        !Number.isFinite(cmd.y2) ||
        !Number.isFinite(cmd.x3) ||
        !Number.isFinite(cmd.y3)
      ) {
        return;
      }

      ctx.beginPath();
      ctx.moveTo(cmd.x1, cmd.y1);
      ctx.lineTo(cmd.x2, cmd.y2);
      ctx.lineTo(cmd.x3, cmd.y3);
      ctx.closePath();

      if (cmd.fill) {
        ctx.fillStyle = cmd.fill;
        ctx.fill();
      }
      if (cmd.stroke) {
        ctx.lineWidth = cmd.lineWidth ?? 1;
        ctx.strokeStyle = cmd.stroke ?? "#000";
        ctx.stroke();
      }
      return;
    }

    case "text": {
      ctx.font = cmd.font ?? "16px Arial";
      ctx.fillStyle = cmd.fill ?? "#000";
      ctx.fillText(cmd.text, cmd.x, cmd.y);
      return;
    }

    default:
      // Unknown command type - ignore safely
      return;
  }
}