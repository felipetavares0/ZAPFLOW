'use client';

import React from 'react';
import { ShoppingCart, Flame, Clock, Gift, Truck, Tag, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Template {
  id: string;
  category: string;
  icon: any;
  title: string;
  text: string;
  color: string;
}

const templates: Template[] = [
  {
    id: '1',
    category: 'Ofertas',
    icon: Flame,
    title: 'Oferta do dia',
    color: 'text-orange-500 bg-orange-500/10',
    text: '🛒 HOJE TEM OFERTA IMPERDÍVEL!\nAproveite descontos exclusivos no mercado 🥩🥤\nCorre antes que acabe!',
  },
  {
    id: '2',
    category: 'Urgência',
    icon: Clock,
    title: 'Últimas Unidades',
    color: 'text-rose-500 bg-rose-500/10',
    text: '⚠️ ÚLTIMAS UNIDADES!\nOs produtos mais vendidos estão acabando 😱\nGaranta agora antes que saia do estoque!',
  },
  {
    id: '3',
    category: 'Carrinho',
    icon: ShoppingCart,
    title: 'Carrinho abandonado',
    color: 'text-indigo-500 bg-indigo-500/10',
    text: '👀 Você esqueceu alguns itens no seu carrinho!\nFinalize agora e receba no conforto da sua casa 🏠',
  },
  {
    id: '4',
    category: 'Promoção',
    icon: Gift,
    title: 'Super Promoção',
    color: 'text-emerald-500 bg-emerald-500/10',
    text: '🎉 SUPER PROMOÇÃO ATIVA!\nDescontos que você não vai ver de novo 😍\nClique e aproveite agora!',
  },
  {
    id: '5',
    category: 'Delivery',
    icon: Truck,
    title: 'Delivery Rápido',
    color: 'text-blue-500 bg-blue-500/10',
    text: '🚚 Receba tudo em casa sem sair do sofá!\nRápido, fácil e seguro 💚',
  },
  {
    id: '6',
    category: 'Descontos',
    icon: Tag,
    title: 'Cupons Exclusivos',
    color: 'text-amber-500 bg-amber-500/10',
    text: '💰 DESCONTO EXTRA LIBERADO!\nUse o cupom BEMVINDO e ganhe 10% na sua primeira compra online. 🎫',
  },
];

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (text: string) => void;
}

export function TemplateLibrary({ isOpen, onClose, onSelect }: TemplateLibraryProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-xl font-bold text-white">Biblioteca de Templates</h3>
            <p className="text-sm text-slate-400">Escolha um modelo de alta conversão para sua campanha</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-950/50 border-b border-slate-800">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar templates..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                onSelect(tpl.text);
                onClose();
              }}
              className="flex flex-col items-start p-4 bg-slate-800/40 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all text-left group"
            >
              <div className={`p-2 rounded-lg mb-3 ${tpl.color}`}>
                <tpl.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{tpl.category}</p>
              <h4 className="text-sm font-bold text-white mb-2">{tpl.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {tpl.text}
              </p>
              <div className="mt-4 flex items-center text-[10px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                Usar este template →
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
