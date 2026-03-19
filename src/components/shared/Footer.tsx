import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/40 backdrop-blur-xl border-t border-primary/5 py-16 px-6 mt-12 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 mb-16">
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="inline-block group">
              <img
                src="/giramae_logo.png"
                alt="Logo GiraMãe"
                className="h-10 w-auto transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <p className="text-foreground/40 text-sm font-medium leading-relaxed max-w-sm">
              Potencializando o empreendedorismo materno através de uma comunidade de trocas consciente, sustentável e amorosa.
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em]">Contato Direto</span>
              <a href="mailto:atendimento@giramae.com.br" className="text-foreground/60 hover:text-primary text-sm font-bold transition-colors">
                atendimento@giramae.com.br
              </a>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h3 className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em]">Plataforma</h3>
            <div className="flex flex-col gap-4">
              <Link to="/sobre" className="text-foreground/40 hover:text-primary text-sm font-bold transition-all hover:translate-x-1">Sobre Nós</Link>
              <Link to="/como-funciona" className="text-foreground/40 hover:text-primary text-sm font-bold transition-all hover:translate-x-1">Como Funciona</Link>
              <Link to="/blog" className="text-foreground/40 hover:text-primary text-sm font-bold transition-all hover:translate-x-1">Universos</Link>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h3 className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em]">Recursos</h3>
            <div className="flex flex-col gap-4">
              <Link to="/faq" className="text-foreground/40 hover:text-primary text-sm font-bold transition-all hover:translate-x-1">FAQ</Link>
              <Link to="/contato" className="text-foreground/40 hover:text-primary text-sm font-bold transition-all hover:translate-x-1">Suporte</Link>
              <Link to="/seguranca" className="text-foreground/40 hover:text-primary text-sm font-bold transition-all hover:translate-x-1">Segurança</Link>
            </div>
          </div>

          <div className="md:col-span-4 space-y-6">
            <h3 className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em]">Localização Atual</h3>
            <div className="premium-card p-6 bg-white/50 border-0 rounded-3xl shadow-lg border border-primary/5 flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground/80">Canoas, RS</p>
                <p className="text-xs text-foreground/40 font-medium">Bases em expansão por toda a região metropolitana.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/5 pt-12 flex flex-col md:flex-col items-center justify-between gap-8">
          <div className="flex items-center gap-4 text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
            <span>&copy; {new Date().getFullYear()} GiraMãe</span>
            <span className="w-1 h-1 bg-foreground/50 rounded-full" />
            <span>Feito com</span>
            <Heart className="h-3 w-3 text-primary/40 fill-primary/30" />
            <span>para mães</span>
          </div>

          <div className="flex items-center gap-8">
            <p className="text-xs text-foreground/20 font-medium">Desenvolvido por <a href="https://www.instagram.com/hmtech_oficial?igsh=cWc0eDlxNTZtMjY=" target="_blank" rel="noopener noreferrer" className="text-foreground/30 hover:text-blue-900 text-xs font-bold transition-all  hover:translate-x-1">HM Technology</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
