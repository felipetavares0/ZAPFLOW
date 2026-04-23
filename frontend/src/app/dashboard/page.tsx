'use client';

import React, { useEffect, useState } from 'react';
import { Users, Send, CheckCircle2, AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import api from '@/services/api';

interface WppStatus {
  status: 'INITIALIZING' | 'WAITING_QR' | 'CONNECTED' | 'DISCONNECTED' | 'AUTH_FAILURE';
  qrCode: string | null;
  totalSent: number;
  totalFailed: number;
}

export default function DashboardPage() {
  const [wpp, setWpp] = useState<WppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('zapflow_user');
    if (stored) setUser(JSON.parse(stored));
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/whatsapp/status');
      setWpp(data);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  const isConnected = wpp?.status === 'CONNECTED';
  const isWaiting = wpp?.status === 'WAITING_QR';

  const statusColor = {
    CONNECTED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    WAITING_QR: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    INITIALIZING: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    DISCONNECTED: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    AUTH_FAILURE: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  const statusLabel = {
    CONNECTED: 'Conectado',
    WAITING_QR: 'Aguardando QR Code',
    INITIALIZING: 'Inicializando...',
    DISCONNECTED: 'Desconectado',
    AUTH_FAILURE: 'Falha de Autenticação',
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bem-vindo, {user?.name || 'Admin'}!
        </h1>
        <p className="text-slate-400 mt-1">Painel de controle da sua plataforma de disparos.</p>
      </div>

      {/* Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-emerald-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-rose-400" />
            )}
            Status do WhatsApp
          </h3>
          <button
            onClick={fetchStatus}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-slate-400">
            <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full" />
            Conectando ao servidor...
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${wpp ? statusColor[wpp.status] : 'text-slate-400 bg-slate-800 border-slate-700'}`}>
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : isWaiting ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
              {wpp ? statusLabel[wpp.status] : 'Sem resposta do servidor'}
            </div>

            {/* QR Code */}
            {isWaiting && wpp?.qrCode && (
              <div className="mt-4 flex flex-col items-start gap-3">
                <p className="text-sm text-amber-400 font-medium">
                  📱 Escaneie o QR Code abaixo no seu WhatsApp para conectar:
                </p>
                <div className="bg-white p-3 rounded-xl inline-block">
                  <img src={wpp.qrCode} alt="QR Code WhatsApp" className="w-48 h-48" />
                </div>
                <p className="text-xs text-slate-500">
                  WhatsApp → Dispositivos Vinculados → Vincular um dispositivo
                </p>
              </div>
            )}

            {/* Stats quando conectado */}
            {isConnected && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Send className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Enviadas</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{wpp?.totalSent ?? 0}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-rose-400" />
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Falhas</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{wpp?.totalFailed ?? 0}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guia de início rápido */}
      {!isConnected && !loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🚀 Como Começar</h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Aguarde o QR Code aparecer no card acima (pode levar alguns segundos)' },
              { step: '2', text: 'Abra o WhatsApp no celular → Menu → Dispositivos Vinculados → Vincular' },
              { step: '3', text: 'Escaneie o QR Code. A sessão será salva automaticamente.' },
              { step: '4', text: 'Vá em "Disparos" para enviar mensagens de teste ou campanhas em massa' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.step}
                </span>
                <p className="text-sm text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
