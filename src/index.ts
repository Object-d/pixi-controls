import { Container, Graphics, Sprite } from "pixi.js";
import {
  ControlConfigProps,
  ControlType,
  ControlsProps,
  Transform,
} from "./type";
import { allControlPos, calcACoords, calcCornerCoords, calcLineCoords, defaultControls, getLocalPoint } from './utils';
import { Control } from "./control";
import { ACoordsProps, CornerProps } from './type';
import {
  cursorMap,
} from './utils'

export class Controls extends Container {
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
    this.interactive = true;
    this.visible = !!options.hasBorders;
    this.borderColor = options.borderColor || 0xec6c00;
    this.element = options.element;
    this.padding = options.padding || 0; // TODO: zoom
    this.controlVisibleList = options.controlVisibleList || allControlPos;
    if (this.config.centeredScaling) {
      this.element.anchor.set(0.5);
    }
    this.coords = calcACoords(this.element)
    this.lCoords = calcLineCoords(this.coords, this.padding)
    this.cornerCoords = calcCornerCoords(this.lCoords, this.config.cornerSize)

    const bounds = this.element.getLocalBounds();
    this.targetSize = {
      width: bounds.width,
      height: bounds.height,
    }

    this.renderControls()

    // 下面事件需要把控件、边框都包含在内
    this.on("mouseup", this.onDragEnd)
    .on("mouseupoutside", this.onDragEnd)
    .on("mousemove", this.onDragMove)
  }

  renderControls() {
    this.removeControls()
    this.coords = calcACoords(this.element)
    this.lCoords = calcLineCoords(this.coords, this.padding)
    this.cornerCoords = calcCornerCoords(this.lCoords, this.config.cornerSize)

    this.renderControlsContainer()
    this.renderBorder();
    this.renderCorners();
  }

  removeControls() {
    this.removeChildren()
  }

  renderObject() {
    // 会造成offset，调整x，y
    if (!this.config.centeredScaling) {
      this.element.anchor.set(this.transf.originX, this.transf.originY)
    }
  }

  renderControlsContainer() {
    const poly = new Graphics();
    const cornerCoords = this.cornerCoords;

    poly.clear();
    poly.interactive = true;
    poly.lineStyle(0, this.borderColor);
    poly.beginFill(this.config.cornerColor, 0.1);
    poly.drawPolygon([
      cornerCoords.tl.corner.tl,
      cornerCoords.tr.corner.tr,
      cornerCoords.br.corner.br,
      cornerCoords.bl.corner.bl,
      cornerCoords.tl.corner.tl
    ]);

    poly.endFill();
    this.addChild(poly);
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

    if (this.config.centeredScaling) {
      scaleX *= 2;
      scaleY *= 2;
    }
    if (!by) {
      this.setTargetScale(scaleX, scaleY)
    } else {
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

  hoverControl(event: any) {
    this.cursor = cursorMap[event.currentTarget.corner];
  }

  onDragStart = (event: any) => {
    const control = event.currentTarget
    this.transf = {
      ...this.transf,
      corner: control.corner,
      originX: defaultControls[control.corner].originX,
      originY: defaultControls[control.corner].originY,
    }
    this.cursor = cursorMap[control.corner];

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
      this.cursor = 'auto'
    }
  }

  renderCorners() {
    const poss = Object.keys(this.cornerCoords) as ControlType[];
    const controls: any[] = poss.map((corner) => {
      const control = this.cornerCoords[corner];
      return new Control({
        ...this.config,
        x: control.x,
        y: control.y,
        corner,
        element: this.element,
        cursor: cursorMap[corner],
        visible: this.controlVisibleList.includes(corner),
        onDragStart: this.onDragStart,
      });
    });

    this.addChild(...controls);
  }
}
