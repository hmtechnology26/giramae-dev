
import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Package, Users, User, Heart, UserCheck } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface MoreMenuProps {
  children: React.ReactNode;
}

const MoreMenu: React.FC<MoreMenuProps> = ({ children }) => {
  const moreItems = [
    { icon: Wallet, label: "Carteira", path: "/carteira" },
    { icon: Package, label: "Reservas", path: "/minhas-reservas" },
    { icon: Heart, label: "Favoritos", path: "/favoritos" },
    { icon: UserCheck, label: "Mães Seguidas", path: "/maes-seguidas" },
    { icon: Users, label: "Indicações", path: "/indicacoes" },
    { icon: User, label: "Perfil", path: "/perfil" }
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[50vh]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-3 py-6">
          {moreItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="lg"
                asChild
                className="h-16 flex-col space-y-2"
              >
                <Link to={item.path}>
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MoreMenu;
