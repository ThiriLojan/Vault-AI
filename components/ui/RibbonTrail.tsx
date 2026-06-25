"use client";

import { useEffect } from "react";

export default function RibbonTrail() {
  useEffect(() => {
    const trailCanvas = document.createElement("canvas");
    trailCanvas.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
    document.body.appendChild(trailCanvas);
    const tctx = trailCanvas.getContext("2d");

    if (!tctx) return;

    function resizeTrail() {
      trailCanvas.width = window.innerWidth;
      trailCanvas.height = window.innerHeight;
    }
    resizeTrail();
    window.addEventListener("resize", resizeTrail);

    const ribbonPoints: any[] = [];
    const MAX_RIBBON = 80;
    const mouse = { x: -999, y: -999 };
    const prevMouse = { x: -999, y: -999 };
    let isMoving = false;
    let moveTimeout: any;

    const onMouseMove = (e: MouseEvent) => {
      prevMouse.x = mouse.x;
      prevMouse.y = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      isMoving = true;
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        isMoving = false;
      }, 80);

      const last = ribbonPoints[ribbonPoints.length - 1];
      if (!last || Math.hypot(mouse.x - last.x, mouse.y - last.y) > 2) {
        ribbonPoints.push({
          x: mouse.x,
          y: mouse.y,
          age: 0,
        });
        if (ribbonPoints.length > MAX_RIBBON) ribbonPoints.shift();
      }
    };
    document.addEventListener("mousemove", onMouseMove);

    let animationFrameId: number;

    function drawRibbon() {
      if (!tctx) return;
      tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

      for (let i = ribbonPoints.length - 1; i >= 0; i--) {
        ribbonPoints[i].age += 1;
        if (ribbonPoints[i].age > MAX_RIBBON) {
          ribbonPoints.splice(i, 1);
        }
      }

      if (ribbonPoints.length >= 4) {
        tctx.save();
        tctx.lineCap = "round";
        tctx.lineJoin = "round";

        for (let pass = 0; pass < 3; pass++) {
          tctx.beginPath();
          for (let i = 0; i < ribbonPoints.length; i++) {
            const p = ribbonPoints[i];
            if (i === 0) tctx.moveTo(p.x, p.y);
            else {
              const prev = ribbonPoints[i - 1];
              const mx = (prev.x + p.x) / 2;
              const my = (prev.y + p.y) / 2;
              tctx.quadraticCurveTo(prev.x, prev.y, mx, my);
            }
          }

          const alpha = pass === 0 ? 0.04 : pass === 1 ? 0.12 : 0.55;
          const width = pass === 0 ? 18 : pass === 1 ? 5 : 1.2;

          const newest = ribbonPoints[ribbonPoints.length - 1];
          const oldest = ribbonPoints[0];
          const grad = tctx.createLinearGradient(
            oldest.x,
            oldest.y,
            newest.x,
            newest.y
          );
          if (pass === 2) {
            grad.addColorStop(0, `rgba(255,255,255,0)`);
            grad.addColorStop(0.4, `rgba(220,240,255,${alpha * 0.3})`);
            grad.addColorStop(0.75, `rgba(255,255,255,${alpha * 0.8})`);
            grad.addColorStop(1, `rgba(255,255,255,${alpha})`);
          } else {
            grad.addColorStop(0, `rgba(180,220,255,0)`);
            grad.addColorStop(0.5, `rgba(200,235,255,${alpha * 0.5})`);
            grad.addColorStop(1, `rgba(220,245,255,${alpha})`);
          }

          tctx.strokeStyle = grad;
          tctx.lineWidth = width;
          if (pass === 0) {
            tctx.shadowBlur = 20;
            tctx.shadowColor = "rgba(200,230,255,0.3)";
          } else if (pass === 1) {
            tctx.shadowBlur = 8;
            tctx.shadowColor = "rgba(255,255,255,0.2)";
          } else {
            tctx.shadowBlur = 4;
            tctx.shadowColor = "rgba(255,255,255,0.8)";
          }
          tctx.stroke();
          tctx.shadowBlur = 0;
        }

        if (isMoving) {
          tctx.beginPath();
          tctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2);
          tctx.fillStyle = "rgba(255,255,255,0.95)";
          tctx.shadowBlur = 12;
          tctx.shadowColor = "rgba(200,240,255,1)";
          tctx.fill();
          tctx.shadowBlur = 0;
        }

        tctx.restore();
      }
      animationFrameId = requestAnimationFrame(drawRibbon);
    }
    drawRibbon();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeTrail);
      document.removeEventListener("mousemove", onMouseMove);
      if (document.body.contains(trailCanvas)) {
        document.body.removeChild(trailCanvas);
      }
    };
  }, []);

  return null;
}
