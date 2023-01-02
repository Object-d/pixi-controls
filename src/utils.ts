import { CornerControlType, ControlType, ACoordsProps, CornerProps, OppositeType, Transform } from './type';
import { Sprite } from 'pixi.js';

// css cursor
export const cursorMap = {
  tr: "nesw-resize",
  tl: "nwse-resize",
  br: "nwse-resize",
  bl: "nesw-resize",
  mr: "ew-resize",
  mt: "ns-resize",
  ml: "ew-resize",
  mb: "ns-resize"
};

export const cornerTypeList: CornerControlType[] = ["tr", "tl", "br", "bl"];
export const allControlPos: ControlType[] = [
  ...cornerTypeList,
  "mr",
  "mt",
  "ml",
  "mb"
];

export const anchorMap: Record<CornerControlType, number[]> = {
  tl: [1, 1],
  tr: [0, 1],
  br: [0, 0],
  bl: [0, 1]
};

const LEFT = 'left'
const TOP = 'top'
const RIGHT = 'right'
const BOTTOM = 'bottom'
const CENTER = 'center'

export const opposite: OppositeType = {
  top: BOTTOM,
  bottom: TOP,
  left: RIGHT,
  right: LEFT,
  center: CENTER,
}

export const distances = (x1: number, x2: number, y1: number, y2: number) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

export const defaultControls: any = {
  ml: {
    x: -0.5,
    y: 0,
    originX: 1,
    originY: 0.5,
  },
  mr: {
    x: 0.5,
    y: 0,
    originX: 0,
    originY: 0.5,
  },
  mb: {
    x: 0,
    y: 0.5,
    originX: 0.5,
    originY: 0,
  },
  mt: {
    x: 0,
    y: -0.5,
    originX: 0.5,
    originY: 1,
  },
  tl: {
    x: 0.5,
    y: -0.5,
    originX: 1,
    originY: 1,
  },
  bl: {
    x: -0.5,
    y: 0.5,
    originX: 1,
    originY: 0,
  },
  br: {
    x: 0.5,
    y: 0.5,
    originX: 0,
    originY: 0,
  },
  tr: {
    x: 0.5,
    y: -0.5,
    originX: 0,
    originY: 1,
  }
}

/**
 * 计算element的包围盒
 * @param element 选中元素
 * @returns 
 */
export const calcACoords = (element: Sprite): ACoordsProps => {
  return {
    tl: {
      x: element.vertexData[0],
      y: element.vertexData[1],
    },
    tr: {
      x: element.vertexData[2],
      y: element.vertexData[3],
    },
    br: {
      x: element.vertexData[4],
      y: element.vertexData[5],
    },
    bl: {
      x: element.vertexData[6],
      y: element.vertexData[7],
    }
  }

}

/**
 * 计算border的坐标
 * @param aCoords element的包围盒
 * @param padding 边距
 * @returns 
 */
export const calcLineCoords = (aCoords: ACoordsProps, padding: number) => {
  const lineCoords = {
    tl: {
      x: aCoords.tl.x - padding,
      y: aCoords.tl.y - padding,
    },
    tr: {
      x: aCoords.tr.x + padding,
      y: aCoords.tr.y - padding,
    },
    br: {
      x: aCoords.br.x + padding,
      y: aCoords.br.y + padding,
    },
    bl: {
      x: aCoords.bl.x - padding,
      y: aCoords.bl.y + padding,
    }
  };

  return lineCoords;
}

/**
 * 计算
 * @param oCoords 
 * @param cornerSize 
 * @returns 
 */
export const calcCornerCoords = (lCoords: ACoordsProps, cornerSize: number = 13): CornerProps => {
  function calcItem(centerX: number, centerY: number, cornerSize: number) {
    const halfSize = cornerSize / 2;
    return {
      tl: {
        x: centerX - halfSize,
        y: centerY - halfSize,
      },
      tr: {
        x: centerX + halfSize,
        y: centerY - halfSize,
      },
      bl: {
        x: centerX - halfSize,
        y: centerY + halfSize,
      },
      br: {
        x: centerX + halfSize,
        y: centerY + halfSize,
      },
    };
  }

  const mtx = (lCoords.tl.x + lCoords.tr.x) / 2;
  const mbx = (lCoords.bl.x + lCoords.br.x) / 2;
  const mly = (lCoords.tl.y + lCoords.bl.y) / 2;
  const mry = (lCoords.tr.y + lCoords.br.y) / 2;

  const cornerCoords: CornerProps = {
    tl: { ...lCoords.tl, corner: calcItem(lCoords.tl.x, lCoords.tl.y, cornerSize) },
    tr: { ...lCoords.tr, corner: calcItem(lCoords.tl.x, lCoords.tl.y, cornerSize) },
    bl: { ...lCoords.bl, corner: calcItem(lCoords.tl.x, lCoords.tl.y, cornerSize) },
    br: { ...lCoords.br, corner: calcItem(lCoords.tl.x, lCoords.tl.y, cornerSize) },
    mt: {
      x: mtx,
      y: lCoords.tr.y,
      corner: calcItem(mtx, lCoords.tr.y, cornerSize)
    },
    mb: {
      x: mbx,
      y: lCoords.br.y,
      corner: calcItem(mbx, lCoords.br.y, cornerSize)
    },
    ml: {
      x: lCoords.bl.x,
      y: mly,
      corner: calcItem(lCoords.bl.x, mly, cornerSize)
    },
    mr: {
      x: lCoords.br.x,
      y: mry,
      corner: calcItem(lCoords.br.x, mry, cornerSize)
    },
  };

  return cornerCoords;
}

/**
 * 计算相对object的锚点的坐标
 * 点击点 - 原点位置 
 */
export const getLocalPoint = (element: Sprite, transf: Transform, padding: number, x: number, y: number) => {
  const point = element.getGlobalPosition()

  console.log('this.transf', transf);
  
  const localPoint = {
    x: x - point.x,
    y: y - point.y,
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