import { CornerControlType, ControlType, ACoordsProps, CornerProps, OppositeType, Transform, Position } from './type';
import { Sprite } from 'pixi.js';

// css cursor
export const cursorMap: any = {
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

export const originXOffset: Record<string, number> = {
  left: -0.5,
  center: 0,
  right: 0.5
};

export const originYOffset: Record<string, number> = {
  top: -0.5,
  center: 0,
  bottom: 0.5
};

export const anchorX: Record<string, number> = {
  right: 1,
  left: 0,
  center: 0.5
}


export const anchorY: Record<string, number> = {
  bottom: 1,
  top: 0,
  center: 0.5
}

export const defaultControls: any = {
  ml: {
    x: -0.5,
    y: 0,
    originX: 'right',
    originY: 'center',
  },
  mr: {
    x: 0.5,
    y: 0,
    originX: 'left',
    originY: 'center',
  },
  mb: {
    x: 0,
    y: 0.5,
    originX: 'center',
    originY: 'top',
  },
  mt: {
    x: 0,
    y: -0.5,
    originX: 'center',
    originY: 'bottom',
  },
  tl: {
    x: 0.5,
    y: -0.5,
    originX: 'right',
    originY: 'bottom',
  },
  bl: {
    x: -0.5,
    y: 0.5,
    originX: 'right',
    originY: 'top',
  },
  br: {
    x: 0.5,
    y: 0.5,
    originX: 'left',
    originY: 'top',
  },
  tr: {
    x: 0.5,
    y: -0.5,
    originX: 'left',
    originY: 'bottom',
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
    tr: { ...lCoords.tr, corner: calcItem(lCoords.tr.x, lCoords.tr.y, cornerSize) },
    bl: { ...lCoords.bl, corner: calcItem(lCoords.bl.x, lCoords.bl.y, cornerSize) },
    br: { ...lCoords.br, corner: calcItem(lCoords.br.x, lCoords.br.y, cornerSize) },
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
