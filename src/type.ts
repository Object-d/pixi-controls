
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
  pos: ControlType;
  element: any;
  visible: boolean;
  onDragStart: (event: MouseEvent) => void;
  onDragMove: (event: MouseEvent) => void;
  onDragEnd: (event: MouseEvent) => void;
}

export interface ControlsProps extends ControlConfigProps {
  element: any;
  hasBorders?: boolean;
  padding?: number;
  borderColor?: number;
  controlVisibleList?: ControlType[];
  scaleProportionally?: boolean; // TODO 按比例缩放
}

export interface Transform {
  action: string; // scaleX scaleY
  scaleX: number;
  scaleY: number;
  corner?: string;
  signX: number; // x轴正负号
  signY: number; // x轴正负号
  originX: number;
  originY: number;
  ex: number; //
  ey: number; //
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