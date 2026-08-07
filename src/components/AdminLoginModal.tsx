import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, LogIn, AlertCircle, FileText } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onLoginSuccess: () => void;
  onGoToPublicForm?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  onGoToPublicForm,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      if (
        (cleanUser === 'admin@natacaocriativa.com' || cleanUser === 'admin') &&
        password === 'admin123'
      ) {
        localStorage.setItem('admin_authenticated', 'true');
        onLoginSuccess();
      } else {
        setError('Usuário ou senha inválidos.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative">
        {/* Top Header Decoration */}
        <div className="bg-gradient-to-r from-[#003882] via-[#0059bb] to-[#0070ea] p-6 text-white text-center relative">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xs border border-white/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-headline font-bold text-xl text-white">
            Acesso Administrativo
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Plataforma Gestão Natação Criativa
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold font-headline text-gray-700 mb-1">
                E-mail ou Usuário
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0059bb] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-headline text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0059bb] focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0059bb] hover:bg-[#0070ea] text-white font-headline font-bold text-xs py-3 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting ? 'Autenticando...' : 'Entrar no Painel Admin'}
            </button>
          </form>

          {onGoToPublicForm && (
            <div className="pt-2 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={onGoToPublicForm}
                className="text-xs font-semibold text-gray-500 hover:text-[#0059bb] flex items-center justify-center gap-1.5 mx-auto py-1"
              >
                <FileText className="w-3.5 h-3.5" />
                Acessar Formulário Público do Aluno
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
