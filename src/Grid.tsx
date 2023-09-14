import { useState } from "react";
import { Peeps } from "./Peeps";
import { Canvas } from "./Canvas";

const peeps = new Peeps(10);

export const Grid = () => {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [canvasWidth, setCanvasWidth] = useState(0);
  const establishContext = (context: CanvasRenderingContext2D) => setCtx(context);
  const establishCanvasWidth = (width: number) => setCanvasWidth(width);

  const draw = (elapsedTime: number) => {
    if (ctx) {
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      peeps.individuals.forEach((indiv) => {
        const c = indiv.getColor();
        ctx.fillStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        ctx.beginPath();
        ctx.arc(indiv.x, indiv.y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
      });
    }
  };

  return <Canvas draw={draw} establishCanvasWidth={establishCanvasWidth} establishContext={establishContext}></Canvas>;
};
