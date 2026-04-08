import { useState } from "react";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import Footer from "@/components/shared/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Users,
  Package,
  CheckCircle,
  Search,
  X,
  ChevronRight
} from "lucide-react";
import { useReservas } from "@/hooks/useReservas";
import ReservaCard from "@/components/reservas/ReservaCard";
import FilaEsperaCard from "@/components/reservas/FilaEsperaCard";
import ModalItemDetalhes from "@/components/reservas/ModalItemDetalhes";
import { useAuth } from "@/hooks/useAuth";
import { useTourTrigger } from "@/modules/onboarding";
import SEOHead from "@/components/seo/SEOHead";
import { pageTitle } from "@/lib/pageTitle";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { cn } from "@/lib/utils";

const MinhasReservas = () => {
  const { user } = useAuth();
  const {
    reservas,
    filasEspera,
    loading,
    confirmarEntrega,
    cancelarReserva,
    sairDaFila,
    refetch,
  } = useReservas();

  // ✅ TOUR: Dispara automaticamente na primeira visita
  useTourTrigger("reservas-tour", {
    condition: "first-visit",
    delay: 1000,
  });

  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [modalItemAberto, setModalItemAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null);
  const [contextType, setContextType] = useState<
    "reserva" | "fila" | "venda" | "concluida"
  >("reserva");
  const [codigoBusca, setCodigoBusca] = useState<string>("");

  const minhasReservasAtivas = reservas.filter(
    (r) => r.usuario_reservou === user?.id && ["pendente"].includes(r.status),
  );

  const meusItensReservados = reservas.filter(
    (r) => r.usuario_item === user?.id && ["pendente"].includes(r.status),
  );

  const reservasConcluidas = reservas.filter(
    (r) =>
      (r.usuario_reservou === user?.id || r.usuario_item === user?.id) &&
      r.status === "confirmada",
  );

  const abrirModalItem = (
    itemId: string,
    context: "reserva" | "fila" | "venda" | "concluida" = "reserva",
  ) => {
    setItemSelecionado(itemId);
    setContextType(context);
    setModalItemAberto(true);
  };

  const getReservasFiltradas = () => {
    if (codigoBusca) {
      const todasReservas = [
        ...minhasReservasAtivas,
        ...meusItensReservados,
        ...reservasConcluidas,
      ];
      return todasReservas.filter((reserva) =>
        reserva.itens?.codigo_unico
          ?.toLowerCase()
          .includes(codigoBusca.toLowerCase()),
      );
    }

    let reservasFiltradas: any[] = [];
    switch (filtroStatus) {
      case "ativas":
        reservasFiltradas = minhasReservasAtivas;
        break;
      case "vendas":
        reservasFiltradas = meusItensReservados;
        break;
      case "concluidas":
        reservasFiltradas = reservasConcluidas;
        break;
      default:
        return [];
    }
    return reservasFiltradas;
  };

  const getFilasFiltradas = () => {
    if (codigoBusca) {
      return filasEspera.filter((fila) =>
        fila.itens?.codigo_unico
          ?.toLowerCase()
          .includes(codigoBusca.toLowerCase()),
      );
    }
    return filasEspera;
  };

  const getEstatisticas = () => {
    return [
      {
        icon: Package,
        title: "Reservas Ativas",
        value: minhasReservasAtivas.length,
        color: "text-primary",
        bg: "bg-primary/5",
        filtro: "ativas",
      },
      {
        icon: Users,
        title: "Em Espera",
        value: filasEspera.length,
        color: "text-blue-600",
        bg: "bg-blue-50",
        filtro: "fila",
      },
      {
        icon: Clock,
        title: "Minhas Vendas",
        value: meusItensReservados.length,
        color: "text-orange-600",
        bg: "bg-orange-50",
        filtro: "vendas",
      },
      {
        icon: CheckCircle,
        title: "Concluídas",
        value: reservasConcluidas.length,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        filtro: "concluidas",
      },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const stats = getEstatisticas();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
      <SEOHead title={pageTitle.reservas()} />
      <Header />

      <main className="container flex flex-col items-center justify-center mx-auto pt-32 pb-24 px-4 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Minhas{" "}
            <span className="text-glow text-primary italic">Reservas</span>
          </h1>
          <p className="text-foreground/40 font-bold ml-8 uppercase tracking-widest text-[10px] mt-2">
            Acompanhe suas trocas e vendas em tempo real
          </p>
        </div>

        {/* ✅ BUSCA E ESTATÍSTICAS */}
        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-12">
            <div className="premium-card bg-white/70 backdrop-blur-2xl border-black/20 rounded-[3.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(235,51,148,0.1)]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <button
                    key={stat.filtro}
                    onClick={() =>
                      setFiltroStatus(
                        filtroStatus === stat.filtro ? "todas" : stat.filtro,
                      )
                    }
                    className={cn(
                      "group relative p-8 rounded-[2.5rem] border transition-all duration-500 text-left overflow-hidden",
                      filtroStatus === stat.filtro
                        ? "bg-white border-primary/20 shadow-2xl scale-105 z-10"
                        : "bg-white/40 border-black/10 hover:bg-white/60 hover:shadow-lg",
                    )}
                  >
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-inner",
                        stat.bg,
                        stat.color,
                        filtroStatus === stat.filtro
                          ? "scale-110 rotate-3 shadow-lg"
                          : "group-hover:scale-110",
                      )}
                    >
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-4xl font-black text-foreground tracking-tighter drop-shadow-sm font-sans">
                        {stat.value}
                      </p>
                      <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] leading-none">
                        {stat.title}
                      </p>
                    </div>

                    {filtroStatus === stat.filtro && (
                      <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_12px_rgba(235,51,148,0.5)]" />
                    )}

                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>

              <div className="mt-10 ml-24 pt-10 border-t border-primary/5">
                <div className="relative group max-w-2xl">
                  <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none text-primary/90 font-black text-xs tracking-widest">
                    GRM-
                  </div>
                  <input
                    type="text"
                    placeholder="Busque pelo código do item (ex: 8X4Z2)"
                    value={codigoBusca}
                    onChange={(e) =>
                      setCodigoBusca(e.target.value.toUpperCase())
                    }
                    maxLength={5}
                    className="w-full pl-24 pr-14 py-6 bg-white/40 border-primary/5 focus:border-primary/20 focus:ring-primary/5 rounded-[2rem] font-sans font-black uppercase tracking-[0.1em] text-sm transition-all placeholder:text-foreground/20 placeholder:font-bold"
                  />
                  {codigoBusca ? (
                    <button
                      onClick={() => setCodigoBusca("")}
                      className="absolute inset-y-0 right-6 flex items-center text-primary/40 hover:text-primary transition-colors p-2"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="absolute inset-y-0 right-7 flex items-center text-primary/10">
                      <Search className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 ml-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                  <p className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.2em]">
                    O código único de 5 dígitos está na página do produto
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ CONTEÚDO DINÂMICO */}
        <div className="space-y-12">
          {codigoBusca ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs italic italic">
                  !
                </div>
                <h3 className="font-black text-foreground tracking-tight uppercase text-sm">
                  Resultados para "GRM-{codigoBusca}"
                </h3>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {getReservasFiltradas().map((reserva) => (
                  <ReservaCard
                    key={reserva.id}
                    reserva={reserva}
                    onConfirmarEntrega={confirmarEntrega}
                    onCancelarReserva={cancelarReserva}
                    onRefresh={refetch}
                    onVerDetalhes={(itemId) =>
                      abrirModalItem(itemId, "reserva")
                    }
                  />
                ))}
                {getFilasFiltradas().map((fila) => (
                  <FilaEsperaCard
                    key={fila.id}
                    fila={fila}
                    onSairDaFila={sairDaFila}
                  />
                ))}
              </div>

              {getReservasFiltradas().length === 0 &&
                getFilasFiltradas().length === 0 && (
                  <div className="premium-card bg-white/40 border-dashed border-primary/20 rounded-[3rem] py-20 text-center space-y-4">
                    <Search className="w-12 h-12 text-primary/10 mx-auto" />
                    <p className="text-foreground/40 font-black uppercase tracking-widest text-xs">
                      Nenhum registro encontrado
                    </p>
                  </div>
                )}
            </div>
          ) : filtroStatus !== "todas" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filtroStatus === "fila"
                  ? getFilasFiltradas().map((fila) => (
                      <FilaEsperaCard
                        key={fila.id}
                        fila={fila}
                        onSairDaFila={sairDaFila}
                      />
                    ))
                  : getReservasFiltradas().map((reserva) => (
                      <ReservaCard
                        key={reserva.id}
                        reserva={reserva}
                        onConfirmarEntrega={confirmarEntrega}
                        onCancelarReserva={cancelarReserva}
                        onRefresh={refetch}
                        onVerDetalhes={(itemId) =>
                          abrirModalItem(itemId, filtroStatus as any)
                        }
                      />
                    ))}
              </div>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Seções agrupadas */}
              {minhasReservasAtivas.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-black text-foreground tracking-tight italic">
                        Suas <span className="text-primary">Reservas</span>
                      </h2>
                    </div>
                    <Badge className="bg-primary/5 text-primary border-none rounded-full px-4 py-1 font-black">
                      {minhasReservasAtivas.length}
                    </Badge>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {minhasReservasAtivas.map((reserva) => (
                      <ReservaCard
                        key={reserva.id}
                        reserva={reserva}
                        onConfirmarEntrega={confirmarEntrega}
                        onCancelarReserva={cancelarReserva}
                        onRefresh={refetch}
                        onVerDetalhes={(itemId) =>
                          abrirModalItem(itemId, "reserva")
                        }
                      />
                    ))}
                  </div>
                </section>
              )}

              {filasEspera.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-blue-500" />
                      <h2 className="text-2xl font-black text-foreground tracking-tight italic">
                        Filas de <span className="text-blue-500">Espera</span>
                      </h2>
                    </div>
                    <Badge className="bg-blue-50 text-blue-600 border-none rounded-full px-4 py-1 font-black">
                      {filasEspera.length}
                    </Badge>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {filasEspera.map((fila) => (
                      <FilaEsperaCard
                        key={fila.id}
                        fila={fila}
                        onSairDaFila={sairDaFila}
                      />
                    ))}
                  </div>
                </section>
              )}

              {meusItensReservados.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-orange-500" />
                      <h2 className="text-2xl font-black text-foreground tracking-tight italic">
                        Minhas <span className="text-orange-500">Reservas</span>
                      </h2>
                    </div>
                    <Badge className="bg-orange-50 text-orange-600 border-none rounded-full px-4 py-1 font-black">
                      {meusItensReservados.length}
                    </Badge>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {meusItensReservados.map((reserva) => (
                      <ReservaCard
                        key={reserva.id}
                        reserva={reserva}
                        onConfirmarEntrega={confirmarEntrega}
                        onCancelarReserva={cancelarReserva}
                        onRefresh={refetch}
                        onVerDetalhes={(itemId) =>
                          abrirModalItem(itemId, "venda")
                        }
                      />
                    ))}
                  </div>
                </section>
              )}

              {reservasConcluidas.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                      <h2 className="text-2xl font-black text-foreground tracking-tight italic">
                        Trocas{" "}
                        <span className="text-emerald-500">Concluídas</span>
                      </h2>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full px-4 py-1 font-black">
                      {reservasConcluidas.length}
                    </Badge>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {reservasConcluidas.slice(0, 6).map((reserva) => (
                      <ReservaCard
                        key={reserva.id}
                        reserva={reserva}
                        onConfirmarEntrega={confirmarEntrega}
                        onCancelarReserva={cancelarReserva}
                        onRefresh={refetch}
                        onVerDetalhes={(itemId) =>
                          abrirModalItem(itemId, "concluida")
                        }
                      />
                    ))}
                  </div>
                  {reservasConcluidas.length > 6 && (
                    <div className="text-center">
                      <Button
                        onClick={() => setFiltroStatus("concluidas")}
                        variant="ghost"
                        className="text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-primary transition-colors flex items-center mx-auto gap-2"
                      >
                        Ver histórico completo{" "}
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </section>
              )}

              {reservas.length === 0 && filasEspera.length === 0 && (
                <div className="premium-card bg-white/40 border-dashed border-primary/20 rounded-[3rem] py-32 text-center space-y-8">
                  <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto shadow-inner relative group"></div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-foreground tracking-tight italic">
                      O coração da rede está batendo!
                    </h3>
                    <p className="text-sm font-medium text-foreground/40 max-w-xs mx-auto leading-relaxed">
                      Você ainda não tem reservas ativas. Que tal explorar o
                      feed e encontrar o próximo tesouro para seu pequeno?
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/feed")}
                    className="founders-button px-10 h-14 text-white rounded-full"
                  >
                    Explorar Feed
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <ModalItemDetalhes
        isOpen={modalItemAberto}
        onClose={() => setModalItemAberto(false)}
        itemId={itemSelecionado}
        contextType={contextType}
      />

      <QuickNav />
      <Footer />
    </div>
  );
};

export default MinhasReservas;
