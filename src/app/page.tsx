import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6">
      <div className="flex flex-col items-center gap-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[#f0f0f0]">
            ZORD
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-[#8b5cf6] tracking-wide">
            POKER PIRAI
          </p>
          <p className="text-[#888] text-sm mt-2">
            Gerenciamento de torneios home game
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Link
            href="/gerente"
            className="flex items-center justify-center min-h-[64px] rounded-2xl bg-[#8b5cf6] text-white font-black text-xl hover:bg-[#7c3aed] active:bg-[#6d28d9] transition-colors"
          >
            GERENTE
          </Link>
          <Link
            href="/publico"
            className="flex items-center justify-center min-h-[64px] rounded-2xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] font-black text-xl hover:bg-[#1e1e1e] active:bg-[#2a2a2a] transition-colors"
          >
            TELA PUBLICA
          </Link>
        </div>
      </div>
    </div>
  );
}
