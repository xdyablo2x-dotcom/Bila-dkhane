
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { MicOff, Zap, Wifi, Globe, Brain } from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../translations.ts';

interface HealthCoachLiveProps {
  daysClean: number;
  firstName: string;
  language: AppLanguage;
}

const HealthCoachLive: React.FC<HealthCoachLiveProps> = ({ daysClean, firstName, language }) => {
  const t = translations[language] || translations.fr;
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState(t.standby);
  const [volume, setVolume] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const startSession = async () => {
    try {
      setIsConnecting(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are the Bila Dkhane Neural Strategist. Your speech is slow, calm, and articulate.
          Mission: Provide elite coaching to Agent ${firstName} (${daysClean} days clean).
          Tone: Mentor-like, professional, calm. Avoid fast speech. 
          Respond in ${language === 'fr' ? 'French' : language === 'ar' ? 'Arabic' : language === 'es' ? 'Spanish' : 'English'}.`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            setTranscript(t.listening);
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for(let i=0; i<input.length; i++) sum += input[i]*input[i];
              setVolume(Math.sqrt(sum/input.length));
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({
                media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
              }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription) setTranscript(msg.serverContent.outputTranscription.text);
            if (msg.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) { try { source.stop(); } catch(e) {} sourcesRef.current.delete(source); }
              nextStartTimeRef.current = 0;
              return;
            }
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const buffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onerror: (e) => console.error('Signal Loss:', e),
          onclose: () => setIsActive(false),
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (e) {
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionPromiseRef.current) sessionPromiseRef.current.then(s => s.close());
    for (const source of sourcesRef.current) { try { source.stop(); } catch(e) {} }
    sourcesRef.current.clear();
    setIsActive(false);
  };

  return (
    <motion.div {...({ initial: { opacity: 0 }, animate: { opacity: 1 } } as any)} className="flex-1 flex flex-col p-10 bg-black relative overflow-hidden">
      
      {/* 4D ATMOSPHERE */}
      <div className={`absolute inset-0 transition-opacity duration-[2000ms] ${isActive ? 'opacity-60' : 'opacity-0'}`}>
        <motion.div 
          animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-emerald-500/10 blur-[180px] rounded-full" 
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        
        {/* CORE INTERFACE */}
        <div className="relative mb-24">
          <motion.div 
            animate={isActive ? { scale: [1, 1 + volume * 2, 1], borderColor: ['#10b981', '#06b6d4', '#10b981'] } : {}}
            transition={{ duration: 0.1, repeat: isActive ? Infinity : 0 }}
            className={`w-72 h-72 rounded-full flex items-center justify-center cursor-pointer border-4 transition-all duration-1000 ${isActive ? 'shadow-[0_0_120px_rgba(16,185,129,0.3)] bg-emerald-500/10' : 'border-slate-800 bg-slate-900/40'}`}
            onClick={isActive ? stopSession : startSession}
          >
            {isConnecting ? (
              <Wifi className="w-16 h-16 text-emerald-400 animate-pulse" />
            ) : isActive ? (
              <div className="relative w-48 h-48 flex items-center justify-center">
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 12, ease: "linear" }} className="absolute inset-0 border-t-2 border-emerald-400 rounded-full opacity-30" />
                 <Brain className="w-16 h-16 text-emerald-400" />
              </div>
            ) : (
              <MicOff className="w-16 h-16 text-slate-700" />
            )}
          </motion.div>
          {isActive && (
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-3 shadow-2xl">
              <span className="w-2 h-2 bg-black rounded-full animate-ping" /> Synchronized
            </div>
          )}
        </div>

        {/* NEURAL OUTPUT */}
        <div className="text-center max-w-sm px-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Globe size={14} className={isActive ? 'text-emerald-400' : 'text-slate-800'} />
            <span className={`text-[11px] font-black uppercase tracking-[0.5em] ${isActive ? 'text-emerald-400' : 'text-slate-800'}`}>
              Region: {language.toUpperCase()}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p 
              key={transcript}
              {...({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } } as any)}
              className="text-3xl font-bold text-slate-50 leading-tight italic font-display tracking-tighter"
            >
              "{transcript}"
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="pb-36 px-4 z-10">
        <button 
          onClick={isActive ? stopSession : startSession}
          className={`w-full py-7 rounded-[48px] font-black text-[14px] tracking-[0.7em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all ${isActive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'clinical-gradient text-white'}`}
        >
          {isActive ? t.close_liaison : <><Zap size={22} fill="currentColor" /> {t.establish_liaison}</>}
        </button>
      </div>
    </motion.div>
  );
};

export default HealthCoachLive;
