import { Container, Graphics, Sprite } from "pixi.js";
import {
  ControlConfigProps,
  ControlType,
  ControlsProps,
  Transform,
} from "./type";
import { allControlPos, anchorX, anchorY, calcACoords, calcCornerCoords, calcLineCoords, defaultControls, getLocalPoint, opposite, originXOffset, originYOffset } from './utils';
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
  private scaleProportionally: boolean = false;

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
      ex: 0,
      ey: 0,
      signX: 1,
      signY: 1,
      originX: 'center',
      originY: 'center',
      original: {
        scaleX: 1,
        scaleY: 1,
      }
    }
    this.interactive = true;
    this.visible = !!options.hasBorders;
    this.borderColor = options.borderColor || 0xec6c00;
    this.element = options.element;
    this.padding = options.padding || 0; // TODO: zoom
    this.controlVisibleList = options.controlVisibleList || allControlPos;
    this.scaleProportionally = options.scaleProportionally ?? false;
    if (this.config.centeredScaling) {
      this.element.anchor.set(0.5);
    }
    this.coords = calcACoords(this.element)
    this.lCoords = calcLineCoords(this.coords, this.padding)
    this.cornerCoords = calcCornerCoords(this.lCoords, this.config.cornerSize)

    const bounds = this.element.getBounds();
    this.targetSize = {
      width: bounds.width,
      height: bounds.height,
    }

    this.renderControls()
    // const origin = this.translateToGivenOrigin(
    //   this.element.getGlobalPosition(), 
    //   this.transf.originX, 
    //   this.transf.originY, 
    //   originX, 
    //   originY
    // );
    console.log("================================")
    console.log()

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
      this.element.anchor.set(anchorX[this.transf.originX], anchorY[this.transf.originY]);
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

  getTransformedDimensions() {
    const { width, height } = this.targetSize;
    const { scaleX, scaleY } = this.transf;
    return { x: width * scaleX, y: height * scaleY };
  }

  translateToGivenOrigin = (
    point: any,
    fromOriginX: string | number,
    fromOriginY: string | number,
    toOriginX: string | number,
    toOriginY: string | number
  ) => {
    let x = point.x,
      y = point.y,
      offsetX, offsetY, dim;

    if (typeof fromOriginX === 'string') {
      fromOriginX = originXOffset[fromOriginX];
    } else {
      fromOriginX -= 0.5;
    }

    if (typeof toOriginX === 'string') {
      toOriginX = originXOffset[toOriginX];
    } else {
      toOriginX -= 0.5;
    }

    offsetX = toOriginX - fromOriginX;

    if (typeof fromOriginY === 'string') {
      fromOriginY = originYOffset[fromOriginY];
    } else {
      fromOriginY -= 0.5;
    }

    if (typeof toOriginY === 'string') {
      toOriginY = originYOffset[toOriginY];
    } else {
      toOriginY -= 0.5;
    }

    offsetY = toOriginY - fromOriginY;

    if (offsetX || offsetY) {
      dim = this.getTransformedDimensions();
      x = point.x + offsetX * dim.x;
      y = point.y + offsetY * dim.y;
    }

    return {
      x, y
    };
  }

  getCenterPoint() {
    const point = this.element.getGlobalPosition(); // 实际左上角位置
    return this.translateToGivenOrigin(point, 'left', 'top', 'center', 'center');
  }

  // 相对原点
  getLocalPoint = (x: number, y: number) => {
    const padding = this.padding;
    const center = this.element.getGlobalPosition()

    const localPoint = {
      x: x - center.x,
      y: y - center.y,
    }

    if (localPoint.x >= padding) {
      localPoint.x -= padding;
    }
    if (localPoint.x <= -padding) {
      localPoint.x += padding;
    }
    if (localPoint.y >= padding) {
      localPoint.y -= padding;
    }
    if (localPoint.y <= padding) {
      localPoint.y += padding;
    }

    return localPoint
  }

  scaleObject(event: any, options?: any) {
    let by = options?.by
    const point = event.data.global
    const transform = this.transf;
    let newPoint = this.getLocalPoint(point.x, point.y)
    let scaleX: number;
    let scaleY: number;
    const dim = this.getTransformedDimensions()
    const original = transform.original

    let signX = by !== 'y' ? Math.sign(newPoint.x) : 1;
    let signY = by !== 'x' ? Math.sign(newPoint.y) : 1;

    if (this.scaleProportionally && !by) {
      const distance = Math.abs(newPoint.x) + Math.abs(newPoint.y)
      const originalDistance = Math.abs(dim.x * original.scaleX / transform.scaleX) +
        Math.abs(dim.y * original.scaleY / transform.scaleY);
      const scale = distance / originalDistance;
      scaleX = original.scaleX * scale;
      scaleY = original.scaleY * scale;
    } else {
      scaleX = Math.abs(newPoint.x * transform.scaleX / dim.x);
      scaleY = Math.abs(newPoint.y * transform.scaleY / dim.y);
    }
    if (this.config.centeredScaling) {
      scaleX *= 2;
      scaleY *= 2;
    }

    if (transform.signX !== signX && by !== 'y') {
      transform.originX = opposite[transform.originX];
      scaleX *= -1;
      transform.signX = signX;
    }
    if (transform.signY !== signY && by !== 'x') {
      transform.originY = opposite[transform.originY];
      scaleY *= -1;
      transform.signY = signY;
    }
    
    if (!by) {
      this.setTargetScale(scaleX, scaleY)
    } else {
      by === 'x' && this.setTargetScale(scaleX);
      by === 'y' && this.setTargetScale(undefined, scaleY);
    }
  }

  hoverControl(event: any) {
    if (!this.dragging) {
      this.cursor = cursorMap[event.currentTarget.corner];
    }
  }

  onDragStart = (event: any) => {
    const point = event.data.global;
    const control = event.currentTarget;
    const corner = control.corner;
    const { originX, originY } = defaultControls[corner]
    this.cursor = cursorMap[corner];

    this.transf = {
      ...this.transf,
      corner,
      originX,
      originY,
      original: {
        scaleX: this.transf.scaleX,
        scaleY: this.transf.scaleY,
      },
      ex: point.x,
      ey: point.y,
    }


    this.renderObject()
    this.renderControls()

    if (!this.dragging) {
      this.dragging = true
    }
  }

  onDragMove = (event: any) => {
    const point = event.data.global;
    if (this.dragging) {
      if (this.transf.corner === 'mr' || this.transf.corner === 'ml') {
        this.scaleObject(event, { by: 'x' });
      } else if (this.transf.corner === 'mt' || this.transf.corner === 'mb') {
        this.scaleObject(event, { by: 'y' });
      } else {
        this.scaleObject(event)
      }

      this.transf.ex = point.x;
      this.transf.ey = point.y;
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
        visible: this.controlVisibleList.includes(corner),
        onDragStart: this.onDragStart,
        onMouceMove: this.hoverControl,
      });
    });

    this.addChild(...controls);
  }
}
