import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  Application,
  Sprite,
} from "pixi.js";
import {Controls} from '../src';

const containerSize = 800

const App = () => {
  const ref = React.useRef(null)
  React.useEffect(() => {
    const app = new Application({
      width: containerSize,
      height: containerSize
    });
    ref.current.appendChild(app.view);

    const luFei = Sprite.from(
      "https://img1.baidu.com/it/u=2082729884,1583333066&fm=253&fmt=auto&app=138&f=JPEG?w=400&h=711"
    );
    // luFei.anchor.set(0.5); // 设置锚点，position以锚点为基础
    app.stage.addChild(luFei);
    luFei.position.set(300, 300);
    luFei.anchor.set(0.5)
    luFei.width = 100
    luFei.height = 100
    console.log('选中的元素', luFei)
    console.log('选中的元素.getBounds', luFei.getBounds())
    console.log('选中的元素.getLocalBounds', luFei.getLocalBounds())
    console.log('选中的元素.getGlobalPosition', luFei.getGlobalPosition())

    setTimeout(() => {
      const ctrlGraph = new Controls({
        element: luFei,
        cornerColor: 0xec6c00,
        cornerSize: 20,
        padding: 20,
        cornerStyle: "square",
        cornerStrokeColor: 0xec6c00,
        borderColor: 0xec6c00,
        transparentCorners: true,
        hasBorders: true,
        centeredScaling: true,
        controlVisibleList: ["tr", "bl", "br", "mb", "tl", "mt", "mr", "ml"]
      });
      app.stage.addChild(ctrlGraph);
    }, 2000);
   
  }, [])
  return (
    <div ref={ref} style={{width: containerSize, height: containerSize}} >
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
