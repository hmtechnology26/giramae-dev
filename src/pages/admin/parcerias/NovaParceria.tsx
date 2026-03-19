import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Schemas de validação
const etapa1Schema = z.object({
  org_nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  org_tipo: z.string().min(1, 'Tipo é obrigatório').max(50),
  org_cnpj: z.string().optional(),
  org_responsavel: z.string().min(3, 'Nome do responsável é obrigatório').max(100),
  org_email: z.string().email('Email inválido').max(255),
  org_telefone: z.string().min(10, 'Telefone inválido').max(20),
  org_endereco: z.string().min(5, 'Endereço é obrigatório').max(200),
  org_cidade: z.string().min(2, 'Cidade é obrigatória').max(100),
  org_estado: z.string().length(2, 'Estado deve ter 2 caracteres')
});

const etapa2Schema = z.object({
  prog_nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  prog_descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(500),
  prog_objetivo: z.string().min(10, 'Objetivo deve ter pelo menos 10 caracteres').max(500),
  prog_publico_alvo: z.string().min(5, 'Público-alvo é obrigatório').max(200)
});

const etapa3Schema = z.object({
  valor_mensal: z.number().min(1, 'Valor deve ser maior que 0').max(10000),
  dia_creditacao: z.number().min(1, 'Dia deve estar entre 1 e 28').max(28),
  validade_meses: z.number().min(1, 'Mínimo 1 mês').max(60).optional(),
  criterios_elegibilidade: z.string().min(10, 'Critérios são obrigatórios'),
  documentos_aceitos: z.string().optional(),
  campos_obrigatorios: z.string().optional(),
  instrucoes_usuario: z.string().optional()
});

type Etapa1Form = z.infer<typeof etapa1Schema>;
type Etapa2Form = z.infer<typeof etapa2Schema>;
type Etapa3Form = z.infer<typeof etapa3Schema>;

export default function NovaParceria() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [etapa, setEtapa] = useState(0); // 0 = seleção, 1 = org, 2 = programa, 3 = config
  const [tipoOrganizacao, setTipoOrganizacao] = useState<'nova' | 'existente'>('nova');
  const [organizacaoSelecionada, setOrganizacaoSelecionada] = useState<string>('');
  const [dadosEtapa1, setDadosEtapa1] = useState<Etapa1Form | null>(null);
  const [dadosEtapa2, setDadosEtapa2] = useState<Etapa2Form | null>(null);

  // Buscar organizações existentes
  const { data: organizacoes = [], isLoading: loadingOrgs } = useQuery({
    queryKey: ['organizacoes-ativas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parcerias_organizacoes')
        .select('id, codigo, nome, cidade, estado')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data || [];
    }
  });

  const form1 = useForm<Etapa1Form>({
    resolver: zodResolver(etapa1Schema),
    defaultValues: {
      org_nome: '',
      org_tipo: 'ONG',
      org_cnpj: '',
      org_responsavel: '',
      org_email: '',
      org_telefone: '',
      org_endereco: '',
      org_cidade: '',
      org_estado: ''
    }
  });

  const form2 = useForm<Etapa2Form>({
    resolver: zodResolver(etapa2Schema),
    defaultValues: {
      prog_nome: '',
      prog_descricao: '',
      prog_objetivo: '',
      prog_publico_alvo: ''
    }
  });

  const form3 = useForm<Etapa3Form>({
    resolver: zodResolver(etapa3Schema),
    defaultValues: {
      valor_mensal: 100,
      dia_creditacao: 1,
      validade_meses: 12,
      criterios_elegibilidade: '',
      documentos_aceitos: '',
      campos_obrigatorios: 'nome, cpf, rg',
      instrucoes_usuario: ''
    }
  });

  const criarParceriaMutation = useMutation({
    mutationFn: async (dados: { etapa1: Etapa1Form | null; etapa2: Etapa2Form; etapa3: Etapa3Form; organizacaoId?: string }) => {
      let orgId = dados.organizacaoId;

      // Se não tiver organização ID (nova organização), criar
      if (!orgId && dados.etapa1) {
        const orgCodigo = `ORG_${Date.now()}`;
        
        const { data: org, error: orgError } = await supabase
          .from('parcerias_organizacoes')
          .insert({
            codigo: orgCodigo,
            nome: dados.etapa1.org_nome,
            tipo: dados.etapa1.org_tipo,
            cnpj: dados.etapa1.org_cnpj || null,
            contato_responsavel: dados.etapa1.org_responsavel,
            contato_email: dados.etapa1.org_email,
            contato_telefone: dados.etapa1.org_telefone,
            endereco: dados.etapa1.org_endereco,
            cidade: dados.etapa1.org_cidade,
            estado: dados.etapa1.org_estado,
            ativo: true
          })
          .select()
          .single();

        if (orgError) throw orgError;
        orgId = org.id;
      }

      if (!orgId) throw new Error('ID da organização não encontrado');

      // 2. Criar Programa
      const progCodigo = `PROG_${Date.now()}`;
      const documentosArray = dados.etapa3.documentos_aceitos 
        ? dados.etapa3.documentos_aceitos.split(',').map(d => d.trim()).filter(d => d) 
        : [];
      const camposArray = dados.etapa3.campos_obrigatorios 
        ? dados.etapa3.campos_obrigatorios.split(',').map(c => c.trim()).filter(c => c)
        : [];
      
      // Montar criterios_elegibilidade como texto
      const criteriosTexto = `Objetivo: ${dados.etapa2.prog_objetivo}\n\nPúblico-alvo: ${dados.etapa2.prog_publico_alvo}\n\nCritérios: ${dados.etapa3.criterios_elegibilidade}`;
      
      const { data: programa, error: progError } = await supabase
        .from('parcerias_programas')
        .insert({
          organizacao_id: orgId,
          codigo: progCodigo,
          nome: dados.etapa2.prog_nome,
          descricao: dados.etapa2.prog_descricao,
          valor_mensal: dados.etapa3.valor_mensal,
          dia_creditacao: dados.etapa3.dia_creditacao,
          validade_meses: dados.etapa3.validade_meses || 12,
          criterios_elegibilidade: criteriosTexto,
          campos_obrigatorios: camposArray.length > 0 ? camposArray : null,
          documentos_aceitos: documentosArray.length > 0 ? documentosArray : null,
          instrucoes_usuario: dados.etapa3.instrucoes_usuario || null,
          ativo: true
        })
        .select()
        .single();

      if (progError) throw progError;

      return programa;
    },
    onSuccess: (programa) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-parcerias'] });
      toast({
        title: 'Parceria criada!',
        description: 'A organização e o programa foram criados com sucesso.'
      });
      navigate(`/admin/parcerias/${programa.id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar parceria',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const etapas = tipoOrganizacao === 'nova' 
    ? ['Seleção', 'Dados da Organização', 'Dados do Programa', 'Configurações']
    : ['Seleção', 'Dados do Programa', 'Configurações'];

  const progresso = (etapa / (etapas.length - 1)) * 100;

  const handleSelecao = () => {
    if (tipoOrganizacao === 'existente' && !organizacaoSelecionada) {
      toast({
        title: 'Selecione uma organização',
        description: 'Escolha uma organização existente para continuar.',
        variant: 'destructive'
      });
      return;
    }
    
    if (tipoOrganizacao === 'existente') {
      setEtapa(2); // Pula direto para programa
    } else {
      setEtapa(1); // Vai para dados da organização
    }
  };

  const handleEtapa1 = (data: Etapa1Form) => {
    setDadosEtapa1(data);
    setEtapa(2);
  };

  const handleEtapa2 = (data: Etapa2Form) => {
    setDadosEtapa2(data);
    setEtapa(3);
  };

  const handleEtapa3 = (data: Etapa3Form) => {
    if (!dadosEtapa2) return;
    
    criarParceriaMutation.mutate({
      etapa1: tipoOrganizacao === 'nova' ? dadosEtapa1 : null,
      etapa2: dadosEtapa2,
      etapa3: data,
      organizacaoId: tipoOrganizacao === 'existente' ? organizacaoSelecionada : undefined
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/parcerias')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Nova Parceria</h1>
            <p className="text-muted-foreground">
              Configure uma nova organização e programa social
            </p>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                {etapas.map((nome, idx) => (
                  <span
                    key={idx}
                    className={idx + 1 <= etapa ? 'text-primary font-medium' : 'text-muted-foreground'}
                  >
                    {idx + 1}. {nome}
                  </span>
                ))}
              </div>
              <Progress value={progresso} />
            </div>
          </CardContent>
        </Card>

        {/* Etapa 0: Seleção */}
        {etapa === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Parceria</CardTitle>
              <CardDescription>Escolha se deseja criar uma nova organização ou adicionar um programa a uma organização existente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Escolha uma opção:</Label>
                <RadioGroup value={tipoOrganizacao} onValueChange={(value) => {
                  setTipoOrganizacao(value as 'nova' | 'existente');
                  setOrganizacaoSelecionada('');
                }}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="nova" id="nova" />
                    <Label htmlFor="nova" className="flex-1 cursor-pointer">
                      <div className="font-medium">Nova Organização</div>
                      <div className="text-sm text-muted-foreground">Criar uma nova organização e seu primeiro programa</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="existente" id="existente" />
                    <Label htmlFor="existente" className="flex-1 cursor-pointer">
                      <div className="font-medium">Organização Existente</div>
                      <div className="text-sm text-muted-foreground">Adicionar um novo programa a uma organização já cadastrada</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {tipoOrganizacao === 'existente' && (
                <div className="space-y-2">
                  <Label htmlFor="organizacao">Selecione a Organização</Label>
                  <Select value={organizacaoSelecionada} onValueChange={setOrganizacaoSelecionada}>
                    <SelectTrigger id="organizacao">
                      <SelectValue placeholder="Escolha uma organização..." />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingOrgs ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Carregando organizações...
                        </div>
                      ) : organizacoes.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Nenhuma organização cadastrada
                        </div>
                      ) : (
                        organizacoes.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.nome} - {org.cidade}/{org.estado}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleSelecao}>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 1: Organização */}
        {etapa === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Dados da Organização</CardTitle>
              <CardDescription>Informações sobre a organização parceira</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form1}>
                <form onSubmit={form1.handleSubmit(handleEtapa1)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form1.control}
                      name="org_nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Organização*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Instituto XYZ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form1.control}
                      name="org_tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: ONG, Associação" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form1.control}
                    name="org_cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form1.control}
                    name="org_responsavel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável*</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do responsável" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form1.control}
                      name="org_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email*</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@organizacao.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form1.control}
                      name="org_telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone*</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form1.control}
                    name="org_endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço*</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número, bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form1.control}
                      name="org_cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade*</FormLabel>
                          <FormControl>
                            <Input placeholder="São Paulo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form1.control}
                      name="org_estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado*</FormLabel>
                          <FormControl>
                            <Input placeholder="SP" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      Próximo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Etapa 2: Programa */}
        {etapa === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Dados do Programa</CardTitle>
              <CardDescription>Informações sobre o programa social</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form2}>
                <form onSubmit={form2.handleSubmit(handleEtapa2)} className="space-y-4">
                  <FormField
                    control={form2.control}
                    name="prog_nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Programa*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Apoio Materno" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form2.control}
                    name="prog_descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o programa social..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Mínimo 10 caracteres</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form2.control}
                    name="prog_objetivo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objetivo*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Qual o objetivo do programa?"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form2.control}
                    name="prog_publico_alvo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Público-Alvo*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Mães em situação de vulnerabilidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setEtapa(tipoOrganizacao === 'nova' ? 1 : 0)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                    <Button type="submit">
                      Próximo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Etapa 3: Configurações */}
        {etapa === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Defina os parâmetros do programa</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form3}>
                <form onSubmit={form3.handleSubmit(handleEtapa3)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form3.control}
                      name="valor_mensal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Mensal*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="100"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>Em Girinhas</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form3.control}
                      name="dia_creditacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dia da Creditação*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1}
                              max={28}
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>De 1 a 28</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form3.control}
                      name="validade_meses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Validade (meses)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1}
                              max={60}
                              placeholder="12"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>Padrão: 12 meses</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form3.control}
                    name="criterios_elegibilidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Critérios de Elegibilidade*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ex: Renda familiar até 2 salários mínimos, residir na cidade do programa..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form3.control}
                    name="documentos_aceitos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Documentos Aceitos para Upload (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ex: RG, CPF, Comprovante de Matrícula, Comprovante de Residência"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Documentos que o usuário deverá enviar (separar por vírgula)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form3.control}
                    name="campos_obrigatorios"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campos Obrigatórios do Formulário (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ex: nome, email, telefone, data_nascimento, cpf"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Campos do formulário que serão obrigatórios (separar por vírgula)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form3.control}
                    name="instrucoes_usuario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instruções para o Usuário (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Instruções adicionais para os beneficiários..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setEtapa(2)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                    <Button type="submit" disabled={criarParceriaMutation.isPending}>
                      {criarParceriaMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Criar {tipoOrganizacao === 'nova' ? 'Parceria' : 'Programa'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
