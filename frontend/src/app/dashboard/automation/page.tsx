'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Activity,
  Zap,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Store,
  Layout,
  Smartphone,
  Library,
  ChevronRight,
  ShieldCheck,
  Globe,
  Bell
} from 'lucide-react';
import api from '@/services/api';
import { SmartphoneMockup } from '@/components/dashboard/SmartphoneMockup';
import { motion, AnimatePresence } from 'framer-motion';

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

type SimStep = 'BRAND' | 'STORE' | 'MENU' | 'FINAL';

export default function AutomationPage() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [templates, setTemplates] = useState<BotTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // UI States
  const [editingBrandId, setEditingBrandId] = useState<string>('1');

  // Simulator States
  const [simStep, setSimStep] = useState<SimStep>('BRAND');
  const [simBrand, setSimBrand] = useState<BotBrand | null>(null);
  const [simStore, setSimStore] = useState<string>('');
  const [simMsg, setSimMsg] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [configRes, statusRes, templatesRes] = await Promise.all([
        api.get('/whatsapp/bot-config'),
        api.get('/whatsapp/status'),
        api.get('/whatsapp/bot-templates')
      ]);
      setConfig(configRes.data);
      setStatus(statusRes.data);
      setTemplates(templatesRes.data);
      if (configRes.data.brands.length > 0) {
        setEditingBrandId(configRes.data.brands[0].id);
      }
    } catch (err) {
      console.error('Error fetching bot:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentBrand = config?.brands.find(b => b.id === editingBrandId);

  const updateBrand = (field: keyof BotBrand, value: any) => {
    if (!config || !currentBrand) return;
    const newBrands = config.brands.map(b => b.id === editingBrandId ? { ...b, [field]: value } : b);
    setConfig({ ...config, brands: newBrands });
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await api.post('/whatsapp/bot-config', config);
      alert('Configuração salva com sucesso!');
    } catch {
      alert('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (template: BotTemplate) => {
    if (confirm(`Deseja aplicar o modelo "${template.name}"? Isso substituirá sua configuração atual.`)) {
      setConfig(template.config);
      if (template.config.brands.length > 0) {
        setEditingBrandId(template.config.brands[0].id);
      }
      setShowTemplates(false);
      resetSim();
    }
  };

  // --- LOGICA SIMULADOR ---
  const resetSim = () => {
    setSimStep('BRAND');
    setSimBrand(null);
    setSimStore('');
    setSimMsg('');
  };

  const simOptions = () => {
    if (simStep === 'BRAND') {
      return config?.brands.map(b => ({
        label: b.label,
        onClick: () => { setSimBrand(b); setSimStep('STORE'); }
      })) || [];
    }
    if (simStep === 'STORE' && simBrand) {
      return simBrand.stores.map(s => ({
        label: s,
        onClick: () => { setSimStore(s); setSimStep('MENU'); }
      }));
    }
    if (simStep === 'MENU' && simBrand) {
      return simBrand.menu.map(m => ({
        label: m.label,
        onClick: () => {
          const final = m.content
            .replace(/\{\{rede\}\}/gi, simBrand.name)
            .replace(/\{\{loja\}\}/gi, simStore)
            .replace(/\{\{nome\}\}/gi, 'Cliente');
          setSimMsg(final);
          setSimStep('FINAL');
        }
      }));
    }
    return [];
  };

  const simText = () => {
    if (simStep === 'BRAND') return config?.welcomeMessage || '';
    if (simStep === 'STORE') return `🏪 *Unidades ${simBrand?.name}:*\nEscolha a loja:`;
    if (simStep === 'MENU') return `📍 *${simBrand?.name} - ${simStore}*\nComo podemos ajudar?`;
    return simMsg;
  };

  if (loading && !config) return <div className="flex items-center justify-center p-20"><RefreshCw className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Templates Overlay */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                 <h2 className="text-2xl font-black text-white flex items-center gap-3">
                   <Library className="text-indigo-500" /> Escolha um Modelo Base
                 </h2>
                 <button onClick={() => setShowTemplates(false)} className="text-slate-500 hover:text-white transition-colors">Fechar</button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                 {templates.map(tpl => (
                   <div key={tpl.id} className="group bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col hover:border-indigo-500 transition-all cursor-pointer" onClick={() => applyTemplate(tpl)}>
                      <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                         {tpl.id === 'retail' ? <Store className="h-6 w-6" /> : tpl.id === 'customer_service' ? <ShieldCheck className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
                      </div>
                      <h4 className="text-white font-bold mb-2">{tpl.name}</h4>
                      <p className="text-xs text-slate-500 mb-6 flex-1">{tpl.description}</p>
                      <button className="w-full py-3 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">Aplicar Modelo</button>
                   </div>
                 ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
             <Bot className="text-indigo-500 h-8 w-8" /> Automação Inteligente
          </h1>
          <p className="text-slate-400">Personalize o fluxo de atendimento da sua rede em tempo real.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex gap-2 shadow-xl">
              {config?.brands.map(b => (
                <button 
                  key={b.id}
                  onClick={() => setEditingBrandId(b.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${editingBrandId === b.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {b.name.toUpperCase()}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-8 space-y-8">
           <AnimatePresence mode="wait">
             <motion.div 
               key={editingBrandId}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-8"
             >
               {/* 1. Saudação */}
               <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 glass-morphism relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                     <MessageSquare className="text-indigo-500 h-5 w-5" /> Saudação Inicial
                  </h3>
                  <textarea 
                    value={config?.welcomeMessage}
                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, welcomeMessage: e.target.value }) : null)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white text-lg focus:border-indigo-500 transition-all shadow-inner relative z-10"
                    placeholder="Olá {{nome}}, seja bem-vindo!..."
                  />
                  <div className="mt-3 flex gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest relative z-10">
                     <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> Variável: {'{{nome}}'}</span>
                  </div>
               </div>

               {/* 1.1 Configurações de Contingência */}
               <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 glass-morphism relative overflow-hidden group">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                     <Activity className="text-rose-500 h-5 w-5" /> Mensagem de Alta Demanda (Fila)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Tempo de Espera (Min)</label>
                      <input 
                        type="number"
                        value={config?.humanTimeoutMinutes || 5}
                        onChange={(e) => setConfig(prev => prev ? ({ ...prev, humanTimeoutMinutes: parseInt(e.target.value) }) : null)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-rose-500 transition-all font-bold"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Mensagem de Contingência</label>
                      <textarea 
                        value={config?.humanTimeoutMessage}
                        onChange={(e) => setConfig(prev => prev ? ({ ...prev, humanTimeoutMessage: e.target.value }) : null)}
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-rose-500 transition-all"
                        placeholder="Ex: No momento estamos com alta demanda..."
                      />
                      <p className="mt-2 text-[10px] text-slate-600 italic">Esta mensagem é enviada automaticamente se nenhum atendente responder após o tempo definido.</p>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 2. Unidades */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 glass-morphism flex flex-col">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                           <Store className="text-indigo-500 h-5 w-5" /> Unidades {currentBrand?.name}
                        </h3>
                        <button 
                          onClick={() => updateBrand('stores', [...(currentBrand?.stores || []), 'Nova Unidade'])}
                          className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                        >
                           <Plus className="h-4 w-4" />
                        </button>
                     </div>
                     <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {currentBrand?.stores.map((s, i) => (
                           <div key={i} className="flex gap-2 group items-center">
                              <span className="text-[10px] font-black text-slate-700 w-4">{i + 1}</span>
                              <input 
                                value={s}
                                onChange={(e) => {
                                  const list = [...currentBrand!.stores];
                                  list[i] = e.target.value;
                                  updateBrand('stores', list);
                                }}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 transition-colors"
                              />
                              <button 
                                onClick={() => updateBrand('stores', currentBrand!.stores.filter((_, idx) => idx !== i))}
                                className="p-2.5 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-500 transition-all rounded-xl hover:bg-rose-500/10"
                              >
                                 <Trash2 className="h-4 w-4" />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* 3. Botões Finais */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 glass-morphism">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                           <Layout className="text-indigo-500 h-5 w-5" /> Botões de Ação
                        </h3>
                     </div>
                     <div className="space-y-5">
                        {currentBrand?.menu.map((m, i) => (
                           <div key={m.id} className="p-5 bg-slate-950/40 border border-slate-800 rounded-[2rem] space-y-4 hover:border-slate-700 transition-all">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 text-xs font-black">{i + 1}</div>
                                 <input 
                                   value={m.label}
                                   onChange={(e) => {
                                     const list = [...currentBrand!.menu];
                                     list[i].label = e.target.value;
                                     updateBrand('menu', list);
                                   }}
                                   className="flex-1 bg-transparent border-none p-0 text-sm font-black text-white focus:ring-0 uppercase tracking-tighter"
                                   placeholder="Rótulo do Botão"
                                 />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                 <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-700 uppercase mb-1 block">Ação do Botão</label>
                                    <select 
                                      value={m.action}
                                      onChange={(e) => {
                                        const list = [...currentBrand!.menu];
                                        list[i].action = e.target.value as any;
                                        updateBrand('menu', list);
                                      }}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-400 outline-none"
                                    >
                                      <option value="TEXT">ENVIAR TEXTO</option>
                                      <option value="LINK">ABRIR LINK (SITE)</option>
                                      <option value="HUMAN">FALAR COM HUMANO</option>
                                    </select>
                                 </div>
                                 <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-700 uppercase mb-1 block">Conteúdo / URL</label>
                                    <textarea 
                                      value={m.content}
                                      onChange={(e) => {
                                        const list = [...currentBrand!.menu];
                                        list[i].content = e.target.value;
                                        updateBrand('menu', list);
                                      }}
                                      rows={2}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 placeholder:text-slate-800"
                                      placeholder={m.action === 'LINK' ? 'https://...' : 'Texto da resposta...'}
                                    />
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-2xl">
                  <div className="flex items-center gap-3 text-slate-500">
                     <Activity className={`h-5 w-5 ${status?.status === 'CONNECTED' ? 'text-emerald-500' : 'text-rose-500'}`} />
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest block leading-none">{status?.status === 'CONNECTED' ? 'ONLINE' : 'DESCONECTADO'}</span>
                        <span className="text-[9px] text-slate-600 block mt-1 uppercase tracking-tighter">Status do WhatsApp</span>
                     </div>
                  </div>
                  <button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 transition-all disabled:opacity-50 shadow-2xl shadow-indigo-500/30 uppercase tracking-tighter text-sm">
                     {saving ? <RefreshCw className="h-6 w-6 animate-spin" /> : <><Save className="h-6 w-6" /> Publicar Alterações</>}
                  </button>
               </div>
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Simulador */}
        <div className="xl:col-span-4 space-y-8 sticky top-24">
           <div className="relative">
              <SmartphoneMockup 
                message={simText()}
                contactName="Meu Chatbot Pro"
                options={simOptions()}
                onReset={resetSim}
              />
              <div className="mt-6 p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-xl">
                 <p className="text-[10px] font-black text-indigo-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
                    <Zap className="h-4 w-4" /> SIMULADOR EM TEMPO REAL
                 </p>
                 <p className="text-xs text-slate-500 leading-relaxed italic">
                    Teste seu fluxo completo clicando nos botões acima. As mudanças no editor aparecem aqui instantaneamente.
                 </p>
              </div>
           </div>
        </div>
      </div>

      <style jsx global>{`
        .glass-morphism {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}
