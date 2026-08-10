import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { Student, StudentProfile, RoleArea, QuizStatus } from '../types';

interface StudentsTabProps {
  students: Student[];
  onAddStudent: (newStudent: Omit<Student, 'id'>) => void;
  onOpenStudentDetail: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  onAddStudent,
  onOpenStudentDetail,
  onDeleteStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfileFilter, setSelectedProfileFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Fortaleza - CE');
  const [profile, setProfile] = useState<StudentProfile>('Empreendedor em Ascensão');
  const [roleArea, setRoleArea] = useState<RoleArea>('Personal Aquático');
  const [score, setScore] = useState<number>(85);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProfile =
      selectedProfileFilter === 'ALL' || student.profile === selectedProfileFilter;

    const matchesStatus =
      selectedStatusFilter === 'ALL' || student.quizStatus === selectedStatusFilter;

    return matchesSearch && matchesProfile && matchesStatus;
  });

  const handleSubmitNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    onAddStudent({
      name,
      avatarInitials: initials || 'AL',
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@natacaocriativa.com`,
      phone: phone || '(85) 99000-0000',
      city,
      cohortId: 'all-cohorts',
      profile,
      roleArea,
      score,
      quizStatus: 'Completed',
      completedAt: 'Hoje',
      answersCount: 10,
    });

    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-[0px_10px_30px_rgba(0,123,255,0.06)] border border-gray-100">
        <div>
          <h1 className="font-headline text-2xl font-bold text-[#191c1d]">
            Gestão de Alunos / Students
          </h1>
          <p className="font-body text-xs md:text-sm text-[#414754] mt-0.5">
            Cadastre, acompanhe o engajamento e consulte perfis diagnósticos dos alunos das turmas.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#0059bb] hover:bg-[#0070ea] text-white font-headline font-bold text-xs md:text-sm px-5 py-2.5 rounded-full shadow-sm transition-all active:scale-95 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Aluno</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f3f4f5] pl-9 pr-3 py-2 rounded-xl text-xs font-body focus:outline-none focus:ring-2 focus:ring-[#0059bb]"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-[#0059bb]" /> Filtrar:
          </div>

          <select
            value={selectedProfileFilter}
            onChange={(e) => setSelectedProfileFilter(e.target.value)}
            className="bg-[#f3f4f5] text-xs font-medium text-[#191c1d] px-3 py-2 rounded-xl border border-gray-200/80 focus:outline-none"
          >
            <option value="ALL">Todos os Perfis</option>
            <option value="Empreendedor em Ascensão">Empreendedor em Ascensão</option>
            <option value="Visionário Estratégico">Visionário Estratégico</option>
            <option value="Gestor Operacional">Gestor Operacional</option>
            <option value="Personal Aquático">Personal Aquático</option>
            <option value="Consultoria">Consultoria</option>
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-[#f3f4f5] text-xs font-medium text-[#191c1d] px-3 py-2 rounded-xl border border-gray-200/80 focus:outline-none"
          >
            <option value="ALL">Status do Quiz: Todos</option>
            <option value="Completed">Concluído</option>
            <option value="In Progress">Em andamento</option>
            <option value="Pending">Pendente</option>
          </select>
        </div>
      </div>

      {/* Student List Grid / Table */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-3">
          <UserPlus className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-headline font-bold text-base text-[#191c1d]">Nenhum aluno/participante registrado ainda</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Os dados deste painel são 100% reais vindos do banco de dados Supabase. Assim que novos alunos enviarem o formulário ou responderem ao quiz, eles aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
          const statusBadge =
            student.quizStatus === 'Completed' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                <CheckCircle2 className="w-3 h-3" /> Concluído
              </span>
            ) : student.quizStatus === 'In Progress' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/50">
                <Clock className="w-3 h-3" /> Em Andamento
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                <AlertCircle className="w-3 h-3" /> Pendente
              </span>
            );

          return (
            <div
              key={student.id}
              className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0070ea] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {student.avatarInitials}
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-sm text-[#191c1d] group-hover:text-[#0059bb] transition-colors">
                        {student.name}
                      </h3>
                      <p className="text-[11px] text-gray-500">{student.roleArea}</p>
                    </div>
                  </div>
                  {statusBadge}
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 my-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{student.city}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                      Perfil Diagnóstico
                    </span>
                    <span className="font-bold text-[#0059bb]">{student.profile}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                      Score
                    </span>
                    <span className="font-headline font-extrabold text-sm text-[#191c1d]">
                      {student.score}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => onDeleteStudent(student.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remover Aluno"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenStudentDetail(student)}
                  className="bg-[#f3f4f5] hover:bg-[#0059bb] hover:text-white text-[#191c1d] font-headline font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Detalhes</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Modal Cadastrar Aluno */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h2 className="font-headline text-lg font-bold text-[#191c1d] mb-1">
              Cadastrar Novo Aluno
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Preencha os dados do participante para gerar a avaliação diagnóstica.
            </p>

            <form onSubmit={handleSubmitNewStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Gabriel Vasconcelos"
                  className="w-full bg-[#f3f4f5] px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0059bb]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aluno@email.com"
                    className="w-full bg-[#f3f4f5] px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0059bb]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(85) 98888-7777"
                    className="w-full bg-[#f3f4f5] px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0059bb]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Cidade / Estado</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Fortaleza - CE"
                  className="w-full bg-[#f3f4f5] px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0059bb]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Perfil Diagnóstico</label>
                  <select
                    value={profile}
                    onChange={(e) => setProfile(e.target.value as StudentProfile)}
                    className="w-full bg-[#f3f4f5] px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0059bb]"
                  >
                    <option value="Empreendedor em Ascensão">Empreendedor em Ascensão</option>
                    <option value="Visionário Estratégico">Visionário Estratégico</option>
                    <option value="Gestor Operacional">Gestor Operacional</option>
                    <option value="Personal Aquático">Personal Aquático</option>
                    <option value="Consultoria">Consultoria</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Área de Atuação</label>
                  <select
                    value={roleArea}
                    onChange={(e) => setRoleArea(e.target.value as RoleArea)}
                    className="w-full bg-[#f3f4f5] px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0059bb]"
                  >
                    <option value="Personal Aquático">Personal Aquático</option>
                    <option value="Professor de Natação">Professor de Natação</option>
                    <option value="Gestor de Academia">Gestor de Academia</option>
                    <option value="Consultoria">Consultoria</option>
                    <option value="Dono de Metodologia">Dono de Metodologia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Score Inicial ({score}/100)</label>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full accent-[#0059bb]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0059bb] hover:bg-[#0070ea] text-white font-bold"
                >
                  Salvar Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
