import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toast } from '../ui/Toast';
import { Cat, Loader2 } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.login(email, password);
      toast.success('Login efetuado com sucesso');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao efetuar login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F1EE]">
      <div className="relative z-10 max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#11190c] mb-4">
            <Cat className="w-8 h-8 text-[#e6ff00]" />
          </div>
          <h2 className="text-4xl font-moonwalk font-bold text-[#11190c] tracking-tight">
            RankPanda
          </h2>
          <p className="mt-2 text-sm text-[#444638]">
            Entre na sua conta para continuar
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-[#11190c]/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                  placeholder="rui@rankpanda.pt"
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
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}