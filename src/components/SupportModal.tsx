import React from 'react';
import { X, HelpCircle, Mail, Phone, MessageSquare, ExternalLink } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#0059bb]" />
            <h2 className="font-headline font-bold text-lg text-[#191c1d]">Suporte Natação Criativa</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 py-4 text-xs font-body text-[#191c1d]">
          <p className="text-gray-600">
            Precisa de ajuda pedagógica ou suporte técnico para suas turmas de Empreendedorismo Aquático?
          </p>

          <a
            href="https://wa.me/5585999998888"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-200 font-semibold transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="block font-bold">Atendimento via WhatsApp</span>
              <span className="text-[11px] text-emerald-700 font-normal">Suporte rápido para coordenadores</span>
            </div>
          </a>

          <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-xl border border-gray-200">
            <Mail className="w-5 h-5 text-[#0059bb]" />
            <div>
              <span className="block font-bold">Email Pedagógico</span>
              <span className="text-[11px] text-gray-500">suporte@natacaocriativa.com.br</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold text-xs">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
