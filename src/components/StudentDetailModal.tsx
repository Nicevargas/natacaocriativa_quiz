import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Award, BookOpen, Save, Check } from 'lucide-react';
import { Student } from '../types';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  onUpdateNotes: (studentId: string, notes: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onUpdateNotes,
}) => {
  if (!student) return null;

  const [notes, setNotes] = useState(student.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveNotes = () => {
    onUpdateNotes(student.id, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0059bb] text-white font-headline font-bold text-base flex items-center justify-center shadow-sm">
              {student.avatarInitials}
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-[#191c1d]">
                {student.name}
              </h2>
              <p className="text-xs text-gray-500">{student.roleArea} • {student.city}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 py-4 text-xs">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 bg-[#f8f9fa] p-3.5 rounded-xl border border-gray-200/70">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Perfil Diagnóstico</span>
              <span className="font-bold text-[#0059bb] text-xs">{student.profile}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Score / Pontuação</span>
              <span className="font-headline font-extrabold text-[#191c1d] text-sm">{student.score} / 100</span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-600 col-span-2 pt-1">
              <Mail className="w-3.5 h-3.5 text-gray-400" /> {student.email}
            </div>

            <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
              <Phone className="w-3.5 h-3.5 text-gray-400" /> {student.phone}
            </div>
          </div>

          {/* Pedagogy / Notes */}
          <div>
            <label className="block font-headline font-bold text-[#191c1d] mb-1">
              Observações Pedagógicas & Mentoria:
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione anotações pedagógicas sobre a evolução do aluno..."
              className="w-full bg-[#f3f4f5] p-3 rounded-xl text-xs text-[#191c1d] focus:outline-none focus:ring-2 focus:ring-[#0059bb]"
            ></textarea>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[11px] text-gray-400">
                Quiz concluído: {student.completedAt}
              </span>

              <button
                onClick={handleSaveNotes}
                className="bg-[#0059bb] hover:bg-[#0070ea] text-white font-headline font-semibold text-xs px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Salvo!' : 'Salvar Notas'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-[#191c1d] font-headline font-semibold text-xs rounded-xl"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
