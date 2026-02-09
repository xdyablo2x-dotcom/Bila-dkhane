
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'https://esm.sh/three@0.160.0';
import { Skull, ShieldCheck, Activity, Info, Zap, MousePointer2, User } from 'lucide-react';
import { translations } from '../translations.ts';
import { AppLanguage } from '../types.ts';

interface AnatomyScanProps {
  language: AppLanguage;
  daysClean: number;
}

type BodyPart = 'lungs' | 'heart' | 'vessels' | null;
type ViewState = 'smoker' | 'elite' | 'current';

const AnatomyScan: React.FC<AnatomyScanProps> = ({ language, daysClean }) => {
  const t = translations[language] || translations.fr;
  const [view, setView] = useState<ViewState>('current');
  const [selectedPart, setSelectedPart] = useState<BodyPart>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  // Progress is normalized between 0 and 1 over 30 days
  const progress = Math.min(1, daysClean / 30);
  
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);

    // Realistic procedural Lungs
    const createLung = (isLeft: boolean) => {
      const group = new THREE.Group();
      group.name = 'lungs';
      const material = new THREE.MeshPhongMaterial({
        transparent: true,
        opacity: 0.6,
        shininess: 100,
        emissiveIntensity: 0.8
      });

      const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), material);
      lobe.scale.set(0.9, 1.4, 0.7);
      lobe.name = 'lungs';

      group.add(lobe);
      group.position.x = isLeft ? -0.7 : 0.7;
      return group;
    };

    const leftLung = createLung(true);
    const rightLung = createLung(false);
    bodyGroup.add(leftLung, rightLung);

    // Heart with procedural "beating" geometry
    const heartGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const heartMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      emissive: 0xaa0000,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.9
    });
    const heart = new THREE.Mesh(heartGeometry, heartMaterial);
    heart.scale.set(0.8, 1.1, 0.8);
    heart.position.set(0, 0, 0.25);
    heart.name = 'heart';
    bodyGroup.add(heart);

    // Vessels / Neural circuits
    const createVessels = () => {
      const group = new THREE.Group();
      group.name = 'vessels';
      for (let i = 0; i < 20; i++) {
        const curve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2),
          new THREE.Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3),
          new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
        );
        const points = curve.getPoints(20);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.2 });
        const line = new THREE.Line(geometry, material);
        line.name = 'vessels';
        group.add(line);
      }
      return group;
    };
    const vessels = createVessels();
    bodyGroup.add(vessels);

    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight, new THREE.AmbientLight(0x404040, 0.8));

    camera.position.z = 4.8;

    const onCanvasClick = (event: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(bodyGroup.children, true);
      setSelectedPart(intersects.length > 0 ? (intersects[0].object.name as BodyPart) : null);
    };

    canvasRef.current!.addEventListener('click', onCanvasClick);

    const animate = () => {
      requestAnimationFrame(animate);
      bodyGroup.rotation.y += 0.003;
      
      const time = Date.now() * 0.001;

      // Determine state weights for interpolation
      let weight = 0;
      if (view === 'smoker') weight = 0;
      else if (view === 'elite') weight = 1;
      else weight = progress;

      // Pulse: Faster for smoker, slower for elite
      const pulseSpeed = THREE.MathUtils.lerp(0.8, 2.5, weight);
      const pulse = Math.sin(time * pulseSpeed * Math.PI) * 0.05;

      leftLung.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
      rightLung.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
      heart.scale.set(0.8 + pulse * 1.5, 1.1 + pulse * 1.5, 0.8 + pulse * 1.5);

      // Interpolate colors
      const colorStart = new THREE.Color('#111827'); // Smoker dark
      const colorEnd = new THREE.Color('#10b981');   // Elite emerald
      const currentBodyColor = new THREE.Color().lerpColors(colorStart, colorEnd, weight);
      const currentEmissive = new THREE.Color().lerpColors(new THREE.Color('#4b5563'), new THREE.Color('#34d399'), weight);

      leftLung.children.forEach(m => {
        const mat = (m as THREE.Mesh).material as THREE.MeshPhongMaterial;
        mat.color.lerp(currentBodyColor, 0.05);
        mat.emissive.lerp(currentEmissive, 0.05);
      });
      rightLung.children.forEach(m => {
        const mat = (m as THREE.Mesh).material as THREE.MeshPhongMaterial;
        mat.color.lerp(currentBodyColor, 0.05);
        mat.emissive.lerp(currentEmissive, 0.05);
      });

      const hMat = heart.material as THREE.MeshPhongMaterial;
      hMat.color.lerp(weight > 0.5 ? new THREE.Color(0xef4444) : new THREE.Color(0x440000), 0.05);
      hMat.emissiveIntensity = THREE.MathUtils.lerp(0.3, 2, weight);

      vessels.children.forEach(l => {
        const lMat = (l as THREE.Line).material as THREE.LineBasicMaterial;
        lMat.color.lerp(currentEmissive, 0.05);
        lMat.opacity = THREE.MathUtils.lerp(0.1, 0.6, weight);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (canvasRef.current) canvasRef.current.removeEventListener('click', onCanvasClick);
      renderer.dispose();
      scene.clear();
    };
  }, [view, progress]);

  const stats = {
    current: [
      { label: t.cellular_integrity, value: `${(38 + progress * 62).toFixed(0)}%`, color: 'text-emerald-500' },
      { label: t.o2_saturation, value: `${(86 + progress * 13).toFixed(0)}%`, color: 'text-sky-400' },
      { label: t.neural_delay, value: `${(18 - progress * 18).toFixed(0)}ms`, color: 'text-emerald-300' }
    ]
  };

  const getTooltipContent = () => {
    if (!selectedPart) return { title: t.anatomy_title, desc: view === 'current' ? t.current_status_desc.replace('{days}', daysClean.toString()) : t.tap_to_analyze };
    const isElite = view === 'elite' || (view === 'current' && progress > 0.8);
    switch (selectedPart) {
      case 'lungs': return { title: t.anatomy_lungs_title, desc: isElite ? t.anatomy_lungs_elite : t.anatomy_lungs_smoker };
      case 'heart': return { title: t.anatomy_heart_title, desc: isElite ? t.anatomy_heart_elite : t.anatomy_heart_smoker };
      case 'vessels': return { title: t.anatomy_vessels_title, desc: isElite ? t.anatomy_vessels_elite : t.anatomy_vessels_smoker };
      default: return { title: t.anatomy_title, desc: t.anatomy_desc };
    }
  };

  const tooltip = getTooltipContent();

  return (
    <div className="flex-1 flex flex-col p-6 pb-32 space-y-6 overflow-y-auto no-scrollbar relative">
      <header className="text-center space-y-1 z-10">
        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{t.anatomy_title}</h2>
        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.5em]">{t.anatomy_desc}</p>
      </header>

      {/* Switcher Hub */}
      <div className="glass-panel p-2 rounded-[32px] flex gap-1 z-10">
        <button onClick={() => setView('smoker')} className={`flex-1 py-3 rounded-[24px] flex flex-col items-center justify-center gap-1 transition-all ${view === 'smoker' ? 'bg-red-600 text-white shadow-2xl' : 'text-zinc-600'}`}>
          <Skull size={14} /> <span className="text-[7px] font-black uppercase tracking-widest">{t.smoker_scan}</span>
        </button>
        <button onClick={() => setView('current')} className={`flex-1 py-3 rounded-[24px] flex flex-col items-center justify-center gap-1 transition-all ${view === 'current' ? 'bg-emerald-600 text-white shadow-2xl scale-105' : 'text-zinc-600'}`}>
          <User size={14} /> <span className="text-[7px] font-black uppercase tracking-widest">{t.current_scan}</span>
        </button>
        <button onClick={() => setView('elite')} className={`flex-1 py-3 rounded-[24px] flex flex-col items-center justify-center gap-1 transition-all ${view === 'elite' ? 'bg-blue-600 text-white shadow-2xl' : 'text-zinc-600'}`}>
          <ShieldCheck size={14} /> <span className="text-[7px] font-black uppercase tracking-widest">{t.elite_scan}</span>
        </button>
      </div>

      <div className="relative aspect-square glass-panel rounded-[56px] overflow-hidden flex items-center justify-center border-white/5 shadow-inner">
        <canvas ref={canvasRef} className="w-full h-full cursor-pointer" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 pointer-events-none" />
        
        <div className="absolute top-6 left-8 flex items-center gap-3">
           <div className={`w-2.5 h-2.5 rounded-full animate-ping ${view === 'elite' || (view === 'current' && progress > 0.5) ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`} />
           <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">LIVE BIOMETRIC FEED</span>
        </div>

        <AnimatePresence mode="wait">
          {selectedPart ? (
            <motion.div 
              key={selectedPart}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-6 left-6 right-6 p-5 bg-slate-950/90 backdrop-blur-2xl rounded-[28px] border border-white/10 shadow-2xl pointer-events-none"
            >
              <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Zap size={10} /> {tooltip.title}
              </h4>
              <p className="text-[10px] text-zinc-300 font-bold leading-relaxed">{tooltip.desc}</p>
            </motion.div>
          ) : (
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[8px] font-black text-zinc-500 uppercase tracking-[0.5em] animate-pulse pointer-events-none">
                <MousePointer2 size={12} /> {t.tap_to_analyze}
             </div>
          )}
        </AnimatePresence>
        
        <div className="absolute top-0 left-0 w-full h-[4px] bg-emerald-500/10 shadow-[0_0_20px_#10b981] animate-[scanline_4s_linear_infinite] pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 gap-3 z-10">
        {(view === 'current' ? stats.current : stats.current).map((stat, i) => (
          <motion.div key={stat.label} {...({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.1 } } as any)} className="glass-panel p-5 rounded-[24px] flex justify-between items-center group transition-colors hover:bg-white/5">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-white/5 ${stat.color}`}><Activity size={16} /></div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <span className={`text-lg font-black italic ${stat.color}`}>{stat.value}</span>
          </motion.div>
        ))}
      </div>

      <motion.div {...({ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.3 } } as any)} className="glass-panel p-6 rounded-[32px] border-emerald-500/10 z-10">
         <div className="flex items-start gap-3">
            <Info size={20} className="text-emerald-500 shrink-0" />
            <div className="space-y-1">
               <h4 className="text-[9px] font-black text-white uppercase tracking-widest">{t.medical_directive}</h4>
               <p className="text-[10px] text-zinc-500 uppercase font-bold leading-relaxed">
                  {view === 'smoker' ? t.smoker_warning : view === 'elite' ? t.elite_standard : t.current_status_desc.replace('{days}', daysClean.toString())}
               </p>
            </div>
         </div>
      </motion.div>
    </div>
  );
};

export default AnatomyScan;
