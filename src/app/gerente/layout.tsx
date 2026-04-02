'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Trophy, Settings } from 'lucide-react';
import { ToastProvider } from '@/components/toast';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/gerente', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/gerente/jogadores', label: 'Jogadores', icon: Users },
  { href: '/gerente/ranking', label: 'Ranking', icon: Trophy },
  { href: '/gerente/configuracoes', label: 'Config', icon: Settings },
];

export default function GerenteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/gerente') return pathname === '/gerente';
    return pathname.startsWith(href);
  }

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        {/* Header desktop */}
        <header className="hidden md:flex items-center gap-6 px-6 h-16 border-b border-[#2a2a2a] bg-[#0a0a0a]">
          <Link href="/gerente" className="flex items-center gap-2 mr-8">
            <span className="text-xl font-black text-[#f0f0f0]">ZORD</span>
            <span className="text-sm font-bold text-[#8b5cf6]">POKER</span>
          </Link>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors',
                  active
                    ? 'bg-[#8b5cf6]/15 text-[#8b5cf6]'
                    : 'text-[#888] hover:text-[#f0f0f0] hover:bg-[#141414]'
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </header>

        {/* Content */}
        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Bottom nav mobile */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 flex items-center justify-around h-16 border-t border-[#2a2a2a] bg-[#0a0a0a] z-40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-[64px]',
                  active ? 'text-[#8b5cf6]' : 'text-[#888]'
                )}
              >
                <Icon size={22} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </ToastProvider>
  );
}
