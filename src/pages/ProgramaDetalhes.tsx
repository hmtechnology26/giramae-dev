import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft, Calendar, CreditCard } from 'lucide-react';
import { useProgramaDetalhes } from '@/hooks/parcerias/useProgramaDetalhes';
import { useToast } from '@/hooks/use-toast';
import SEOHead from '@/components/seo/SEOHead';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import QuickNav from '@/components/shared/QuickNav';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

export default function ProgramaDetalhes() {
  const { organizacao_codigo, programa_codigo } = useParams();
  const {
    programa,
    organizacao,
    validacao,
    loading,
    solicitarValidacao
  } = useProgramaDetalhes(organizacao_codigo!, programa_codigo!);

  const [dadosUsuario, setDadosUsuario] = useState<Record<string, string>>({});
  const [documentos, setDocumentos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Prefill automático do formulário após rejeição
  React.useEffect(() => {
    if (validacao?.status === 'rejeitado' && validacao.dados_usuario) {
      setDadosUsuario(validacao.dados_usuario);
    }
  }, [validacao]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex flex-col items-center justify-center font-sans">
        <LoadingSpinner size="xl" text="Carregando programa..." />
      </div>
    );
  }

  if (!programa || !organizacao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
        <SEOHead title="Programa não encontrado | GiraMãe" />
        <Header />

        <main className="container flex flex-col items-center justify-center mx-auto pt-32 pb-24 px-4 w-full max-w-[1600px]">
          <div className="w-full max-w-4xl">
            <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40">
              <CardContent className="p-10 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white/60 border border-white/60 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-foreground/40" />
                </div>
                <h3 className="text-xl font-black mb-2 text-foreground tracking-tight">Programa não encontrado</h3>
                <p className="text-foreground/50 font-medium mb-6">
                  O programa solicitado não existe ou não está mais disponível.
                </p>
                <Button asChild className="founders-button px-8 h-12 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20">
                  <Link to="/parcerias">Voltar às Parcerias</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <QuickNav />
        <Footer />
      </div>
    );
  }

  const handleSolicitacao = async () => {
    // Validar campos obrigatórios (exceto se for apenas 'N/A')
    const camposValidos = programa.campos_obrigatorios.filter(c => c !== 'N/A');
    if (camposValidos.length > 0 && !camposValidos.every(campo => dadosUsuario[campo])) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validar documentos apenas se forem necessários
    const documentosNecessarios = programa.documentos_aceitos && 
                                   programa.documentos_aceitos.length > 0 && 
                                   !programa.documentos_aceitos.includes('N/A');
    
    if (documentosNecessarios && documentos.length === 0) {
      toast({
        title: "Documentos necessários",
        description: "Envie pelo menos um documento.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      await solicitarValidacao(dadosUsuario, documentos);
      setDadosUsuario({});
      setDocumentos([]);
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = () => {
    switch (validacao?.status) {
      case 'aprovado': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejeitado': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pendente': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return null;
    }
  };

  const getStatusText = () => {
    switch (validacao?.status) {
      case 'aprovado': return 'Aprovado - Recebendo benefícios';
      case 'rejeitado': return 'Rejeitado';
      case 'pendente': return 'Em análise';
      default: return 'Não solicitado';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
      <SEOHead 
        title={`${programa.nome} - ${organizacao.nome} | GiraMãe`}
        description={programa.descricao}
      />
      <Header />
      
      <main className="container flex flex-col items-center justify-center mx-auto pt-32 pb-24 px-4 w-full max-w-[1600px]">
        <div className="w-full max-w-4xl space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-full px-6 h-12 border-white/60 bg-white/20 hover:bg-white/40 uppercase font-black text-[10px] tracking-widest text-foreground/60"
            >
              <Link to="/parcerias">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
          </div>

        <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40">
          <CardHeader>
            <div className="flex items-center gap-4">
              {organizacao.logo_url && (
                <img src={organizacao.logo_url} alt={organizacao.nome} 
                     className="w-16 h-16 rounded-2xl object-cover border border-white/60 bg-white/60" />
              )}
              <div className="flex-1">
                <CardTitle className="text-2xl font-black tracking-tight" style={{ color: programa.cor_tema }}>
                  {programa.nome}
                </CardTitle>
                <p className="text-foreground/60 font-medium">{organizacao.nome}</p>
                <p className="text-sm text-foreground/50 font-medium mt-1">{programa.descricao}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon()}
                  <span className="text-sm font-bold text-foreground/70">{getStatusText()}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span>{programa.valor_mensal} Girinhas/mês</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status Atual */}
            {validacao && (
              <Card className="premium-card rounded-[2rem] border border-white/60 bg-white/40">
                <CardContent className="p-4">
                  <h4 className="font-black mb-2 text-foreground tracking-tight">Status da sua solicitação</h4>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon()}
                    <span className="font-bold text-foreground/70">{getStatusText()}</span>
                  </div>
                  <div className="text-sm text-foreground/50 font-medium space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Solicitado em: {new Date(validacao.data_solicitacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {validacao.data_validacao && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Analisado em: {new Date(validacao.data_validacao).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    {validacao.status === 'aprovado' && (
                      <div className="text-green-600 font-medium">
                        Total recebido: {validacao.total_creditos_recebidos} Girinhas
                      </div>
                    )}
                    {validacao.motivo_rejeicao && (
                      <div className="text-red-600 text-sm mt-2">
                        <strong>Motivo da rejeição:</strong> {validacao.motivo_rejeicao}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefícios */}
            <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40">
              <CardHeader>
                <CardTitle className="text-lg font-black tracking-tight">Benefícios do Programa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/40 border border-white/60 rounded-2xl">
                    <CreditCard className="w-8 h-8 mx-auto mb-2" style={{ color: programa.cor_tema }} />
                    <div className="font-bold text-lg">{programa.valor_mensal}</div>
                    <div className="text-sm text-muted-foreground">Girinhas por mês</div>
                  </div>
                  <div className="text-center p-4 bg-white/40 border border-white/60 rounded-2xl">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-bold text-lg">{programa.validade_meses || 12}</div>
                    <div className="text-sm text-muted-foreground">Meses de validade</div>
                  </div>
                  <div className="text-center p-4 bg-white/40 border border-white/60 rounded-2xl">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="font-bold text-lg">Dia {programa.dia_creditacao || 1}</div>
                    <div className="text-sm text-muted-foreground">Creditação mensal</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Critérios de Elegibilidade */}
            {programa.criterios_elegibilidade && (
              <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40">
                <CardHeader>
                  <CardTitle className="text-lg font-black tracking-tight">Critérios de Elegibilidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {programa.criterios_elegibilidade}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Formulário de Solicitação */}
            {(!validacao || validacao.status === 'rejeitado') && (
              <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40">
                <CardHeader>
                  <CardTitle className="text-lg font-black tracking-tight">Solicitar Participação</CardTitle>
                  {programa.instrucoes_usuario && (
                    <p className="text-sm text-muted-foreground">{programa.instrucoes_usuario}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Campos obrigatórios */}
                  {programa.campos_obrigatorios && programa.campos_obrigatorios.filter(c => c !== 'N/A').length > 0 && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {programa.campos_obrigatorios.filter(c => c !== 'N/A').map((campo) => (
                        <div key={campo}>
                          <Label htmlFor={campo} className="capitalize">
                            {campo.replace(/_/g, ' ')} *
                          </Label>
                          <Input
                            id={campo}
                            value={dadosUsuario[campo] || ''}
                            onChange={(e) => setDadosUsuario(prev => ({
                              ...prev,
                              [campo]: e.target.value
                            }))}
                            placeholder={`Digite seu ${campo.replace(/_/g, ' ')}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload de documentos - apenas se necessário */}
                  {programa.documentos_aceitos && programa.documentos_aceitos.length > 0 && !programa.documentos_aceitos.includes('N/A') && (
                    <div>
                      <Label>Documentos * (aceitos: {programa.documentos_aceitos.join(', ')})</Label>
                      <div className="mt-2">
                        <Input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files) {
                              setDocumentos(Array.from(e.target.files));
                            }
                          }}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                        />
                      </div>
                      {documentos.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {documentos.map((doc, index) => (
                            <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <Upload className="w-4 h-4" />
                              {doc.name} ({(doc.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <Button 
                    onClick={handleSolicitacao}
                    disabled={uploading}
                    className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[10px]"
                    style={{ backgroundColor: programa.cor_tema }}
                  >
                    {uploading ? "Enviando..." : "Enviar Solicitação"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
        </div>
      </main>
      
      <QuickNav />
      <Footer />
    </div>
  );
}
