'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Library, 
  RefreshCcw, 
  Search, 
  FileText,
  Store,
  ShieldCheck,
  Globe,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';
import api from '@/services/api';
import { motion } from 'framer-motion';

interface BotMenuOption {
  id: string;
  label: string;
  action: 'TEXT' | 'LINK' | 'HUMAN';
  content: string;
}

interface BotBrand {
  id: string;
  name: string;
  label: string;
  stores: string[];
  menu: BotMenuOption[];
}

interface BotConfig {
  enabled: boolean;
  welcomeMessage: string;
  humanTimeoutMinutes: number;
  humanTimeoutMessage: string;
  brands: BotBrand[];
}

interface BotTemplate {
  id: string;
  name: string;
  description: string;
  config: BotConfig;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<BotTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/whatsapp/bot-templates');
      setTemplates(res.data);
    } catch (err) {
      console.error('Erro ao buscar templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = async (template: BotTemplate) => {
    if (!confirm(`Deseja aplicar o modelo "${template.name}"? Isso substituirá sua configuração atual.`)) {
      return;
    }

    setApplyingId(template.id);
    try {
      await api.post('/whatsapp/bot-config', template.config);
      alert('Modelo aplicado com sucesso! Redirecionando para Automação...');
      window.location.href = '/dashboard/automation';
    } catch (err) {
      alert('Erro ao aplicar modelo.');
    } finally {
      setApplyingId(null);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (id: string) => {
    if (id === 'retail') return <Store className="h-6 w-6" />;
    if (id === 'customer_service') return <ShieldCheck className="h-6 w-6" />;
    return <Globe className="h-6 w-6" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCcw className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Carregando galeria de modelos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
            <Library className="text-indigo-500 h-8 w-8" /> Biblioteca de Modelos
          </h1>
          <p className="text-slate-400 mt-1">Escolha um modelo de fluxo hierárquico pronto para acelerar sua implantação.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchTemplates}
            className="flex items-center px-5 py-2.5 border border-slate-700 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-all font-bold text-sm"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 flex flex-col md:flex-row gap-4 shadow-xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar modelos (ex: varejo, suporte, vendas)..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl py-3 px-6 text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" /> Modelos Premium
          </div>
        </div>
      </div>

      {/* Grid de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTemplates.map((template) => (
          <motion.div 
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-xl hover:border-indigo-500/50 transition-all"
          >
            {/* Top Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 opacity-20" />
            
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="h-14 w-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg group-hover:shadow-indigo-500/20">
                  {getIcon(template.id)}
                </div>
                {template.id === 'retail' && (
                  <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">Recomendado</span>
                )}
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{template.name}</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
                {template.description}
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-black text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 uppercase">Hierárquico</span>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 uppercase">Bot Mobile</span>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 uppercase">Transbordo Humano</span>
                </div>

                <div className="pt-6 border-t border-slate-800/50 flex items-center justify-between">
                   <div className="flex items-center text-xs text-slate-600 font-bold uppercase tracking-tighter">
                      <Zap className="h-4 w-4 mr-2 text-amber-500" /> Ativação Imediata
                   </div>
                   <button 
                     onClick={() => applyTemplate(template)}
                     disabled={applyingId === template.id}
                     className="flex items-center gap-2 text-indigo-400 hover:text-white font-bold text-xs group/btn transition-all"
                   >
                     {applyingId === template.id ? 'Aplicando...' : (
                       <>
                         USAR MODELO 
                         <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                       </>
                     )}
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-20 bg-slate-900 border border-dash border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-center px-6">
            <div className="h-20 w-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum modelo encontrado</h3>
            <p className="text-slate-500 text-sm max-w-sm">
              Tente buscar por termos mais genéricos ou use os modelos da nossa galeria premium acima.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
