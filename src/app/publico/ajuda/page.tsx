import { Shield, DollarSign, Timer, Trophy, Users, Tv, Zap, Lock } from 'lucide-react';

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center shrink-0">
          <Icon size={20} className="text-[#8b5cf6]" />
        </div>
        <h3 className="text-[#f0f0f0] font-bold text-lg">{title}</h3>
      </div>
      <div className="text-[#888] text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

export default function AjudaPage() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-black text-[#f0f0f0] mb-2">Como funciona</h1>
      <p className="text-[#888] text-sm mb-6">
        O Zord Poker Pirai automatiza todo o gerenciamento do torneio.
        O gerente controla tudo pelo celular enquanto joga.
      </p>

      <div className="flex flex-col gap-4">
        <Section icon={Users} title="1. Inscricao">
          <p>
            Antes do jogo, voce coloca seu nome na lista de confirmados
            direto pelo celular. O gerente ve quem confirmou e monta a mesa.
          </p>
        </Section>

        <Section icon={Zap} title="2. Torneio ao vivo">
          <p>
            Quando o jogo comeca, o timer de blinds roda automaticamente.
            Cada nivel sobe sozinho. Rebuys sao registrados com um toque.
          </p>
          <p>
            A tela publica mostra tudo em tempo real — jogadores, buy-ins,
            prize pool, blinds. Pode jogar na TV ou no celular de cada jogador.
          </p>
        </Section>

        <Section icon={DollarSign} title="3. Hora de acertar (Pix)">
          <p>
            No intervalo do addon, o sistema mostra quanto cada jogador deve
            e a chave Pix do banco. Conforme o gerente confirma os pagamentos,
            a tela atualiza em tempo real.
          </p>
          <p className="text-[#f0f0f0] font-bold">
            Se faltam 1-2 jogadores, os nomes ficam em destaque vermelho
            na tela publica. Pressao social saudavel!
          </p>
        </Section>

        <Section icon={Lock} title="4. Trava de pagamento">
          <p className="text-[#ef4444] font-bold">
            A fase de eliminacao SO comeca quando 100% dos jogadores pagaram.
            Sem excecao. O sistema nao permite liberar com alguem devendo.
          </p>
          <p>
            Isso elimina o fiado e garante que o prize pool esta completo
            antes do jogo continuar.
          </p>
        </Section>

        <Section icon={Timer} title="5. Eliminacao">
          <p>
            Sem recompra. Conforme jogadores sao eliminados, o gerente
            registra com um toque. A colocacao e automatica — o ultimo
            eliminado e o pior colocado.
          </p>
          <p>
            Quando restam so os jogadores que vao ser premiados (ITM),
            a tela mostra "BOLHA!" e os valores dos premios.
          </p>
        </Section>

        <Section icon={Trophy} title="6. Resultado e ranking">
          <p>
            Campeao definido, premios calculados automaticamente.
            O gerente publica o resultado e os pontos do circuito
            sao atualizados na hora.
          </p>
          <p>
            O ranking acumula pontos evento a evento. Desempate:
            mais vitorias, mais podios, menos eventos jogados (eficiencia).
          </p>
        </Section>

        <Section icon={Tv} title="Tela do Jogo (TV)">
          <p>
            A aba "Game" mostra a tela otimizada para TV ou monitor.
            Timer gigante, blinds, status de pagamento, eliminacoes —
            tudo atualiza sozinho sem precisar dar refresh.
          </p>
          <p>
            Tambem funciona no celular pra cada jogador acompanhar.
          </p>
        </Section>

        <Section icon={Shield} title="Seguranca">
          <p>
            So o gerente autenticado pode modificar dados do torneio.
            A tela publica e somente leitura. Chaves Pix dos jogadores
            so ficam visiveis pro gerente.
          </p>
        </Section>
      </div>

      <div className="mt-8 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 p-4 text-center">
        <p className="text-[#8b5cf6] font-bold text-sm">
          ZORD POKER PIRAI
        </p>
        <p className="text-[#888] text-xs mt-1">
          Gerenciamento automatizado de torneios home game
        </p>
      </div>
    </div>
  );
}
