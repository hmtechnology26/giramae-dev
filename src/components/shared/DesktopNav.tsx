
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, Package, Trophy, Users, Wallet, Heart, UserCheck } from 'lucide-react';
import { cn } from "@/lib/utils";

const NavLink: React.FC<{ to: string; icon: React.ElementType; children: React.ReactNode }> = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 hover:text-pink-600 transition-colors",
        isActive ? "text-pink-600" : "text-gray-800"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </Link>
  );
};

const DesktopNav: React.FC = () => {
  return (
    <nav className="flex gap-8 items-center text-sm font-medium">
      {/* Bloco de Ações Principais */}
      <NavLink to="/feed" icon={Home}>Feed</NavLink>
      <NavLink to="/publicar" icon={Plus}>Publicar</NavLink>
      <NavLink to="/minhas-reservas" icon={Package}>Reservas</NavLink>

      {/* Separador Vertical */}
      <div className="border-l h-6 border-gray-300 mx-2"></div>

      {/* Bloco de Funcionalidades */}
      <NavLink to="/carteira" icon={Wallet}>Carteira</NavLink>
      <NavLink to="/favoritos" icon={Heart}>Favoritos</NavLink>
      <NavLink to="/maes-seguidas" icon={UserCheck}>Mães Seguidas</NavLink>

      {/* Separador Vertical */}
      <div className="border-l h-6 border-gray-300 mx-2"></div>

      {/* Bloco de Gamificação */}
      <NavLink to="/missoes" icon={Trophy}>Missões</NavLink>
      <NavLink to="/indicacoes" icon={Users}>Indicações</NavLink>
    </nav>
  );
};

export default DesktopNav;
