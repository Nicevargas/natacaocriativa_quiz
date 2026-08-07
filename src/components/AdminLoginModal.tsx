import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Key, LogIn, AlertCircle, Sparkles, Check, FileText } from 'lucide-react';
import { LOGO_URL } from '../data/mockData';

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
  const [username, setUsername] = useState('admin@natacaocriativa.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  if (!isOpen) return null;

  const handleFillDefault = () => {
    setUsername('admin@natacaocriativa.com');
    setPassword('admin123');
    setError(null);
    setAutoFilled(true);
    setTimeout(() => setAutoFilled(false), 2000);
  };

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
        setError('Usuário ou senha inválidos. Utilize as credenciais padrão informadas abaixo.');
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
          {/* Default Credentials Notice */}
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-headline font-bold flex items-center gap-1.5 text-[#0059bb]">
                <Key className="w-4 h-4 text-[#0059bb]" /> Credenciais Padrão do Sistema
              </span>
              <button
                type="button"
                onClick={handleFillDefault}
                className="text-[11px] font-bold text-[#0059bb] bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs hover:bg-blue-50 flex items-center gap-1 active:scale-95 transition-all"
              >
                {autoFilled ? <Check className="w-3 h-3 text-emerald-600" /> : <Sparkles className="w-3 h-3" />}
                {autoFilled ? 'Preenchido!' : 'Preencher Padrão'}
              </button>
            </div>
            <div className="bg-white/80 rounded-xl p-2.5 space-y-1 font-mono text-[11px] border border-blue-100 text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Usuário:</span>
                <span className="font-bold text-[#191c1d]">admin@natacaocriativa.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Senha:</span>
                <span className="font-bold text-[#191c1d]">admin123</span>
              </div>
            </div>
          </div>

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
                  placeholder="admin@natacaocriativa.com"
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
