'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Users, Plus, Trash2, CheckCircle2, AlertCircle,
  Loader2, MessageSquare, Upload, Wifi, WifiOff, Download,
  Square, Image as ImageIcon, Video, X, Sparkles, LogOut, BookOpen
} from 'lucide-react';
import api from '@/services/api';
import { SmartphoneMockup } from '@/components/dashboard/SmartphoneMockup';
import { TemplateLibrary } from '@/components/dashboard/TemplateLibrary';
import { motion, AnimatePresence } from 'framer-motion';

interface Contact { number: string; name: string; }
interface WppStatus { status: string; qrCode: string | null; totalSent: number; totalFailed: number; }
interface LogEntry { number: string; message: string; status: string; time: string; }

export default function BroadcastPage() {
  const [wppStatus, setWppStatus] = useState<WppStatus | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([{ number: '', name: '' }]);
  const [message, setMessage] = useState('Olá {{nome}}, tudo bem? 😊');
  
  // Media states
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; errors: string[] } | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/whatsapp/status');
      setWppStatus(data);
    } catch {}
  };

  const fetchLog = async () => {
    setLogLoading(true);
    try {
      const { data } = await api.get('/whatsapp/log');
      setLog(data);
    } catch {} finally {
      setLogLoading(false);
    }
  };

  const addContact = () => setContacts([...contacts, { number: '', name: '' }]);
  const removeContact = (i: number) => setContacts(contacts.filter((_, idx) => idx !== i));
  const updateContact = (i: number, field: keyof Contact, value: string) => {
    const updated = [...contacts];
    updated[i][field] = value;
    setContacts(updated);
  };
  
  const downloadTemplate = () => {
    const csvContent = "numero,nome\n11999990000,João Silva\n11888880000,Maria Oliveira";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_disparo.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const allLines = (ev.target?.result as string).split('\n').filter(Boolean);
      const dataLines = allLines[0].toLowerCase().includes('numero') ? allLines.slice(1) : allLines;
      const parsed: Contact[] = dataLines.map((line) => {
        const [number, name] = line.split(',').map((s) => s.trim());
        return { number: number || '', name: name || '' };
      });
      setContacts(parsed);
    };
    reader.readAsText(file);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 16 * 1024 * 1024) {
      alert("O arquivo excede o limite de 16MB.");
      return;
    }

    const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
    if (!type) {
      alert("Formato não suportado. Use imagens (JPG, PNG, WEBP) ou vídeos (MP4).");
      return;
    }

    setMedia(file);
    setMediaType(type);
    
    const reader = new FileReader();
    reader.onload = (ev) => setMediaPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const handleSend = async () => {
    const validContacts = contacts.filter((c) => c.number.trim().length >= 8);
    if (!validContacts.length) { alert('Adicione ao menos um número válido.'); return; }
    if (!message.trim() && !media) { alert('Escreva uma mensagem ou adicione uma mídia.'); return; }
    
    setSending(true);
    setResult(null);
    setIsStopping(false);

    try {
      // Prepara envio
      // Se houver mídia, enviamos como Base64 no JSON por enquanto para simplicidade do bot atual,
      // ou podemos adaptar para FormData. Vamos usar JSON com o buffer em Base64 para alinhar com o bot.
      let mediaData = null;
      if (media && mediaPreview) {
        mediaData = {
          mimetype: media.type,
          data: mediaPreview.split(',')[1],
          filename: media.name
        };
      }

      const { data } = await api.post('/whatsapp/broadcast', {
        contacts: validContacts,
        message,
        delayMs: 3000,
        media: mediaData
      });

      setResult(data);
      fetchStatus();
      fetchLog();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao enviar.');
    } finally {
      setSending(false);
      setIsStopping(false);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    try {
      await api.post('/whatsapp/stop');
    } catch (err) {
      console.error('Falha ao solicitar interrupção:', err);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Deseja desconectar o WhatsApp? Um novo QR Code será gerado.')) return;
    setLoggingOut(true);
    try {
      await api.delete('/whatsapp/logout');
      setWppStatus(null);
      setTimeout(fetchStatus, 3000);
    } catch {} finally {
      setLoggingOut(false);
    }
  };

  const isConnected = wppStatus?.status === 'CONNECTED';
  const isWaiting = wppStatus?.status === 'WAITING_QR';

  return (
    <div className="space-y-8 pb-20">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-indigo-500 fill-indigo-500 animate-pulse" />
            Disparos Inteligentes
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Crie campanhas de alta conversão com mídia e templates.</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-xl">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold tracking-wide uppercase ${
            isConnected ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : isWaiting ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
          }`}>
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-current'}`} />
            {isConnected ? 'Conectado' : isWaiting ? 'Aguardando QR' : 'Desconectado'}
          </div>
          {isConnected && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-2.5 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
              title="Desconectar"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* QR Code banner Modernizado */}
      <AnimatePresence>
        {isWaiting && wppStatus?.qrCode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-indigo-600/10 border border-indigo-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
            <div className="bg-white p-4 rounded-[2rem] shadow-2xl relative z-10 scale-110">
              <img src={wppStatus.qrCode} alt="QR Code" className="w-40 h-40" />
            </div>
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-indigo-400 font-black text-2xl mb-2">Escaneie para Conectar</h3>
              <p className="text-slate-300 max-w-md leading-relaxed text-lg">
                Abra seu WhatsApp → Configurações → Dispositivos Vinculados → Vincular um dispositivo.
              </p>
              <div className="mt-6 flex items-center gap-3 text-indigo-300 text-sm font-medium">
                <Wifi className="h-4 w-4 animate-bounce" /> Sincronizando sessão segura...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Creation Panel */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Section 1: Message & Media */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden glass-morphism">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                  <MessageSquare className="h-6 w-6" />
                </div>
                Conteúdo do Disparo
              </h3>
              <button 
                onClick={() => setIsTemplateOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700"
              >
                <BookOpen className="h-4 w-4" />
                Templates Prontos
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Media Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => mediaInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-3xl transition-all group ${
                    media ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50'
                  }`}
                >
                  <input ref={mediaInputRef} type="file" accept="image/*,video/mp4" className="hidden" onChange={handleMediaChange} />
                  {media ? (
                    <div className="flex items-center gap-4 w-full">
                       <div className="h-16 w-16 bg-indigo-500/20 rounded-xl flex items-center justify-center overflow-hidden">
                          {mediaType === 'image' ? <img src={mediaPreview!} className="object-cover h-full w-full" /> : <Video className="h-6 w-6 text-indigo-400" />}
                       </div>
                       <div className="flex-1 text-left">
                          <p className="text-sm font-bold text-white truncate max-w-[150px]">{media.name}</p>
                          <p className="text-xs text-slate-500">{(media.size / 1024 / 1024).toFixed(2)} MB</p>
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); removeMedia(); }} className="p-2 hover:bg-rose-500/20 rounded-full text-rose-500">
                          <Trash2 className="h-5 w-5" />
                       </button>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-slate-800 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <ImageIcon className="h-8 w-8 text-slate-400 group-hover:text-indigo-400" />
                      </div>
                      <p className="text-sm font-bold text-white uppercase tracking-wider">Adicionar Mídia</p>
                      <p className="text-xs text-slate-500 mt-1">Imagens ou Vídeos (MP4 máx 16MB)</p>
                    </>
                  )}
                </button>

                <div className="p-8 border border-slate-800 rounded-3xl bg-slate-950/40 relative group overflow-hidden">
                   <div className="absolute -right-4 -top-4 p-4 text-indigo-500/10 scale-[4]">
                      <Sparkles />
                   </div>
                   <p className="text-sm font-bold text-slate-300 mb-2">Sugestão Inteligente</p>
                   <p className="text-xs text-slate-500 leading-relaxed">
                     O varejo alimentar converte 40% mais usando emojis de comida e gatilhos de urgência como "Aproveite Hoje".
                   </p>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Olá {{nome}}, confira nossas ofertas..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-white text-lg focus:outline-none focus:border-indigo-500 transition-all shadow-inner placeholder:text-slate-700"
                />
                <div className="absolute right-6 bottom-6 flex items-center gap-2">
                   <span className="text-xs text-slate-600 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                      {message.length} caracteres
                   </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contacts */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl glass-morphism overflow-hidden">
             <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                    <Users className="h-6 w-6" />
                  </div>
                  Público Alvo
                </h3>
                <div className="flex items-center gap-3">
                   <button onClick={downloadTemplate} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400" title="Modelo CSV">
                      <Download className="h-5 w-5" />
                   </button>
                   <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all border border-slate-700">
                      <Upload className="h-4 w-4" /> Importar CSV
                   </button>
                   <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCSV} />
                </div>
             </div>
             
             <div className="p-8">
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {contacts.map((c, i) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} className="flex gap-3 items-center group">
                      <div className="flex-1 flex gap-2">
                        <input
                          type="tel"
                          placeholder="DDD + Número"
                          value={c.number}
                          onChange={(e) => updateContact(i, 'number', e.target.value)}
                          className="flex-[2] bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500/50"
                        />
                        <input
                          type="text"
                          placeholder="Nome do Cliente"
                          value={c.name}
                          onChange={(e) => updateContact(i, 'name', e.target.value)}
                          className="flex-[3] bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:border-indigo-500/50"
                        />
                      </div>
                      <button onClick={() => removeContact(i)} className="p-3 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
                <button onClick={addContact} className="mt-6 w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400 transition-all font-bold flex items-center justify-center gap-2">
                   <Plus className="h-5 w-5" /> Adicionar Contrato Manualmente
                </button>
             </div>
          </div>
        </div>

        {/* Right Panel: Simulator & Result */}
        <div className="xl:col-span-4 space-y-8 sticky top-24">
          
          {/* Simulator Component */}
          <div className="flex flex-col items-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2 w-full text-center">
              Visualização no WhatsApp
            </p>
            <SmartphoneMockup 
              message={message} 
              mediaUrl={mediaPreview || undefined} 
              mediaType={mediaType || undefined}
              contactName={contacts[0]?.name || 'Cliente'}
            />
          </div>

          {/* Control Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 glass-morphism shadow-2xl">
            <h3 className="font-black text-white text-lg mb-6 uppercase tracking-tighter italic">Checklist de Campanha</h3>
            <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Total de Leads</span>
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full font-bold">
                    {contacts.filter(c => c.number).length}
                  </span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Conteúdo Multimídia</span>
                  <span className={`px-3 py-1 rounded-full font-bold ${media ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {media ? 'Ativo' : 'Apenas Texto'}
                  </span>
               </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleSend}
                disabled={sending || !isConnected}
                className={`w-full bg-indigo-600 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-3 transition-all hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95 disabled:opacity-50 text-lg uppercase tracking-tighter`}
              >
                {sending ? (
                  <><Loader2 className="h-6 w-6 animate-spin" /> Processando...</>
                ) : (
                  <><Send className="h-6 w-6" /> Lançar Campanha</>
                )}
              </button>

              {sending && (
                <button
                  onClick={handleStop}
                  disabled={isStopping}
                  className="w-full bg-rose-500/5 text-rose-500 border border-rose-500/20 rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-rose-500/10"
                >
                  {isStopping ? 'Parando...' : 'Interromper Agora'}
                </button>
              )}
            </div>

            {!isConnected && (
              <p className="text-xs text-center text-rose-400 font-bold mt-4 animate-pulse uppercase">
                WhatsApp Offline - Conecte para Disparar
              </p>
            )}
          </div>

          {/* Mini Result Display */}
          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl p-6 border-2 flex flex-col gap-3 ${result.failed === 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}
              >
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Relatório de Performance
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2 text-center text-sm font-bold">
                   <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                      <p className="text-xs opacity-60">SUCESSO</p>
                      <p className="text-2xl">{result.sent}</p>
                   </div>
                   <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl">
                      <p className="text-xs opacity-60">FALHAS</p>
                      <p className="text-2xl">{result.failed}</p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logs section remain same but styled better */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 glass-morphism overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">Histórico de Disparos</h3>
            <button onClick={fetchLog} className="text-sm font-bold text-indigo-400 hover:text-indigo-300">
              Sincronizar Logs
            </button>
          </div>
          {logLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-indigo-400 opacity-20" /></div>
          ) : log.length === 0 ? (
            <div className="flex flex-col items-center py-10 opacity-30">
               <MessageSquare className="h-16 w-16 mb-4" />
               <p className="font-bold">Aguardando seu primeiro lançamento...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {log.map((entry, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${entry.status === 'sent' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
                    <div>
                      <p className="text-white font-mono text-sm">{entry.number}</p>
                      <p className="text-xs text-slate-500 truncate max-w-sm">{entry.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-black uppercase tracking-tighter ${entry.status === 'sent' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.status === 'sent' ? 'Entregue' : 'Erro Crítico'}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">{new Date(entry.time).toLocaleTimeString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Library Component */}
      <TemplateLibrary 
        isOpen={isTemplateOpen} 
        onClose={() => setIsTemplateOpen(false)} 
        onSelect={(txt) => {
          setMessage(txt);
          setIsTemplateOpen(false);
        }} 
      />

      <style jsx global>{`
        .glass-morphism {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
