'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Send, 
  FileText, 
  Settings, 
  Users, 
  BarChart3,
  LogOut,
  Zap,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Disparos', href: '/dashboard/broadcast', icon: Send },
  { name: 'Automação', href: '/dashboard/automation', icon: Bot },
  { name: 'Templates', href: '/dashboard/templates', icon: FileText },
  { name: 'Contatos', href: '/dashboard/contacts', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen text-slate-300">
      <div className="flex items-center h-16 px-6 border-b border-slate-800">
        <Zap className="h-8 w-8 text-indigo-500 fill-indigo-500" />
        <span className="ml-3 text-xl font-bold text-white tracking-tight">Arco-Mix / Arco-Vita</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5 transition-colors",
                isActive ? "text-white" : "text-slate-400 group-hover:text-white"
              )} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
