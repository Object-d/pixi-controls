import { Graphics, Sprite } from "pixi.js";
import {
  ControlConfigProps,
  ControlType,
  ControlsProps,
  Transform,
} from "./type";
import { allControlPos, calcACoords, calcCornerCoords, calcLineCoords, defaultControls, getLocalPoint, opposite } from './utils';
import { Control } from "./control";
import { ACoordsProps, CornerProps } from './type';

export class Controls extends Sprite {
  private coords: ACoordsProps;
  private lCoords: ACoordsProps;
  private cornerCoords: CornerProps;
  private config: ControlConfigProps;
  private padding: number;
  private borderColor: number;
  private element: Sprite;
  private controlVisibleList: ControlType[];
  private transf: Transform;
  private targetSize: { width: number, height: number }
  private dragging: Boolean = false;
  private rendering: number = 0;

  constructor(options: ControlsProps) {
    super();
    this.config = {
      cornerColor: options.cornerColor,
      cornerSize: options.cornerSize,
      cornerStyle: options.cornerStyle,
      transparentCorners: options.transparentCorners,
      centeredScaling: options.centeredScaling
    };
    this.transf = {
      scaleX: 1,
      scaleY: 1,
      signX: 1,
      signY: 1,
      action: "scaleX",
      ex: 0,
      ey: 0,
      originX: 0,
      originY: 0
    }
    this.visible = !!options.hasBorders;
    this.borderColor = options.borderColor || 0xec6c00;
    this.element = options.element;
    this.padding = options.padding || 0; // TODO: zoom
    this.controlVisibleList = options.controlVisibleList || allControlPos;
    this.coords = calcACoords(this.element)
    this.lCoords = calcLineCoords(this.coords, this.padding)
    this.cornerCoords = calcCornerCoords(this.lCoords, this.config.cornerSize)

    const bounds = this.element.getLocalBounds();
    this.targetSize = {
      width: bounds.width,
      height: bounds.height,
    }

    this.renderControls()
  }

  renderControls() {
    this.coords = calcACoords(this.element)
    this.lCoords = calcLineCoords(this.coords, this.padding)
    this.cornerCoords = calcCornerCoords(this.lCoords, this.config.cornerSize)

    this.renderBorder();
    this.renderCorners();
  }

  renderObject() {
    // 会造成offset，调整x，y
    this.element.anchor.set(this.transf.originX, this.transf.originY)
  }

  renderBorder() {
    const poly = new Graphics();
    const lCoords = this.lCoords;

    poly.clear();
    poly.lineStyle(1, this.borderColor);
    poly.beginFill(this.config.cornerColor, 0);
    poly.drawPolygon([
      lCoords.tl,
      lCoords.tr,
      lCoords.br,
      lCoords.bl,
      lCoords.tl
    ]);

    poly.endFill();
    this.addChild(poly);
  }

  setTargetScale(scaleX?: number, scaleY?: number) {
    if (!this.rendering) {
      this.rendering = requestAnimationFrame(() => {
        if (this.rendering) {
          cancelAnimationFrame(this.rendering);
        }
        if (scaleX !== undefined) {
          this.element.scale.x = scaleX
          this.transf.scaleX = scaleX;
        }
        if (scaleY !== undefined) {
          this.element.scale.y = scaleY
          this.transf.scaleY = scaleY;
        }
        this.removeChildren()
        this.renderControls();
        this.rendering = 0;
      })
    }
  }

  scaleObject(event: any, options?: any) {
    let by = options?.by
    const point = event.data.global
    let newPoint = getLocalPoint(this.element, this.transf, this.padding, point.x, point.y)
    let scaleX = Math.abs(newPoint.x / this.targetSize.width);
    let scaleY = Math.abs(newPoint.y / this.targetSize.height);

    if (!by) {
      this.setTargetScale(scaleX, scaleY)
    }
    else {
      by === 'x' && this.setTargetScale(scaleX);
      by === 'y' && this.setTargetScale(undefined, scaleY);
    }
  }

  scaleObjectX(event: any) {
    this.scaleObject(event, { by: 'x' });
  }

  scaleObjectY(event: any) {
    this.scaleObject(event, { by: 'y' });
  }

  scaleObjectFromCorner(event: any) {
    this.scaleObject(event);
  }

  onDragStart = (event: any) => {
    const control = event.currentTarget
    this.transf = {
      ...this.transf,
      corner: control.pos,
      originX: defaultControls[control.pos].originX,
      originY: defaultControls[control.pos].originY,
    }

    this.renderObject()
    this.renderControls()
        
    if (!this.dragging) {
      this.dragging = true
    }
  }

  onDragMove = (event: any) => {
    if (this.dragging) {
      if (this.transf.corner === 'mr' || this.transf.corner === 'ml') {
        this.scaleObjectX(event)
      } else if (this.transf.corner === 'mt' || this.transf.corner === 'mb') {
        this.scaleObjectY(event)
      } else {
        this.scaleObjectFromCorner(event)
      }
    }
  }

  onDragEnd = () => {
    if (this.dragging) {
      this.dragging = false
    }
  }

  renderCorners() {
    const poss = Object.keys(this.cornerCoords) as ControlType[];
    const controls: any[] = poss.map((pos) => {
      const control = this.cornerCoords[pos];
      return new Control({
        ...this.config,
        x: control.x,
        y: control.y,
        pos,
        element: this.element,
        visible: this.controlVisibleList.includes(pos),
        onDragStart: this.onDragStart,
        onDragEnd: this.onDragEnd,
        onDragMove: this.onDragMove,
      });
    });

    this.addChild(...controls);
  }
}
