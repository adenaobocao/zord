'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, Tv, Trophy, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/publico', label: 'Evento', icon: ClipboardList },
  { href: '/publico/game', label: 'Game', icon: Tv },
  { href: '/publico/ranking', label: 'Ranking', icon: Trophy },
  { href: '/publico/ajuda', label: 'Ajuda', icon: HelpCircle },
];

export default function PublicoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/publico') return pathname === '/publico';
    return pathname.startsWith(href);
  }

  // Game page in fullscreen mode (no nav)
  if (pathname.startsWith('/publico/game/')) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 flex items-center justify-around h-16 border-t border-[#2a2a2a] bg-[#0a0a0a] z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors min-w-[64px]',
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
  );
}
