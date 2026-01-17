import type { DrawingData } from "../types/drawing";

export function normalizeDrawingData(raw: any): DrawingData {
  const data: DrawingData = {
    width: Number(raw?.width ?? 500),
    height: Number(raw?.height ?? 400),
    background: raw?.background ?? "#ffffff",
    commands: Array.isArray(raw?.commands) ? raw.commands : [],
  };

  data.commands = data.commands.map((cmd: any) => {
    if (!cmd || typeof cmd !== "object") return cmd;

    // ✅ rect: map width/height -> w/h
    if (cmd.type === "rect") {
      const w = cmd.w ?? cmd.width;
      const h = cmd.h ?? cmd.height;

      return {
        ...cmd,
        w: Number(w),
        h: Number(h),
      };
    }

    // ✅ triangle: if model gave x,y plus x1,y1,x2,y2, fix to x1,y1,x2,y2,x3,y3
    if (cmd.type === "triangle") {
      // sometimes models send: x,y,x1,y1,x2,y2  (3 points but named weirdly)
      // We'll interpret (x,y) as the first point if x1/y1/x2/y2 exist
      const hasWeird =
        typeof cmd.x === "number" &&
        typeof cmd.y === "number" &&
        typeof cmd.x1 === "number" &&
        typeof cmd.y1 === "number" &&
        typeof cmd.x2 === "number" &&
        typeof cmd.y2 === "number" &&
        (cmd.x3 === undefined || cmd.y3 === undefined);

      if (hasWeird) {
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

      return cmd;
    }

    return cmd;
  });

  return data;
}