import { useCallback, useEffect, useRef, useState } from "react";

export interface CanvasProps {
  draw: (fps: number) => void;
  fps?: number;
  establishContext: (ctx: CanvasRenderingContext2D) => void;
  establishCanvasWidth: (width: number) => void;
  width?: string;
  height?: string;
  backgroundColor?: string;
}

export const Canvas = (props: CanvasProps) => {
  const { draw, fps = 30, establishContext, establishCanvasWidth, width = "100%", height = "100%", backgroundColor = "#000", ...rest } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D>();

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw Error();
      setContext(ctx);
      resizeCanvas(ctx);
      if (establishContext) establishContext(ctx);
    }
  }, []);

  const resizeCanvas = (context: CanvasRenderingContext2D) => {
    const canvas = context.canvas;
    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== width || canvas.height !== height) {
      const { devicePixelRatio: ratio = 1 } = window;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      if (establishCanvasWidth) establishCanvasWidth(canvas.width);
      context.scale(ratio, ratio);
      return true;
    }
    return false;
  };

  useEffect(() => {
    let animationFrameId: number;
    let fpsInterval: number;
    let now: number;
    let then: number;
    let elapsed: number;
    if (context) {
      const render = () => {
        resizeCanvas(context);
        animationFrameId = window.requestAnimationFrame(render);
        now = Date.now();
        elapsed = now - then;
        if (elapsed > fpsInterval) {
          then = now - (elapsed % fpsInterval);
          draw(elapsed);
        }
      };
      const startRendering = (fps: number) => {
        fpsInterval = 1000 / fps;
        then = Date.now();
        render();
      };
      startRendering(fps);
    }
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw, context, fps, resizeCanvas]);

  return <canvas ref={canvasRef} {...rest} style={{ width, height, backgroundColor }}></canvas>;
};
