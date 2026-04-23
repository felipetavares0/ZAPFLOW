'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Smartphone, Key, Bell, Loader2, CheckCircle2, AlertCircle, Copy, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '@/services/api';

interface WabaConfig {
  id?: string;
  wabaId: string;
  phoneNumberId: string;
  accessToken: string;
  phoneNumber: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'waba' | 'tokens' | 'notifications'>('waba');
  
  // WABA State
  const [config, setConfig] = useState<WabaConfig>({
    wabaId: '',
    phoneNumberId: '',
    accessToken: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Tokens State
  const [apiToken, setApiToken] = useState('zapflow_live_g9Lkx21qR8T01Y');
  const [copied, setCopied] = useState(false);

  // Notifications State
  const [notifs, setNotifs] = useState({
    emailOnDisconnection: true,
    emailOnBroadcastEnd: true,
    browserPush: false
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data } = await api.get('/waba/configs');
      if (data && data.length > 0) {
        setConfig(data[0]);
      }
    } catch (err) {
      console.error('Erro ao buscar configs da Meta', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSaveWaba = async () => {
    if (!config.wabaId || !config.phoneNumberId || !config.accessToken || !config.phoneNumber) {
      setStatus({ type: 'error', message: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await api.post('/waba/config', {
        wabaId: config.wabaId,
        phoneNumberId: config.phoneNumberId,
        accessToken: config.accessToken,
        phoneNumber: config.phoneNumber
      });
      setStatus({ type: 'success', message: 'Credenciais da Meta salvas com sucesso!' });
      fetchConfigs();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Erro ao salvar credenciais.' });
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(apiToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateNewToken = () => {
    if (confirm('Gerar um novo token invalidará o token atual. Deseja continuar?')) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = 'zapflow_live_';
      for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setApiToken(result);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tighter">Configurações da Conta</h1>
        <p className="text-slate-400 mt-1">Gerencie suas credenciais, tokens de API e preferências de notificações.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('waba')}
            className={`w-full text-left px-4 py-3 font-bold rounded-xl flex items-center transition-all ${activeTab === 'waba' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}
          >
            <Smartphone className="h-5 w-5 mr-3" />
            Meta WABA & API
          </button>
          <button 
            onClick={() => setActiveTab('tokens')}
            className={`w-full text-left px-4 py-3 font-bold rounded-xl flex items-center transition-all ${activeTab === 'tokens' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}
          >
            <Key className="h-5 w-5 mr-3" />
            Tokens de Acesso
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-3 font-bold rounded-xl flex items-center transition-all ${activeTab === 'notifications' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}
          >
            <Bell className="h-5 w-5 mr-3" />
            Notificações
          </button>
        </div>

        <div className="lg:col-span-2">
          {activeTab === 'waba' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl glass-morphism space-y-6 relative overflow-hidden">
              <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Credenciais Oficiais (Meta Business)
              </h3>
              
              {status && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                  status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                }`}>
                  {status.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                  <p className="text-sm font-bold uppercase tracking-tight">{status.message}</p>
                  <button onClick={() => setStatus(null)} className="ml-auto text-xs opacity-50 hover:opacity-100">Fechar</button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1 tracking-widest">WhatsApp Business Account ID (WABA ID)</label>
                  <input type="text" value={config.wabaId} onChange={(e) => setConfig({ ...config, wabaId: e.target.value })} placeholder="Ex: 1045618215XXXXX" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-black uppercase text-slate-500 mb-1 tracking-widest">Phone Number ID</label>
                     <input type="text" value={config.phoneNumberId} onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })} placeholder="Ex: 1109318215XXXXX" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50" />
                   </div>
                   <div>
                     <label className="block text-xs font-black uppercase text-slate-500 mb-1 tracking-widest">Número (Com DDI)</label>
                     <input type="text" value={config.phoneNumber} onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value })} placeholder="Ex: 5581999999999" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50" />
                   </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1 tracking-widest">System User Access Token (Permanente)</label>
                  <input type="password" value={config.accessToken} onChange={(e) => setConfig({ ...config, accessToken: e.target.value })} placeholder="EAADXXXX..." className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 font-mono text-sm" />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-800">
                <button onClick={handleSaveWaba} disabled={loading} className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all font-black text-sm uppercase tracking-tight disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Credenciais
                </button>
              </div>
              {config.id && (
                <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                   <p className="text-xs text-emerald-500 text-center uppercase font-bold tracking-widest">Configuração Ativa: {config.id}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl glass-morphism space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Tokens de API (Acesso para Integrações)
              </h3>
              <p className="text-slate-400 text-sm">
                Utilize este token para conectar sistemas externos (CRMs, N8N, Typebot) aos endpoints do ZapFlow. Mantenha esta chave em segredo absoluto.
              </p>
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1 tracking-widest">Token Principal de Produção</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={apiToken}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-emerald-400 focus:outline-none font-mono text-sm" 
                    />
                    <button 
                      onClick={copyToken}
                      className="px-4 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition flex items-center gap-2 font-bold text-sm"
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-start gap-3 border-t border-slate-800">
                <button onClick={generateNewToken} className="flex items-center px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all font-bold text-sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regerar Token (Revogar Atual)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl glass-morphism space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Avisos e Notificações do Sistema
              </h3>
              <p className="text-slate-400 text-sm">
                Escolha quais eventos críticos devem gerar alertas nos seus dispositivos e e-mail.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <div>
                    <h4 className="text-white font-bold text-sm">Alerta de Queda de Conexão</h4>
                    <p className="text-slate-500 text-xs">Receber aviso caso o WhatsApp Web perca sincronia no servidor.</p>
                  </div>
                  <button onClick={() => setNotifs({...notifs, emailOnDisconnection: !notifs.emailOnDisconnection})}>
                    {notifs.emailOnDisconnection ? <ToggleRight className="h-8 w-8 text-indigo-500" /> : <ToggleLeft className="h-8 w-8 text-slate-600" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <div>
                    <h4 className="text-white font-bold text-sm">Relatório de Fim de Disparo</h4>
                    <p className="text-slate-500 text-xs">Quando campanhas em massa (Broadcast) terminarem, enviar estatísticas de entrega.</p>
                  </div>
                  <button onClick={() => setNotifs({...notifs, emailOnBroadcastEnd: !notifs.emailOnBroadcastEnd})}>
                    {notifs.emailOnBroadcastEnd ? <ToggleRight className="h-8 w-8 text-indigo-500" /> : <ToggleLeft className="h-8 w-8 text-slate-600" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl opacity-60">
                  <div>
                     <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold text-sm">Notificações Push (Navegador)</h4>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 rounded font-black tracking-widest uppercase">Em Breve</span>
                     </div>
                    <p className="text-slate-500 text-xs">Receber notificações na tela para eventos importantes.</p>
                  </div>
                  <ToggleLeft className="h-8 w-8 text-slate-700" />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-800">
                <button className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all font-black text-sm uppercase tracking-tight">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Preferências
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
