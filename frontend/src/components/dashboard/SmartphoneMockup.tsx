'use client';

import React from 'react';
import { MoreVertical, Phone, Video, ChevronLeft, RotateCcw, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  label: string;
  onClick: () => void;
}

interface SmartphoneMockupProps {
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  contactName?: string;
  options?: Option[];
  onReset?: () => void;
}

export function SmartphoneMockup({ 
  message, 
  mediaUrl,
  mediaType,
  contactName = 'Cliente',
  options = [],
  onReset
}: SmartphoneMockupProps) {
  
  const renderedMessage = message
    .split('\n')
    .map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));

  return (
    <div className="relative mx-auto border-slate-800 bg-slate-950 border-[12px] rounded-[3rem] h-[640px] w-[310px] shadow-2xl overflow-hidden ring-4 ring-slate-900/50">
      {/* Notch */}
      <div className="h-[28px] w-[140px] bg-slate-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-[1.2rem] z-30"></div>
      
      {/* Search/Header Decoration */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/10 rounded-full z-30"></div>

      {/* Screen Header */}
      <div className="bg-[#075E54] pt-12 pb-4 px-4 flex items-center justify-between text-white shadow-lg relative z-20">
        <div className="flex items-center gap-2">
          <button onClick={onReset} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white/20 overflow-hidden">
             <img src={`https://ui-avatars.com/api/?name=Arco+Mix&background=075E54&color=fff`} alt="Avatar" />
          </div>
          <div className="ml-1">
            <p className="text-[14px] font-bold leading-tight">Suporte Arco-Mix</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span> online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onReset} title="Reiniciar Simulação">
             <RotateCcw className="h-4 w-4 opacity-70 hover:opacity-100 transition-opacity" />
          </button>
          <MoreVertical className="h-4 w-4 opacity-70" />
        </div>
      </div>

      {/* Chat Area */}
      <div 
        className="absolute inset-0 bg-[#E5DDD5] pt-28 pb-20 px-4 overflow-y-auto flex flex-col gap-4 custom-scrollbar" 
        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={message}
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className="self-start max-w-[90%] bg-white rounded-2xl rounded-tl-none p-3 shadow-md relative"
          >
            <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"></div>
            
            {(mediaUrl || mediaType) && (
              <div className="mb-2 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                {mediaType === 'image' && mediaUrl ? (
                  <img src={mediaUrl} className="w-full h-auto max-h-[160px] object-cover" alt="Media" />
                ) : (
                  <div className="p-4 flex flex-col items-center">
                    <Video className="h-8 w-8 text-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Vídeo Anexado</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="text-[13px] text-slate-800 leading-relaxed font-medium">
              {renderedMessage}
            </div>

            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-[9px] text-slate-400 font-bold">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Clicável: Opções do Bot */}
        <div className="space-y-2 mt-2">
           <AnimatePresence>
             {options.map((opt, i) => (
               <motion.button
                 key={opt.label + i}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 onClick={opt.onClick}
                 className="w-full bg-white hover:bg-slate-50 text-indigo-600 font-bold py-3 px-4 rounded-xl shadow-sm border border-slate-200 text-sm flex items-center justify-center gap-2 transition-all active:scale-95 group"
               >
                 <span className="h-2 w-2 bg-indigo-500 rounded-full group-hover:scale-125 transition-transform"></span>
                 {opt.label}
               </motion.button>
             ))}
           </AnimatePresence>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-slate-50 flex items-center gap-2 border-t border-slate-200">
         <div className="flex-1 h-10 bg-white rounded-full border border-slate-200 px-4 flex items-center">
            <span className="text-slate-300 text-xs italic">Simulação...</span>
         </div>
         <div className="h-10 w-10 bg-[#075E54] rounded-full flex items-center justify-center text-white">
            <Send className="h-4 w-4" />
         </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
