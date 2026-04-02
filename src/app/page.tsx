import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6">
      <div className="flex flex-col items-center gap-10 max-w-md w-full">
        {/* Branding */}
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#f0f0f0]">
            ZORD
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-[#8b5cf6] tracking-wide">
            POKER PIRAI
          </p>
        </div>

        {/* What is this */}
        <div className="text-center max-w-sm">
          <p className="text-[#888] text-sm leading-relaxed">
            Plataforma de gerenciamento de torneios de poker home game.
            Controle de buy-in, rebuys, pagamentos via Pix, eliminacoes
            e ranking do circuito — tudo automatizado e em tempo real.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/publico"
            className="flex items-center justify-center min-h-[64px] rounded-2xl bg-[#8b5cf6] text-white font-black text-xl hover:bg-[#7c3aed] active:bg-[#6d28d9] transition-colors"
          >
            ENTRAR
          </Link>
          <Link
            href="/gerente/login"
            className="flex items-center justify-center min-h-[48px] rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#888] font-bold text-sm hover:text-[#f0f0f0] hover:bg-[#1e1e1e] transition-colors"
          >
            Acesso Gerente
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 w-full text-center">
          <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-3">
            <p className="text-[#22c55e] text-lg font-black">PIX</p>
            <p className="text-[#888] text-[10px]">Cobranca automatica</p>
          </div>
          <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-3">
            <p className="text-[#8b5cf6] text-lg font-black">LIVE</p>
            <p className="text-[#888] text-[10px]">Tempo real</p>
          </div>
          <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-3">
            <p className="text-[#eab308] text-lg font-black">RANK</p>
            <p className="text-[#888] text-[10px]">Circuito de pontos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
