export function formatMoney(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function calcTotalDevido(
  buyIns: number,
  rebuyValor: number,
  addon: boolean,
  addonValor: number,
  buyInValor: number
): number {
  // First buy-in uses buy_in value, rebuys use rebuy_valor
  return buyInValor + (buyIns - 1) * rebuyValor + (addon ? addonValor : 0);
}

export function calcPrizePool(
  totalArrecadado: number,
  rakePercent: number
): number {
  return totalArrecadado * (1 - rakePercent / 100);
}

export function calcPremiacao(
  prizePool: number,
  estrutura: number[]
): number[] {
  return estrutura.map((pct) => Math.round(prizePool * (pct / 100)));
}

export function calcPontos(
  colocacao: number,
  tabelaPontos: Record<string, number>
): number {
  const key = String(colocacao);
  if (tabelaPontos[key]) return tabelaPontos[key];
  // For positions beyond the table, find the highest key and use its value
  const maxKey = Math.max(...Object.keys(tabelaPontos).map(Number));
  if (colocacao >= maxKey) return tabelaPontos[String(maxKey)] || 10;
  return 10;
}

export function formatTimer(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
