import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, Trophy, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMissoes } from '@/hooks/useMissoes';
import { cn } from "@/lib/utils";

const QuickNav: React.FC = () => {
  const location = useLocation();
  const { missoesCompletas } = useMissoes();

  if (location.pathname === "/") {
    return null;
  }

  const mainItems = [
    { icon: Home, label: "Feed", path: "/feed" },
    { icon: Plus, label: "Postar", path: "/publicar" },
    { icon: Trophy, label: "Missões", path: "/missoes" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-primary/5 z-50 backdrop-blur-2xl transition-all h-[70px]">
      <div className="grid grid-cols-4 h-full items-center">
        {mainItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-all duration-300 relative h-full group",
                isActive ? "text-primary" : "text-pink-500/55 hover:text-pink-500"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive
                      ? "text-primary text-glow drop-shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
                      : "text-pink-500/70"
                  )}
                />
                {item.path === '/missoes' && missoesCompletas > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 text-[8px] p-0 bg-pink-500 border-2 border-white flex items-center justify-center font-bold text-white shadow-sm">
                    {missoesCompletas}
                  </Badge>
                )}
              </div>
              <span
                className={cn(
                  "text-[8px] font-bold tracking-[0.08em] uppercase",
                  isActive ? "opacity-100 text-pink-600" : "opacity-70 text-pink-500/70"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-pink-500/50 rounded-full blur-[1px]" />
              )}
            </Link>
          );
        })}

        <a
          href="https://wa.me/5551981011805?text=Olá!%20Preciso%20de%20ajuda%20no%20GiraMãe."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center space-y-1 text-pink-500/55 hover:text-pink-500 transition-all duration-300 h-full group"
        >
          <div className="relative">
            <MessageCircle className="h-5 w-5 text-pink-500/70 group-hover:scale-105 transition-transform" />
          </div>
          <span className="text-[8px] font-bold tracking-[0.08em] uppercase opacity-70 text-pink-500/70">
            Suporte
          </span>
        </a>
      </div>
    </nav>
  );
};

export default QuickNav;
