
export type CornerControlType = "tl" | "tr" | "br" | "bl";
export type MiddleControlType = "mr" | "mt" | "ml" | "mb";
export type ControlType = CornerControlType | MiddleControlType;

export type ControlPostionType = {
  [key in ControlType]: { x: number; y: number };
};
export type CornerStyleType = "circle" | "square";

export interface ControlConfigProps {
  cornerSize?: number;
  cornerColor?: number;
  cornerStrokeColor?: number;
  cornerStyle?: CornerStyleType;
  transparentCorners?: boolean;
  centeredScaling?: boolean;
}

export interface ControlProps extends ControlConfigProps {
  x: number;
  y: number;
  element: any;
  visible: boolean;
  corner: string;
  onDragStart: (event: MouseEvent) => void;
  onMouceMove: (event: MouseEvent) => void;
}

export interface ControlsProps extends ControlConfigProps {
  element: any;
  hasBorders?: boolean;
  padding?: number;
  borderColor?: number;
  controlVisibleList?: ControlType[];
  scaleProportionally?: boolean; // TODO 按比例缩放
}

export interface OriginalTransform {
  scaleX: number;
  scaleY: number;
}

export interface Transform {
  corner?: string;
  originX: number | string; //
  originY: number | string;
  scaleX: number; // 缩放
  scaleY: number; // 缩放
  original: OriginalTransform; // 每一次拖拽开始记录
}

export enum Direction {
  LEFT = 'left',
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'left',
  CENTER = 'center'
}

export type OppositeType = { [key: string]: string }

export interface Position {
  x: number;
  y: number;
}

export interface ACoordsProps {
  tr: Position,
  br: Position,
  tl: Position,
  bl: Position,
}

export interface OCoordsProps extends ACoordsProps {
  mt: Position;
  ml: Position;
  mr: Position;
  mb: Position;
}

export interface CornerItemProps {
  x: number;
  y: number;
  corner: ACoordsProps;
}

export interface CornerProps {
  tr: CornerItemProps,
  br: CornerItemProps,
  tl: CornerItemProps,
  bl: CornerItemProps,
  mt: CornerItemProps;
  ml: CornerItemProps;
  mr: CornerItemProps;
  mb: CornerItemProps;
}