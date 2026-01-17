export type CanvasCommand =
  | CircleCommand
  | LineCommand
  | RectCommand
  | TriangleCommand
  | TextCommand;

export type DrawingData = {
  width: number;
  height: number;
  background?: string;
  commands: CanvasCommand[];
};

export type CircleCommand = {
  type: "circle";
  x: number;
  y: number;
  r: number;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
};

export type LineCommand = {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  lineWidth?: number;
};

export type RectCommand = {
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
};

export type TriangleCommand = {
  type: "triangle";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
};

export type TextCommand = {
  type: "text";
  x: number;
  y: number;
  text: string;
  font?: string;
  fill?: string;
};