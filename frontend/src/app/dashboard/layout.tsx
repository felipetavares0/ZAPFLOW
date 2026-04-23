import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-white">Visão Geral</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-white">Arco-Mix / Arco-Vita</span>
              <span className="text-xs text-slate-400">Admin</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold ring-2 ring-indigo-500/20">
              UA
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
