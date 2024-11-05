import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toast } from '../ui/Toast';
import { Loader2 } from 'lucide-react';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.register(email, password, name);
      toast.success('Registo efetuado com sucesso. Aguarde aprovação.');
      navigate('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao efetuar registo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F1EE]">
      <div className="relative z-10 max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#11190c] mb-4">
            <svg width="32" height="32" viewBox="0 0 512 512" className="text-[#e6ff00]">
              <path fill="currentColor" d="M256 32c-74.2 0-138.6 40.8-170.9 100.8-16.1-10.9-35.3-17.4-56.1-17.4C12.9 115.4 0 128.3 0 144.4s12.9 28.9 28.9 28.9c20.8 0 40-6.5 56.1-17.4C117.4 215.8 181.8 256.6 256 256.6s138.6-40.8 170.9-100.8c16.1 10.9 35.3 17.4 56.1 17.4 16 0 28.9-12.9 28.9-28.9s-12.9-28.9-28.9-28.9c-20.8 0-40 6.5-56.1 17.4C394.6 72.8 330.2 32 256 32zm-64 96c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/>
            </svg>
          </div>
          <h2 className="text-4xl font-moonwalk font-bold text-[#11190c] tracking-tight">
            RankPanda
          </h2>
          <p className="mt-2 text-sm text-[#444638]">
            Crie a sua conta para começar
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-[#11190c]/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#444638]">
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-[#11190c]/20 bg-white/50 shadow-sm focus:border-[#11190c] focus:ring-[#11190c] transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#444638]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-[#11190c]/20 bg-white/50 shadow-sm focus:border-[#11190c] focus:ring-[#11190c] transition-colors"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#444638]">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-[#11190c]/20 bg-white/50 shadow-sm focus:border-[#11190c] focus:ring-[#11190c] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#11190c] bg-[#e6ff00] hover:bg-[#e6ff00]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#11190c] disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Registar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}