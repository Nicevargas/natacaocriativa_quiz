import React, { useState } from 'react';
import { X, Settings, Database, Sliders, Shield, Save, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [methodologyName, setMethodologyName] = useState('Natação Criativa');
  const [passingScore, setPassingScore] = useState(80);
  const [autoEmail, setAutoEmail] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0059bb]" />
            <h2 className="font-headline font-bold text-lg text-[#191c1d]">Configurações da Plataforma</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 py-4 text-xs font-body">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Nome da Metodologia / Marca</label>
            <input
              type="text"
              value={methodologyName}
              onChange={(e) => setMethodologyName(e.target.value)}
              className="w-full bg-[#f3f4f5] p-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0059bb]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Score Mínimo Recomendado ({passingScore}/100)</label>
            <input
              type="range"
              min="50"
              max="95"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="w-full accent-[#0059bb]"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer bg-[#f8f9fa] p-3 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              checked={autoEmail}
              onChange={(e) => setAutoEmail(e.target.checked)}
              className="rounded text-[#0059bb] focus:ring-[#0059bb] w-4 h-4"
            />
            <div>
              <span className="font-bold text-[#191c1d] block">Notificações Automáticas por Email</span>
              <span className="text-[11px] text-gray-500">Enviar relatório em PDF ao aluno ao concluir o quiz.</span>
            </div>
          </label>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#0059bb] text-white font-bold hover:bg-[#0070ea] flex items-center gap-1.5"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Configurações Salvas!' : 'Salvar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
