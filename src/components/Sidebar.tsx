import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  TrendingUp,
  Settings,
  HelpCircle,
  PlusCircle,
  PieChart,
  ClipboardList,
} from 'lucide-react';
import { LOGO_SIDEBAR_URL } from '../data/mockData';

export type ActiveTab = 'dashboard' | 'live' | 'empreendedorismo' | 'students' | 'quiz' | 'growth';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenNewReport: () => void;
  onOpenSettings: () => void;
  onOpenSupport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewReport,
  onOpenSettings,
  onOpenSupport,
}) => {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] hidden md:flex flex-col p-4 w-60 bg-[#f3f4f5] z-40 border-r border-gray-200/80 justify-between">
      <div className="flex flex-col gap-2">
        {/* Optional Logo image inside sidebar if top header logo is simplified */}
        <div className="px-2 py-2 mb-2 flex items-center gap-2">
          <img
            src={LOGO_SIDEBAR_URL}
            alt="Natação Criativa Logo"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Primary Navigation links */}
        <nav className="flex flex-col gap-1.5">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-3 p-3 rounded-lg font-headline font-bold text-xs md:text-sm active:scale-[0.98] transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#0070ea] text-white shadow-sm'
                : 'text-[#414754] hover:bg-[#e7e8e9] hover:text-[#191c1d]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('empreendedorismo')}
            className={`flex items-center gap-3 p-3 rounded-lg font-headline font-bold text-xs md:text-sm active:scale-[0.98] transition-all ${
              activeTab === 'empreendedorismo'
                ? 'bg-[#0070ea] text-white shadow-sm'
                : 'text-[#414754] hover:bg-[#e7e8e9] hover:text-[#191c1d]'
            }`}
          >
            <ClipboardList className="w-5 h-5 text-amber-500" />
            <span>Form. Fortaleza</span>
          </button>

          <button
            onClick={() => onTabChange('live')}
            className={`flex items-center justify-between p-3 rounded-lg font-headline font-bold text-xs md:text-sm active:scale-[0.98] transition-all ${
              activeTab === 'live'
                ? 'bg-[#0070ea] text-white shadow-sm'
                : 'text-[#414754] hover:bg-[#e7e8e9] hover:text-[#191c1d]'
            }`}
          >
            <div className="flex items-center gap-3">
              <PieChart className="w-5 h-5 text-rose-500" />
              <span>Pizza Ao Vivo</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </button>

          <button
            onClick={() => onTabChange('students')}
            className={`flex items-center gap-3 p-3 rounded-lg font-headline font-bold text-xs md:text-sm active:scale-[0.98] transition-all ${
              activeTab === 'students'
                ? 'bg-[#0070ea] text-white shadow-sm'
                : 'text-[#414754] hover:bg-[#e7e8e9] hover:text-[#191c1d]'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Alunos / Students</span>
          </button>

          <button
            onClick={() => onTabChange('quiz')}
            className={`flex items-center gap-3 p-3 rounded-lg font-headline font-bold text-xs md:text-sm active:scale-[0.98] transition-all ${
              activeTab === 'quiz'
                ? 'bg-[#0070ea] text-white shadow-sm'
                : 'text-[#414754] hover:bg-[#e7e8e9] hover:text-[#191c1d]'
            }`}
          >
            <FileQuestion className="w-5 h-5" />
            <span>Quiz & Avaliação</span>
          </button>

          <button
            onClick={() => onTabChange('growth')}
            className={`flex items-center gap-3 p-3 rounded-lg font-headline font-bold text-xs md:text-sm active:scale-[0.98] transition-all ${
              activeTab === 'growth'
                ? 'bg-[#0070ea] text-white shadow-sm'
                : 'text-[#414754] hover:bg-[#e7e8e9] hover:text-[#191c1d]'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Evolução & Growth</span>
          </button>
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={onOpenNewReport}
          className="w-full bg-[#0059bb] hover:bg-[#0070ea] text-white py-2.5 px-3 rounded-lg font-headline font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 mb-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Novo Relatório</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-3 p-2.5 text-[#414754] rounded-lg font-headline font-semibold text-xs hover:bg-[#e7e8e9] transition-all active:scale-[0.98]"
        >
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </button>

        <button
          onClick={onOpenSupport}
          className="flex items-center gap-3 p-2.5 text-[#414754] rounded-lg font-headline font-semibold text-xs hover:bg-[#e7e8e9] transition-all active:scale-[0.98]"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Suporte</span>
        </button>
      </div>
    </aside>
  );
};
