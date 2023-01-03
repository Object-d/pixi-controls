import { Graphics } from "pixi.js";
import {
  ControlProps,
  CornerStyleType,
} from "./type";

export class Control extends Graphics {
  public radius: number = 0;
  private cornerColor: number;
  private cornerStrokeColor: number;
  private transparentCorners: boolean;
  corner: string;

  constructor(options: ControlProps) {
    super();
    this.radius = options.cornerSize || 10;
    this.cornerColor = options.cornerColor || 0xec6c00;
    this.cornerStrokeColor = options.cornerStrokeColor || 0xffffff;
    this.transparentCorners = options.transparentCorners ?? true;
    this.interactive = true;
    this.visible = options.visible;
    this.cursor = options.cursor;
    this.corner = options.corner;

    this.reRender(options.x, options.y, this.radius, options.cornerStyle);
    this.on("mousedown", options.onDragStart)
  }

  reRender(
    cpX: number,
    cpY: number,
    radius: number,
    type: CornerStyleType = "circle"
  ) {
    this.clear();
    this.lineStyle(1, this.cornerStrokeColor);
    this.beginFill(this.cornerColor, this.transparentCorners ? 0.001 : 1);
    if (type === "square") {
      this.drawRect(cpX - radius / 2, cpY - radius / 2, radius, radius);
    } else {
      this.drawCircle(cpX, cpY, radius);
    }
    this.endFill();
  }
}
