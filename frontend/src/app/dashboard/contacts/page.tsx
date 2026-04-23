'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, Plus, Filter, Download, Mail, Phone, Tag, Trash2, RefreshCcw, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Lead {
  id: string;
  name: string;
  number: string;
  tags: string[];
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/leads');
      setContacts(res.data);
    } catch (err) {
      console.error('Erro ao buscar contatos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const leads = [];

        // Skip header if it exists
        const startIdx = lines[0].toLowerCase().includes('numero') || lines[0].toLowerCase().includes('number') ? 1 : 0;

        for (let i = startIdx; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const [number, name] = line.split(/[;,]/);
          if (number) {
            leads.push({ 
              number: number.trim().replace(/\D/g, ''), 
              name: name ? name.trim() : 'Contato Importante',
              tags: ['Importado']
            });
          }
        }

        if (leads.length === 0) {
          throw new Error('Nenhum contato válido encontrado no arquivo.');
        }

        await api.post('/leads/import', leads);
        setImportStatus({ type: 'success', message: `${leads.length} contatos importados com sucesso!` });
        fetchContacts();
      } catch (err: any) {
        setImportStatus({ type: 'error', message: err.message || 'Falha ao importar contatos.' });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja remover este contato?')) return;
    try {
      await api.delete(`/leads/${id}`);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Erro ao excluir contato.');
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.number.includes(searchTerm)
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
            <Users className="text-indigo-500 h-8 w-8" /> Gestão de Audiência
          </h1>
          <p className="text-slate-400 mt-1">Gerencie leads e listas para seus disparos personalizados.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 font-bold text-sm disabled:opacity-50"
          >
            {isImporting ? <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Importar CSV
          </button>
          <button 
            onClick={() => {
              const csvContent = "numero,nome\n5581999990000,João Silva\n5581888880000,Arco Mix Exemplo";
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "modelo_contatos.csv";
              link.click();
            }}
            className="flex items-center px-5 py-2.5 border border-slate-700 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-all font-bold text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Modelo
          </button>
        </div>
      </div>

      {importStatus && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border flex items-center gap-3 ${
            importStatus.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
          }`}
        >
          {importStatus.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-bold uppercase tracking-tight">{importStatus.message}</span>
          <button onClick={() => setImportStatus(null)} className="ml-auto text-xs opacity-50 hover:opacity-100">Fechar</button>
        </motion.div>
      )}

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 flex flex-col md:flex-row gap-4 shadow-xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou número..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Grid de Contatos */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {loading ? (
           <div className="p-20 flex flex-col items-center justify-center space-y-4">
              <RefreshCcw className="h-10 w-10 text-indigo-500 animate-spin" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando Audiência...</p>
           </div>
        ) : filteredContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/30">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contato</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">WhatsApp</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Segmentação</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <AnimatePresence>
                  {filteredContacts.map((contact) => (
                    <motion.tr 
                      key={contact.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-800/30 transition-all group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20">
                            {contact.name?.substring(0, 2).toUpperCase() || 'NA'}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-bold text-white tracking-tight">{contact.name || 'Sem Nome'}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black">Cliente Ativo</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center text-sm text-slate-300 font-mono">
                            <Phone className="h-3 w-3 mr-2 text-indigo-500" />
                            {contact.number}
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map(tag => (
                            <span key={tag} className="text-[9px] font-black bg-slate-950 text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-500/20 uppercase">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-xs text-slate-500 font-medium">
                        {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleDelete(contact.id)}
                          className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sua audiência está vazia</h3>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-8">
              Importe sua primeira lista de contatos via CSV para começar a enviar campanhas inteligentes.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-8 py-3 bg-slate-800 border border-slate-700 text-white rounded-2xl hover:bg-slate-700 transition-all font-bold text-sm shadow-xl"
            >
              Começar Importação
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
