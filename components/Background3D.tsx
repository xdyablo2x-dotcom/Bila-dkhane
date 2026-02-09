
import React, { useEffect, useRef } from 'react';

const Background3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let particles: { x: number; y: number; z: number; vx: number; vy: number; vz: number; color: string }[] = [];
    const count = 120; // Plus de particules pour l'effet 4K

    const colors = ['#10b981', '#06b6d4', '#8b5cf6'];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    };

    const animate = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw global subtle glow
      const grd = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width);
      grd.addColorStop(0, 'rgba(16, 185, 129, 0.05)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z -= p.vz;

        if (p.z <= 0) p.z = 1000;
        
        const scale = 500 / (500 + p.z);
        const px = (p.x - centerX) * scale + centerX;
        const py = (p.y - centerY) * scale + centerY;
        const pr = 3 * scale;

        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = scale * 0.7;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Neural connections logic
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y, p.z - p2.z);
          if (dist < 180) {
            const scale2 = 500 / (500 + p2.z);
            const px2 = (p2.x - centerX) * scale2 + centerX;
            const py2 = (p2.y - centerY) * scale2 + centerY;

            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px2, py2);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 180) * scale * 0.15;
            ctx.lineWidth = 0.8 * scale;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener('resize', init);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', init);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export default Background3D;
