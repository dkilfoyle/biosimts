import { useEffect, useRef } from "react";
import { Peeps } from "./Peeps";
import _ from "lodash";

const peeps = new Peeps(100);

export const Canvas2 = () => {
  console.log("redraw");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef(0);
  const size = { width: 900, height: 900 };

  const renderFrame = () => {
    const ctx = canvasRef.current!.getContext("2d");
    peeps.update();
    if (ctx) {
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const deltaX = ctx.canvas.width / 128;
      const deltaY = ctx.canvas.height / 128;
      const offX = deltaX / 2;
      const offY = deltaY / 2;

      _.range(0, 128).forEach((i) => {
        ctx.beginPath();
        ctx.moveTo(i * deltaX, 0);
        ctx.lineTo(i * deltaX, ctx.canvas.height);
        ctx.strokeStyle = "lightGrey";
        ctx.lineWidth = 0.1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * deltaY);
        ctx.lineTo(ctx.canvas.width, i * deltaY);
        ctx.strokeStyle = "lightGrey";
        ctx.lineWidth = 0.1;
        ctx.stroke();
      });

      peeps.individuals.forEach((indiv) => {
        const c = indiv.getColor();
        ctx.fillStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        ctx.beginPath();
        ctx.arc(indiv.x * deltaX + offX, indiv.y * deltaY + offY, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
      });
    }
  };

  const tick = () => {
    if (!canvasRef.current) return;
    renderFrame();
    requestIdRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    requestIdRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(requestIdRef.current);
    };
  }, []);

  return <canvas {...size} ref={canvasRef} />;
};
