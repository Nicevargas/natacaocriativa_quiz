import React from 'react';
import { Home, PieChart, Users, ClipboardCheck, BarChart2, ClipboardList } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.06)] md:hidden border-t border-gray-100">
      <button
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 active:scale-90 transition-transform ${
          activeTab === 'dashboard'
            ? 'bg-[#0070ea] text-white font-bold'
            : 'text-[#414754] hover:bg-gray-100'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="font-headline text-[10px] mt-0.5">Home</span>
      </button>

      <button
        onClick={() => onTabChange('empreendedorismo')}
        className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 active:scale-90 transition-transform ${
          activeTab === 'empreendedorismo'
            ? 'bg-[#0070ea] text-white font-bold'
            : 'text-[#414754] hover:bg-gray-100'
        }`}
      >
        <ClipboardList className="w-5 h-5 text-amber-500" />
        <span className="font-headline text-[10px] mt-0.5">Form</span>
      </button>

      <button
        onClick={() => onTabChange('live')}
        className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 active:scale-90 transition-transform ${
          activeTab === 'live'
            ? 'bg-[#0070ea] text-white font-bold'
            : 'text-[#414754] hover:bg-gray-100'
        }`}
      >
        <PieChart className="w-5 h-5 text-rose-500" />
        <span className="font-headline text-[10px] mt-0.5">Ao Vivo</span>
      </button>

      <button
        onClick={() => onTabChange('students')}
        className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 active:scale-90 transition-transform ${
          activeTab === 'students'
            ? 'bg-[#0070ea] text-white font-bold'
            : 'text-[#414754] hover:bg-gray-100'
        }`}
      >
        <Users className="w-5 h-5" />
        <span className="font-headline text-[10px] mt-0.5">Alunos</span>
      </button>

      <button
        onClick={() => onTabChange('quiz')}
        className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 active:scale-90 transition-transform ${
          activeTab === 'quiz'
            ? 'bg-[#0070ea] text-white font-bold'
            : 'text-[#414754] hover:bg-gray-100'
        }`}
      >
        <ClipboardCheck className="w-5 h-5" />
        <span className="font-headline text-[10px] mt-0.5">Quiz</span>
      </button>
    </nav>
  );
};

