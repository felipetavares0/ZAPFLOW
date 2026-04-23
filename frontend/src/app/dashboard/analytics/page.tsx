'use client';

import React, { useEffect, useState } from 'react';
import { BarChart2, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '@/services/api';

interface WppStatus { totalSent: number; totalFailed: number; status: string; }
interface LogEntry { number: string; message: string; status: 'sent' | 'failed'; time: string; }

export default function AnalyticsPage() {
  const [wpp, setWpp] = useState<WppStatus | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, logRes] = await Promise.all([
        api.get('/whatsapp/status'),
        api.get('/whatsapp/log'),
      ]);
      setWpp(statusRes.data);
      setLog(logRes.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const sentCount = log.filter((l) => l.status === 'sent').length;
  const failedCount = log.filter((l) => l.status === 'failed').length;
  const successRate = log.length > 0 ? ((sentCount / log.length) * 100).toFixed(1) : '—';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Análise de Performance</h1>
          <p className="text-slate-400 mt-1">Dados reais das suas mensagens enviadas nesta sessão.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all"
        >
          <RefreshCw className="h-4 w-4" /> Atualizar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <Send className="h-5 w-5 text-indigo-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Total Enviadas</span>
              </div>
              <p className="text-3xl font-bold text-white">{wpp?.totalSent ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">Mensagens desde que o servidor iniciou</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Taxa de Sucesso</span>
              </div>
              <p className="text-3xl font-bold text-white">{successRate}{successRate !== '—' ? '%' : ''}</p>
              <p className="text-xs text-slate-500 mt-1">Baseado nas últimas 50 mensagens</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rose-500/10 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Total de Falhas</span>
              </div>
              <p className="text-3xl font-bold text-white">{wpp?.totalFailed ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">Erros de entrega acumulados</p>
            </div>
          </div>

          {/* Log table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-indigo-400" />
              Histórico Recente
            </h3>

            {log.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center gap-4">
                <div className="p-4 bg-slate-800/50 rounded-full">
                  <BarChart2 className="h-10 w-10 text-slate-600" />
                </div>
                <div>
                  <p className="text-white font-medium">Nenhum disparo realizado ainda</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Vá em <strong>Disparos</strong>, conecte seu WhatsApp e envie mensagens para ver os dados aqui.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 text-left border-b border-slate-800">
                      <th className="pb-3 font-medium">Número</th>
                      <th className="pb-3 font-medium">Mensagem</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Horário</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {log.map((entry, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-mono text-slate-300">{entry.number}</td>
                        <td className="py-3 text-slate-400 max-w-xs truncate">{entry.message}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                            entry.status === 'sent'
                              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                              : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${entry.status === 'sent' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            {entry.status === 'sent' ? 'Enviado' : 'Falhou'}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-xs">
                          {new Date(entry.time).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
