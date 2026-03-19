import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import { ItemCard } from '@/components/shared/ItemCard';
import { useAuth } from '@/hooks/useAuth';
import { useItensInteligentes } from '@/hooks/useItensInteligentes';
import { useDebounce } from '@/hooks/useDebounce';
import { useSimpleGeolocation } from '@/hooks/useSimpleGeolocation';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { analytics } from '@/lib/analytics';

const BuscarItens = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [busca, setBusca] = useState('');
  const debouncedBusca = useDebounce(busca, 500);
  
  const { location, detectarLocalizacao } = useSimpleGeolocation();
  
  const { data: itens = [], isLoading } = useItensInteligentes({
    busca: debouncedBusca,
    location: location || undefined,
    ordem: 'recentes'
  });

  // ✅ ANALYTICS: Busca realizada
  useEffect(() => {
    if (debouncedBusca) {
      analytics.search.query(debouncedBusca, itens.length);
    }
  }, [debouncedBusca, itens.length]);

  // Mock feedData since this is a simple search page
  const mockFeedData = useMemo(() => ({
    favoritos: [],
    reservas_usuario: [],
    filas_espera: {},
  }), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">
            Buscar Itens
          </h1>
          <p className="text-gray-600">
            Encontre exatamente o que você procura
          </p>
        </div>

        {/* Campo de busca */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Digite o que você procura..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            
            {location && (
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Buscando em {location.cidade}, {location.estado}</span>
              </div>
            )}
            
            {!location && (
              <Button
                onClick={detectarLocalizacao}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Usar minha localização
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Resultados */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {debouncedBusca && (
              <div className="mb-4 text-sm text-gray-600">
                {itens.length} {itens.length === 1 ? 'resultado encontrado' : 'resultados encontrados'} 
                {debouncedBusca && ` para "${debouncedBusca}"`}
              </div>
            )}
            
            {itens.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {itens.map((item: any) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    feedData={mockFeedData}
                    currentUserId={user?.id || ''}
                    onItemClick={(itemId) => navigate(`/item/${itemId}`)}
                  />
                ))}
              </div>
            ) : debouncedBusca ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-gray-600">
                    Tente usar outras palavras-chave ou verifique sua localização
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Comece a buscar</h3>
                  <p className="text-gray-600">
                    Digite algo no campo acima para encontrar itens incríveis
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
      
      <QuickNav />
    </div>
  );
};

export default BuscarItens;
