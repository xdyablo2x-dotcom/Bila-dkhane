
import React, { useState, useRef, useEffect } from 'react';
import { getHealthCoachResponse } from '../services/geminiService';
import { Message } from '../types';

interface HealthCoachProps {
  daysClean: number;
}

const HealthCoach: React.FC<HealthCoachProps> = ({ daysClean }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Bonjour ! Je suis ton coach Bila Dkhane. Comment te sens-tu aujourd'hui dans ton sevrage ?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const response = await getHealthCoachResponse(input, daysClean);
    
    setIsTyping(false);
    const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response || "Reste fort !" };
    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 pb-20">
      <div className="p-6 border-b border-zinc-900">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Coach Santé AI
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Pose tes questions sur le sevrage ou demande du soutien.</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
              ? 'bg-purple-600 text-white rounded-tr-none' 
              : 'bg-zinc-900 text-zinc-300 rounded-tl-none border border-zinc-800'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 px-4 py-3 rounded-2xl rounded-tl-none border border-zinc-800">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-950 border-t border-zinc-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'ENTER' && handleSend()}
            placeholder="Écris un message..."
            className="flex-1 bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-purple-600 rounded-xl text-white disabled:opacity-50 disabled:grayscale transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthCoach;
