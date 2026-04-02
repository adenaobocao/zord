'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setError('Email ou senha incorretos');
      setLoading(false);
      return;
    }

    router.push('/gerente');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#f0f0f0]">ZORD</h1>
          <p className="text-lg font-bold text-[#8b5cf6]">POKER PIRAI</p>
          <p className="text-[#888] text-sm mt-2">Acesso do gerente</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-14 px-4 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full h-14 px-4 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]"
          />

          {error && (
            <p className="text-[#ef4444] text-sm font-bold text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 min-h-[56px] rounded-xl bg-[#8b5cf6] text-white font-black text-lg hover:bg-[#7c3aed] transition-colors disabled:opacity-50"
          >
            <LogIn size={22} />
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </div>
  );
}
