import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, Archive, Ban, Building2, FileText, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Programa } from '@/types/parcerias';

interface TabConfiguracoesProps {
  programa: Programa;
  onUpdatePrograma: (config: Partial<Programa>) => void;
  onUpdateOrganizacao: (params: { organizacaoId: string; data: any }) => void;
}

const organizacaoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  cnpj: z.string().optional(),
  contato_responsavel: z.string().min(3, 'Responsável é obrigatório'),
  contato_email: z.string().email('Email inválido'),
  contato_telefone: z.string().min(10, 'Telefone inválido'),
  endereco: z.string().min(5, 'Endereço é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres')
});

const programaInfoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  criterios_elegibilidade: z.string().min(10, 'Critérios são obrigatórios')
});

const programaConfigSchema = z.object({
  valor_mensal: z.number().min(1, 'Valor deve ser maior que 0'),
  dia_creditacao: z.number().min(1).max(28),
  validade_meses: z.number().min(1).max(60).optional(),
  documentos_aceitos: z.string().optional(),
  campos_obrigatorios: z.string().optional(),
  instrucoes_usuario: z.string().optional()
});

export default function TabConfiguracoes({ programa, onUpdatePrograma, onUpdateOrganizacao }: TabConfiguracoesProps) {
  const { toast } = useToast();
  const organizacao = programa.parcerias_organizacoes;

  // Form 1: Dados da Organização
  const formOrg = useForm<z.infer<typeof organizacaoSchema>>({
    resolver: zodResolver(organizacaoSchema),
    defaultValues: {
      nome: organizacao?.nome || '',
      tipo: organizacao?.tipo || '',
      cnpj: organizacao?.cnpj || '',
      contato_responsavel: organizacao?.contato_responsavel || '',
      contato_email: organizacao?.contato_email || '',
      contato_telefone: organizacao?.contato_telefone || '',
      endereco: organizacao?.endereco || '',
      cidade: organizacao?.cidade || '',
      estado: organizacao?.estado || ''
    }
  });

  // Form 2: Informações do Programa
  const formProgInfo = useForm<z.infer<typeof programaInfoSchema>>({
    resolver: zodResolver(programaInfoSchema),
    defaultValues: {
      nome: programa.nome || '',
      descricao: programa.descricao || '',
      criterios_elegibilidade: programa.criterios_elegibilidade || ''
    }
  });

  // Form 3: Configurações do Programa
  const formProgConfig = useForm<z.infer<typeof programaConfigSchema>>({
    resolver: zodResolver(programaConfigSchema),
    defaultValues: {
      valor_mensal: programa.valor_mensal || programa.valor_credito || 0,
      dia_creditacao: programa.dia_creditacao || 1,
      validade_meses: programa.validade_meses || 12,
      documentos_aceitos: programa.documentos_aceitos?.join(', ') || '',
      campos_obrigatorios: programa.campos_obrigatorios?.join(', ') || '',
      instrucoes_usuario: programa.instrucoes_usuario || ''
    }
  });

  const onSubmitOrg = (values: z.infer<typeof organizacaoSchema>) => {
    if (!organizacao?.id) return;
    onUpdateOrganizacao({
      organizacaoId: organizacao.id,
      data: values
    });
  };

  const onSubmitProgInfo = (values: z.infer<typeof programaInfoSchema>) => {
    onUpdatePrograma(values);
  };

  const onSubmitProgConfig = (values: z.infer<typeof programaConfigSchema>) => {
    const documentosArray = values.documentos_aceitos 
      ? values.documentos_aceitos.split(',').map(d => d.trim()).filter(d => d)
      : [];
    const camposArray = values.campos_obrigatorios
      ? values.campos_obrigatorios.split(',').map(c => c.trim()).filter(c => c)
      : [];
    
    onUpdatePrograma({
      valor_mensal: values.valor_mensal,
      dia_creditacao: values.dia_creditacao,
      validade_meses: values.validade_meses || 12,
      documentos_aceitos: documentosArray.length > 0 ? documentosArray : null,
      campos_obrigatorios: camposArray.length > 0 ? camposArray : null,
      instrucoes_usuario: values.instrucoes_usuario || null
    });
  };

  const handleDesativar = () => {
    onUpdatePrograma({ ativo: false });
    toast({
      title: 'Programa desativado',
      description: 'O programa foi desativado temporariamente.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Seção 1: Dados da Organização */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Dados da Organização</CardTitle>
          </div>
          <CardDescription>
            Informações sobre a organização parceira
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...formOrg}>
            <form onSubmit={formOrg.handleSubmit(onSubmitOrg)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={formOrg.control}
                  name="nome"
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
                  control={formOrg.control}
                  name="tipo"
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
                control={formOrg.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formOrg.control}
                name="contato_responsavel"
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
                  control={formOrg.control}
                  name="contato_email"
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
                  control={formOrg.control}
                  name="contato_telefone"
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
                control={formOrg.control}
                name="endereco"
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
                  control={formOrg.control}
                  name="cidade"
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
                  control={formOrg.control}
                  name="estado"
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

              <Button type="submit" className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salvar Dados da Organização
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* Seção 2: Informações do Programa */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Informações do Programa</CardTitle>
          </div>
          <CardDescription>
            Dados descritivos sobre o programa social
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...formProgInfo}>
            <form onSubmit={formProgInfo.handleSubmit(onSubmitProgInfo)} className="space-y-4">
              <FormField
                control={formProgInfo.control}
                name="nome"
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
                control={formProgInfo.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o programa social..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formProgInfo.control}
                name="criterios_elegibilidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Critérios de Elegibilidade*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ex: Renda familiar até 2 salários mínimos..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salvar Informações do Programa
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* Seção 3: Configurações do Programa */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Configurações do Programa</CardTitle>
          </div>
          <CardDescription>
            Valores, documentos e regras operacionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...formProgConfig}>
            <form onSubmit={formProgConfig.handleSubmit(onSubmitProgConfig)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={formProgConfig.control}
                  name="valor_mensal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Mensal*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Girinhas/mês</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formProgConfig.control}
                  name="dia_creditacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia da Creditação*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          max="28"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Dia do mês (1-28)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formProgConfig.control}
                  name="validade_meses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validade (meses)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          max="60"
                          placeholder="12"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Padrão: 12</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={formProgConfig.control}
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
                    <FormDescription>Documentos que o usuário deverá enviar (separar por vírgula). Deixe em branco se não houver necessidade de upload.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formProgConfig.control}
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
                    <FormDescription>Campos que serão obrigatórios (separar por vírgula)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formProgConfig.control}
                name="instrucoes_usuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções para o Usuário</FormLabel>
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

              <Button type="submit" className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* Zona de Perigo */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam o programa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <Ban className="h-4 w-4 mr-2" />
                  Desativar Programa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Desativar Programa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O programa será temporariamente desativado. Nenhum novo beneficiário poderá se inscrever
                    e as distribuições mensais serão pausadas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDesativar}>
                    Confirmar Desativação
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1 border-destructive text-destructive">
                  <Archive className="h-4 w-4 mr-2" />
                  Arquivar Programa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Arquivar Programa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é permanente. O programa será arquivado e não poderá ser reativado.
                    Todos os dados históricos serão mantidos apenas para consulta.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive">
                    Confirmar Arquivamento
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
