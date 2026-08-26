import React, { useRef, useEffect, useState } from "react";
import { runPhysicsStep } from "../SEFIDEFI_PhysicsEngine";

export default function WaveformSimulator({ params, onTension, onCollapse }) {
  const canvasRef = useRef(null);
  const [entity, setEntity] = useState({ x: 200, y: 150 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrame;

    const render = () => {
      const { waveform, tension, collapsed } = runPhysicsStep(params, entity);

      onTension(tension);
      if (collapsed) onCollapse({ tension });

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      ctx.beginPath();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      waveform.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Draw entity
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,200,0,0.8)";
      ctx.arc(entity.x, entity.y, params.entityRadius / 2, 0, Math.PI * 2);
      ctx.fill();

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [params, entity]);

  const handleDrag = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setEntity({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={400}
      onMouseMove={handleDrag}
      className="w-full h-full cursor-pointer"
    />
  );
}
