import React, { useState } from 'react';
import { Bell, HelpCircle, ChevronDown, Check, User, Sparkles, ShieldCheck, LogOut } from 'lucide-react';
import { LOGO_URL } from '../data/mockData';
import { Cohort } from '../types';

interface HeaderProps {
  selectedCohort: Cohort;
  cohorts: Cohort[];
  onSelectCohort: (cohort: Cohort) => void;
  onOpenNewReport: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCohort,
  cohorts,
  onSelectCohort,
  onOpenNewReport,
  onLogout,
}) => {
  const [isCohortDropdownOpen, setIsCohortDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-4 md:px-6 w-full h-16 bg-white shadow-[0px_10px_30px_rgba(0,123,255,0.08)] border-b border-gray-100">
      {/* Brand & Cohort Picker */}
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2">
          <img
            alt="Natação Criativa"
            className="h-8 md:h-9 w-auto object-contain"
            src={LOGO_URL}
            onError={(e) => {
              // Fallback if image doesn't load
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="font-headline text-lg md:text-xl font-bold text-[#0059bb] tracking-tight hidden sm:inline-block">
            Natação Criativa
          </span>
        </div>

        {/* Cohort Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setIsCohortDropdownOpen(!isCohortDropdownOpen)}
            className="flex items-center gap-2 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] px-3 py-1.5 rounded-full font-headline font-semibold text-xs md:text-sm transition-all border border-gray-200/60"
          >
            <span className="w-2 h-2 rounded-full bg-[#0059bb]"></span>
            <span className="max-w-[140px] md:max-w-[220px] truncate">{selectedCohort.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#414754]" />
          </button>

          {isCohortDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-[#414754] uppercase tracking-wider">
                Selecionar Turma / Visão
              </div>
              {cohorts.map((cohort) => (
                <button
                  key={cohort.id}
                  onClick={() => {
                    onSelectCohort(cohort);
                    setIsCohortDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs md:text-sm flex items-center justify-between hover:bg-[#f3f4f5] transition-colors ${
                    selectedCohort.id === cohort.id ? 'bg-[#d8e2ff]/40 text-[#0059bb] font-semibold' : 'text-[#191c1d]'
                  }`}
                >
                  <div>
                    <div className="font-medium">{cohort.name}</div>
                    <div className="text-[11px] text-gray-500">{cohort.totalParticipants} alunos • {cohort.location}</div>
                  </div>
                  {selectedCohort.id === cohort.id && <Check className="w-4 h-4 text-[#0059bb]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-4 text-[#414754]">
        {/* Quick Report action on tablet/desktop */}
        <button
          onClick={onOpenNewReport}
          className="hidden lg:flex items-center gap-1.5 bg-[#0059bb] hover:bg-[#0070ea] text-white px-3 py-1.5 rounded-full font-headline font-semibold text-xs transition-transform active:scale-95 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Novo Relatório</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:text-[#0059bb] hover:bg-gray-100 rounded-full transition-colors active:scale-95 relative"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#b80049] rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50">
              <div className="flex justify-between items-center mb-2 pb-2 border-b">
                <span className="font-headline text-xs font-bold text-[#191c1d]">Notificações</span>
                <span className="text-[10px] bg-blue-100 text-[#0059bb] px-2 py-0.5 rounded-full font-semibold">2 novas</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                  <p className="font-semibold text-gray-800">Novo quiz concluído por Maria José</p>
                  <p className="text-[11px] text-gray-500">Pontuação: 95/100 • Há 10 minutos</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                  <p className="font-medium text-gray-800">Turma 01 Fortaleza atingiu 85% de conclusão</p>
                  <p className="text-[11px] text-gray-500">Ontem às 18:30</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help button */}
        <button
          onClick={() => alert('Central de Suporte Natação Criativa:\n• Email: suporte@natacaocriativa.com.br\n• WhatsApp: (85) 99999-8888')}
          className="p-2 hover:text-[#0059bb] hover:bg-gray-100 rounded-full transition-colors active:scale-95 hidden sm:block"
          title="Ajuda e Suporte"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Admin Badge & Account Controls */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 bg-[#0059bb]/10 hover:bg-[#0059bb]/15 border border-[#0059bb]/20 text-[#0059bb] px-2.5 py-1.5 rounded-full font-headline font-bold text-xs transition-all active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-[#0059bb]" />
            <span className="hidden sm:inline">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="font-headline font-bold text-xs text-[#191c1d] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0059bb]" />
                  Administrador
                </p>
                <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                  admin@natacaocriativa.com
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    alert('Logado como Administrador com privilégios totais.');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-gray-500" /> Perfil Admin
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-600" /> Sair do Sistema
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
