export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      acoes_missoes: {
        Row: {
          ativo: boolean | null
          condicoes: Json | null
          created_at: string | null
          id: string
          missao_id: string | null
          parametros: Json | null
          tipo_evento: string
        }
        Insert: {
          ativo?: boolean | null
          condicoes?: Json | null
          created_at?: string | null
          id?: string
          missao_id?: string | null
          parametros?: Json | null
          tipo_evento: string
        }
        Update: {
          ativo?: boolean | null
          condicoes?: Json | null
          created_at?: string | null
          id?: string
          missao_id?: string | null
          parametros?: Json | null
          tipo_evento?: string
        }
        Relationships: [
          {
            foreignKeyName: "acoes_missoes_missao_id_fkey"
            columns: ["missao_id"]
            isOneToOne: false
            referencedRelation: "missoes"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_actions: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          action_text: string | null
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          sent_by: string | null
          sent_count: number | null
          target_type: string
          target_users: string[] | null
          title: string
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          sent_by?: string | null
          sent_count?: number | null
          target_type: string
          target_users?: string[] | null
          title: string
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          sent_by?: string | null
          sent_count?: number | null
          target_type?: string
          target_users?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_missoes: {
        Row: {
          detalhes: Json | null
          evento: string
          id: string
          missao_id: string | null
          segmento_aplicado: Json | null
          timestamp_evento: string | null
          user_id: string | null
        }
        Insert: {
          detalhes?: Json | null
          evento: string
          id?: string
          missao_id?: string | null
          segmento_aplicado?: Json | null
          timestamp_evento?: string | null
          user_id?: string | null
        }
        Update: {
          detalhes?: Json | null
          evento?: string
          id?: string
          missao_id?: string | null
          segmento_aplicado?: Json | null
          timestamp_evento?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_missoes_missao_id_fkey"
            columns: ["missao_id"]
            isOneToOne: false
            referencedRelation: "missoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_missoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          avaliado_id: string
          avaliador_id: string
          comentario: string | null
          created_at: string
          id: string
          item_id: string
          rating: number
          reserva_id: string
          tipo_avaliacao: string
          updated_at: string
        }
        Insert: {
          avaliado_id: string
          avaliador_id: string
          comentario?: string | null
          created_at?: string
          id?: string
          item_id: string
          rating: number
          reserva_id: string
          tipo_avaliacao: string
          updated_at?: string
        }
        Update: {
          avaliado_id?: string
          avaliador_id?: string
          comentario?: string | null
          created_at?: string
          id?: string
          item_id?: string
          rating?: number
          reserva_id?: string
          tipo_avaliacao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_avaliado_id_fkey"
            columns: ["avaliado_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_aprovados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "avaliacoes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_pendentes_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "avaliacoes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_rejeitados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "avaliacoes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_reportados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "avaliacoes_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          descricao: string | null
          icone: string | null
          nome: string
          ordem: number | null
          updated_at: string | null
          valor_maximo: number | null
          valor_minimo: number | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          nome: string
          ordem?: number | null
          updated_at?: string | null
          valor_maximo?: number | null
          valor_minimo?: number | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          nome?: string
          ordem?: number | null
          updated_at?: string | null
          valor_maximo?: number | null
          valor_minimo?: number | null
        }
        Relationships: []
      }
      categorias_tamanhos: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string | null
          id: string
          idade_maxima_meses: number | null
          idade_minima_meses: number | null
          label_display: string
          ordem: number
          subcategoria: string | null
          tipo_tamanho: string
          valor: string
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string | null
          id?: string
          idade_maxima_meses?: number | null
          idade_minima_meses?: number | null
          label_display: string
          ordem: number
          subcategoria?: string | null
          tipo_tamanho: string
          valor: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string | null
          id?: string
          idade_maxima_meses?: number | null
          idade_minima_meses?: number | null
          label_display?: string
          ordem?: number
          subcategoria?: string | null
          tipo_tamanho?: string
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_categorias_tamanhos_categoria"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["codigo"]
          },
        ]
      }
      cidades_config: {
        Row: {
          cidade: string
          created_at: string
          estado: string
          id: string
          itens_publicados: number
          liberada: boolean
          liberada_em: string | null
          liberada_por: string | null
          notas_admin: string | null
          updated_at: string
          usuarios_aguardando: number
          usuarios_liberados: number
        }
        Insert: {
          cidade: string
          created_at?: string
          estado: string
          id?: string
          itens_publicados?: number
          liberada?: boolean
          liberada_em?: string | null
          liberada_por?: string | null
          notas_admin?: string | null
          updated_at?: string
          usuarios_aguardando?: number
          usuarios_liberados?: number
        }
        Update: {
          cidade?: string
          created_at?: string
          estado?: string
          id?: string
          itens_publicados?: number
          liberada?: boolean
          liberada_em?: string | null
          liberada_por?: string | null
          notas_admin?: string | null
          updated_at?: string
          usuarios_aguardando?: number
          usuarios_liberados?: number
        }
        Relationships: [
          {
            foreignKeyName: "cidades_config_liberada_por_fkey"
            columns: ["liberada_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      config_sistema: {
        Row: {
          chave: string
          valor: Json | null
        }
        Insert: {
          chave: string
          valor?: Json | null
        }
        Update: {
          chave?: string
          valor?: Json | null
        }
        Relationships: []
      }
      conversas_whatsapp_log: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          reserva_id: string
          tipo_usuario: string
          usuario_iniciou: string
          usuario_recebeu: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          reserva_id: string
          tipo_usuario: string
          usuario_iniciou: string
          usuario_recebeu: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          reserva_id?: string
          tipo_usuario?: string
          usuario_iniciou?: string
          usuario_recebeu?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversas_whatsapp_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_whatsapp_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_aprovados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "conversas_whatsapp_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_pendentes_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "conversas_whatsapp_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_rejeitados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "conversas_whatsapp_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_reportados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "conversas_whatsapp_log_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_whatsapp_log_usuario_iniciou_fkey"
            columns: ["usuario_iniciou"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_whatsapp_log_usuario_recebeu_fkey"
            columns: ["usuario_recebeu"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debug_logs: {
        Row: {
          created_at: string | null
          error_details: Json | null
          id: string
          message: string
          operation: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          id?: string
          message: string
          operation: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          id?: string
          message?: string
          operation?: string
          user_id?: string | null
        }
        Relationships: []
      }
      denuncias: {
        Row: {
          analisada_por: string | null
          created_at: string
          data_analise: string | null
          denunciante_id: string
          descricao: string | null
          id: string
          item_id: string
          motivo: string
          observacoes_admin: string | null
          status: string
          updated_at: string
        }
        Insert: {
          analisada_por?: string | null
          created_at?: string
          data_analise?: string | null
          denunciante_id: string
          descricao?: string | null
          id?: string
          item_id: string
          motivo: string
          observacoes_admin?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          analisada_por?: string | null
          created_at?: string
          data_analise?: string | null
          denunciante_id?: string
          descricao?: string | null
          id?: string
          item_id?: string
          motivo?: string
          observacoes_admin?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "denuncias_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "denuncias_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_aprovados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "denuncias_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_pendentes_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "denuncias_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_rejeitados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "denuncias_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_reportados_moderacao"
            referencedColumns: ["item_id"]
          },
        ]
      }
      error_log: {
        Row: {
          created_at: string | null
          error_details: Json | null
          error_message: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          error_message: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          error_message?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      escolas_inep: {
        Row: {
          categoria_administrativa: string | null
          categoria_escola_privada: string | null
          cep: string | null
          codigo_inep: number
          conveniada_poder_publico: string | null
          dependencia_administrativa: string | null
          endereco: string | null
          escola: string | null
          etapas_e_modalidade_de_ensino_oferecidas: string | null
          latitude: string | null
          localidade_diferenciada: string | null
          localizacao: string | null
          longitude: string | null
          municipio: string | null
          outras_ofertas_educacionais: string | null
          porte_da_escola: string | null
          regulamentacao_pelo_conselho_de_educacao: string | null
          restricao_de_atendimento: string | null
          telefone: string | null
          uf: string | null
        }
        Insert: {
          categoria_administrativa?: string | null
          categoria_escola_privada?: string | null
          cep?: string | null
          codigo_inep: number
          conveniada_poder_publico?: string | null
          dependencia_administrativa?: string | null
          endereco?: string | null
          escola?: string | null
          etapas_e_modalidade_de_ensino_oferecidas?: string | null
          latitude?: string | null
          localidade_diferenciada?: string | null
          localizacao?: string | null
          longitude?: string | null
          municipio?: string | null
          outras_ofertas_educacionais?: string | null
          porte_da_escola?: string | null
          regulamentacao_pelo_conselho_de_educacao?: string | null
          restricao_de_atendimento?: string | null
          telefone?: string | null
          uf?: string | null
        }
        Update: {
          categoria_administrativa?: string | null
          categoria_escola_privada?: string | null
          cep?: string | null
          codigo_inep?: number
          conveniada_poder_publico?: string | null
          dependencia_administrativa?: string | null
          endereco?: string | null
          escola?: string | null
          etapas_e_modalidade_de_ensino_oferecidas?: string | null
          latitude?: string | null
          localidade_diferenciada?: string | null
          localizacao?: string | null
          longitude?: string | null
          municipio?: string | null
          outras_ofertas_educacionais?: string | null
          porte_da_escola?: string | null
          regulamentacao_pelo_conselho_de_educacao?: string | null
          restricao_de_atendimento?: string | null
          telefone?: string | null
          uf?: string | null
        }
        Relationships: []
      }
      estados_conservacao: {
        Row: {
          ativo: boolean | null
          codigo: string
          descricao: string | null
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          descricao?: string | null
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          descricao?: string | null
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      extensoes_validade: {
        Row: {
          created_at: string | null
          custo_extensao: number
          data_expiracao_nova: string
          data_expiracao_original: string
          dias_adicionados: number
          id: string
          ledger_transfer_id: string | null
          transacao_id: string
          user_id: string
          valor_original: number
        }
        Insert: {
          created_at?: string | null
          custo_extensao: number
          data_expiracao_nova: string
          data_expiracao_original: string
          dias_adicionados: number
          id?: string
          ledger_transfer_id?: string | null
          transacao_id: string
          user_id: string
          valor_original: number
        }
        Update: {
          created_at?: string | null
          custo_extensao?: number
          data_expiracao_nova?: string
          data_expiracao_original?: string
          dias_adicionados?: number
          id?: string
          ledger_transfer_id?: string | null
          transacao_id?: string
          user_id?: string
          valor_original?: number
        }
        Relationships: [
          {
            foreignKeyName: "extensoes_validade_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          created_at: string
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_aprovados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "favoritos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_pendentes_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "favoritos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_rejeitados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "favoritos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_reportados_moderacao"
            referencedColumns: ["item_id"]
          },
        ]
      }
      fila_dead_letter: {
        Row: {
          criado_em: string | null
          id: number
          item_id: string
          metadados: Json | null
          reserva_id: string
          tentativas_finais: number | null
          tipo_operacao: string
          ultimo_erro: string | null
        }
        Insert: {
          criado_em?: string | null
          id?: number
          item_id: string
          metadados?: Json | null
          reserva_id: string
          tentativas_finais?: number | null
          tipo_operacao: string
          ultimo_erro?: string | null
        }
        Update: {
          criado_em?: string | null
          id?: number
          item_id?: string
          metadados?: Json | null
          reserva_id?: string
          tentativas_finais?: number | null
          tipo_operacao?: string
          ultimo_erro?: string | null
        }
        Relationships: []
      }
      fila_espera: {
        Row: {
          created_at: string
          id: string
          item_id: string
          posicao: number
          updated_at: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          posicao: number
          updated_at?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          posicao?: number
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fila_espera_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fila_espera_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_aprovados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "fila_espera_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_pendentes_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "fila_espera_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_rejeitados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "fila_espera_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_reportados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "fila_espera_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fila_processamento: {
        Row: {
          criado_em: string | null
          erro_mensagem: string | null
          id: number
          item_id: string
          lease_expira: string | null
          max_tentativas: number | null
          metadados: Json | null
          processado_em: string | null
          reserva_id: string
          status: number | null
          tentativas: number | null
          tipo_operacao: string
        }
        Insert: {
          criado_em?: string | null
          erro_mensagem?: string | null
          id?: number
          item_id: string
          lease_expira?: string | null
          max_tentativas?: number | null
          metadados?: Json | null
          processado_em?: string | null
          reserva_id: string
          status?: number | null
          tentativas?: number | null
          tipo_operacao: string
        }
        Update: {
          criado_em?: string | null
          erro_mensagem?: string | null
          id?: number
          item_id?: string
          lease_expira?: string | null
          max_tentativas?: number | null
          metadados?: Json | null
          processado_em?: string | null
          reserva_id?: string
          status?: number | null
          tentativas?: number | null
          tipo_operacao?: string
        }
        Relationships: []
      }
      filhos: {
        Row: {
          created_at: string
          data_nascimento: string
          escola_id: number | null
          id: string
          mae_id: string
          nome: string
          sexo: string | null
          tamanho_calcados: string | null
          tamanho_roupas: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_nascimento: string
          escola_id?: number | null
          id?: string
          mae_id: string
          nome: string
          sexo?: string | null
          tamanho_calcados?: string | null
          tamanho_roupas?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_nascimento?: string
          escola_id?: number | null
          id?: string
          mae_id?: string
          nome?: string
          sexo?: string | null
          tamanho_calcados?: string | null
          tamanho_roupas?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "filhos_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_inep"
            referencedColumns: ["codigo_inep"]
          },
          {
            foreignKeyName: "filhos_mae_id_fkey"
            columns: ["mae_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      generos: {
        Row: {
          ativo: boolean | null
          codigo: string
          icone: string | null
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          icone?: string | null
          nome: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          icone?: string | null
          nome?: string
        }
        Relationships: []
      }
      indicacoes: {
        Row: {
          bonus_cadastro_indicado_pago: boolean | null
          bonus_cadastro_pago: boolean | null
          bonus_primeira_compra_pago: boolean | null
          bonus_primeiro_item_pago: boolean | null
          created_at: string
          data_bonus_cadastro_indicado_pago: string | null
          data_cadastro_indicado: string | null
          data_primeira_compra: string | null
          data_primeiro_item: string | null
          id: string
          indicado_id: string
          indicador_id: string
        }
        Insert: {
          bonus_cadastro_indicado_pago?: boolean | null
          bonus_cadastro_pago?: boolean | null
          bonus_primeira_compra_pago?: boolean | null
          bonus_primeiro_item_pago?: boolean | null
          created_at?: string
          data_bonus_cadastro_indicado_pago?: string | null
          data_cadastro_indicado?: string | null
          data_primeira_compra?: string | null
          data_primeiro_item?: string | null
          id?: string
          indicado_id: string
          indicador_id: string
        }
        Update: {
          bonus_cadastro_indicado_pago?: boolean | null
          bonus_cadastro_pago?: boolean | null
          bonus_primeira_compra_pago?: boolean | null
          bonus_primeiro_item_pago?: boolean | null
          created_at?: string
          data_bonus_cadastro_indicado_pago?: string | null
          data_cadastro_indicado?: string | null
          data_primeira_compra?: string | null
          data_primeiro_item?: string | null
          id?: string
          indicado_id?: string
          indicador_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "indicacoes_indicado_id_fkey"
            columns: ["indicado_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicacoes_indicador_id_fkey"
            columns: ["indicador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      itens: {
        Row: {
          categoria: string
          codigo_unico: string
          created_at: string
          descricao: string
          estado_conservacao: string
          fotos: string[] | null
          genero: string | null
          id: string
          publicado_por: string
          status: string
          subcategoria: string | null
          tamanho_categoria: string | null
          tamanho_valor: string | null
          titulo: string
          updated_at: string
          valor_girinhas: number
        }
        Insert: {
          categoria: string
          codigo_unico: string
          created_at?: string
          descricao: string
          estado_conservacao: string
          fotos?: string[] | null
          genero?: string | null
          id?: string
          publicado_por: string
          status?: string
          subcategoria?: string | null
          tamanho_categoria?: string | null
          tamanho_valor?: string | null
          titulo: string
          updated_at?: string
          valor_girinhas: number
        }
        Update: {
          categoria?: string
          codigo_unico?: string
          created_at?: string
          descricao?: string
          estado_conservacao?: string
          fotos?: string[] | null
          genero?: string | null
          id?: string
          publicado_por?: string
          status?: string
          subcategoria?: string | null
          tamanho_categoria?: string | null
          tamanho_valor?: string | null
          titulo?: string
          updated_at?: string
          valor_girinhas?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_itens_categoria"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "fk_itens_estado_conservacao"
            columns: ["estado_conservacao"]
            isOneToOne: false
            referencedRelation: "estados_conservacao"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "fk_itens_genero"
            columns: ["genero"]
            isOneToOne: false
            referencedRelation: "generos"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "itens_publicado_por_fkey"
            columns: ["publicado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jornadas_definicoes: {
        Row: {
          acao_validacao: string | null
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          descricao: string
          icone: string | null
          id: string
          ordem: number | null
          recompensa_girinhas: number | null
          rota_destino: string | null
          steps: Json | null
          tipo: string | null
          titulo: string
          tour_id: string | null
        }
        Insert: {
          acao_validacao?: string | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao: string
          icone?: string | null
          id: string
          ordem?: number | null
          recompensa_girinhas?: number | null
          rota_destino?: string | null
          steps?: Json | null
          tipo?: string | null
          titulo: string
          tour_id?: string | null
        }
        Update: {
          acao_validacao?: string | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string
          icone?: string | null
          id?: string
          ordem?: number | null
          recompensa_girinhas?: number | null
          rota_destino?: string | null
          steps?: Json | null
          tipo?: string | null
          titulo?: string
          tour_id?: string | null
        }
        Relationships: []
      }
      jornadas_progresso: {
        Row: {
          concluida: boolean | null
          created_at: string | null
          data_conclusao: string | null
          id: string
          jornada_id: string
          recompensa_coletada: boolean | null
          user_id: string
        }
        Insert: {
          concluida?: boolean | null
          created_at?: string | null
          data_conclusao?: string | null
          id?: string
          jornada_id: string
          recompensa_coletada?: boolean | null
          user_id: string
        }
        Update: {
          concluida?: boolean | null
          created_at?: string | null
          data_conclusao?: string | null
          id?: string
          jornada_id?: string
          recompensa_coletada?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jornadas_progresso_jornada_id_fkey"
            columns: ["jornada_id"]
            isOneToOne: false
            referencedRelation: "jornadas_definicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_functions_count: {
        Row: {
          count: number | null
        }
        Insert: {
          count?: number | null
        }
        Update: {
          count?: number | null
        }
        Relationships: []
      }
      ledger_tables_count: {
        Row: {
          count: number | null
        }
        Insert: {
          count?: number | null
        }
        Update: {
          count?: number | null
        }
        Relationships: []
      }
      limites_avaliacoes_usuarios: {
        Row: {
          created_at: string | null
          id: string
          limite_maximo: number | null
          periodo_inicio: string | null
          proximo_reset: string | null
          total_avaliacoes_bonificadas: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          limite_maximo?: number | null
          periodo_inicio?: string | null
          proximo_reset?: string | null
          total_avaliacoes_bonificadas?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          limite_maximo?: number | null
          periodo_inicio?: string | null
          proximo_reset?: string | null
          total_avaliacoes_bonificadas?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "limites_avaliacoes_usuarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      limites_missoes_usuarios: {
        Row: {
          created_at: string | null
          id: string
          limite_maximo: number | null
          periodo_inicio: string | null
          proximo_reset: string | null
          total_girinhas_coletadas: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          limite_maximo?: number | null
          periodo_inicio?: string | null
          proximo_reset?: string | null
          total_girinhas_coletadas?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          limite_maximo?: number | null
          periodo_inicio?: string | null
          proximo_reset?: string | null
          total_girinhas_coletadas?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      log_cadastro_status: {
        Row: {
          alterado_em: string
          id: number
          status_anterior: string | null
          status_novo: string
          user_id: string
        }
        Insert: {
          alterado_em?: string
          id?: number
          status_anterior?: string | null
          status_novo: string
          user_id: string
        }
        Update: {
          alterado_em?: string
          id?: number
          status_anterior?: string | null
          status_novo?: string
          user_id?: string
        }
        Relationships: []
      }
      media_backup: {
        Row: {
          coluna: string
          created_at: string
          id: number
          registro_id: string
          tabela: string
          valor_original: string
        }
        Insert: {
          coluna: string
          created_at?: string
          id?: number
          registro_id: string
          tabela: string
          valor_original: string
        }
        Update: {
          coluna?: string
          created_at?: string
          id?: number
          registro_id?: string
          tabela?: string
          valor_original?: string
        }
        Relationships: []
      }
      metas_usuarios: {
        Row: {
          conquistado: boolean | null
          created_at: string
          data_conquista: string | null
          girinhas_bonus: number
          id: string
          tipo_meta: string
          trocas_necessarias: number
          trocas_realizadas: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conquistado?: boolean | null
          created_at?: string
          data_conquista?: string | null
          girinhas_bonus: number
          id?: string
          tipo_meta: string
          trocas_necessarias: number
          trocas_realizadas?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conquistado?: boolean | null
          created_at?: string
          data_conquista?: string | null
          girinhas_bonus?: number
          id?: string
          tipo_meta?: string
          trocas_necessarias?: number
          trocas_realizadas?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      missoes: {
        Row: {
          acoes_eventos: Json | null
          ativo: boolean | null
          categoria: string
          condicoes: Json
          configuracao_temporal: Json | null
          created_at: string | null
          criterios_segmentacao: Json | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string
          icone: string | null
          id: string
          limite_por_usuario: number | null
          prazo_dias: number | null
          recompensa_girinhas: number
          tipo_missao: string
          titulo: string
          updated_at: string | null
          usuarios_elegíveis_cache: number | null
          validade_recompensa_meses: number | null
        }
        Insert: {
          acoes_eventos?: Json | null
          ativo?: boolean | null
          categoria: string
          condicoes: Json
          configuracao_temporal?: Json | null
          created_at?: string | null
          criterios_segmentacao?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao: string
          icone?: string | null
          id?: string
          limite_por_usuario?: number | null
          prazo_dias?: number | null
          recompensa_girinhas: number
          tipo_missao: string
          titulo: string
          updated_at?: string | null
          usuarios_elegíveis_cache?: number | null
          validade_recompensa_meses?: number | null
        }
        Update: {
          acoes_eventos?: Json | null
          ativo?: boolean | null
          categoria?: string
          condicoes?: Json
          configuracao_temporal?: Json | null
          created_at?: string | null
          criterios_segmentacao?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string
          icone?: string | null
          id?: string
          limite_por_usuario?: number | null
          prazo_dias?: number | null
          recompensa_girinhas?: number
          tipo_missao?: string
          titulo?: string
          updated_at?: string | null
          usuarios_elegíveis_cache?: number | null
          validade_recompensa_meses?: number | null
        }
        Relationships: []
      }
      missoes_usuarios: {
        Row: {
          created_at: string | null
          data_coletada: string | null
          data_completada: string | null
          data_expiracao: string | null
          data_inicio: string | null
          id: string
          missao_id: string
          progresso_atual: number | null
          progresso_necessario: number
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_coletada?: string | null
          data_completada?: string | null
          data_expiracao?: string | null
          data_inicio?: string | null
          id?: string
          missao_id: string
          progresso_atual?: number | null
          progresso_necessario: number
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_coletada?: string | null
          data_completada?: string | null
          data_expiracao?: string | null
          data_inicio?: string | null
          id?: string
          missao_id?: string
          progresso_atual?: number | null
          progresso_necessario?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "missoes_usuarios_missao_id_fkey"
            columns: ["missao_id"]
            isOneToOne: false
            referencedRelation: "missoes"
            referencedColumns: ["id"]
          },
        ]
      }
      moderacao_itens: {
        Row: {
          comentario_predefinido: string | null
          created_at: string | null
          denuncia_aceita: boolean | null
          denuncia_id: string | null
          id: string
          item_id: string
          moderado_em: string | null
          moderador_id: string | null
          observacoes: string | null
          status: string
        }
        Insert: {
          comentario_predefinido?: string | null
          created_at?: string | null
          denuncia_aceita?: boolean | null
          denuncia_id?: string | null
          id?: string
          item_id: string
          moderado_em?: string | null
          moderador_id?: string | null
          observacoes?: string | null
          status?: string
        }
        Update: {
          comentario_predefinido?: string | null
          created_at?: string | null
          denuncia_aceita?: boolean | null
          denuncia_id?: string | null
          id?: string
          item_id?: string
          moderado_em?: string | null
          moderador_id?: string | null
          observacoes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderacao_itens_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderacao_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderacao_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "itens_aprovados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "moderacao_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "itens_pendentes_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "moderacao_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "itens_rejeitados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "moderacao_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "itens_reportados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "moderacao_itens_moderador_id_fkey"
            columns: ["moderador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      motivos_cancelamento: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          descricao: string | null
          id: number
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          descricao?: string | null
          id?: number
          nome: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          id?: number
          nome?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          canal: string
          created_at: string | null
          dados_envio: Json | null
          erro_mensagem: string | null
          id: string
          status: string
          template_tipo: string
          user_id: string | null
        }
        Insert: {
          canal: string
          created_at?: string | null
          dados_envio?: Json | null
          erro_mensagem?: string | null
          id?: string
          status: string
          template_tipo: string
          user_id?: string | null
        }
        Update: {
          canal?: string
          created_at?: string | null
          dados_envio?: Json | null
          erro_mensagem?: string | null
          id?: string
          status?: string
          template_tipo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          ativo: boolean | null
          corpo: string
          created_at: string | null
          id: string
          tipo: string
          titulo: string
          updated_at: string | null
          variaveis: Json | null
        }
        Insert: {
          ativo?: boolean | null
          corpo: string
          created_at?: string | null
          id?: string
          tipo: string
          titulo: string
          updated_at?: string | null
          variaveis?: Json | null
        }
        Update: {
          ativo?: boolean | null
          corpo?: string
          created_at?: string | null
          id?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
          variaveis?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parcerias_historico_creditos: {
        Row: {
          created_at: string | null
          data_creditacao: string | null
          data_expiracao: string | null
          expirado: boolean | null
          id: string
          mes_referencia: string
          processamento_id: string | null
          programa_id: string | null
          user_id: string | null
          validacao_id: string | null
          valor_creditado: number
        }
        Insert: {
          created_at?: string | null
          data_creditacao?: string | null
          data_expiracao?: string | null
          expirado?: boolean | null
          id?: string
          mes_referencia: string
          processamento_id?: string | null
          programa_id?: string | null
          user_id?: string | null
          validacao_id?: string | null
          valor_creditado: number
        }
        Update: {
          created_at?: string | null
          data_creditacao?: string | null
          data_expiracao?: string | null
          expirado?: boolean | null
          id?: string
          mes_referencia?: string
          processamento_id?: string | null
          programa_id?: string | null
          user_id?: string | null
          validacao_id?: string | null
          valor_creditado?: number
        }
        Relationships: [
          {
            foreignKeyName: "parcerias_historico_creditos_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "parcerias_programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcerias_historico_creditos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcerias_historico_creditos_validacao_id_fkey"
            columns: ["validacao_id"]
            isOneToOne: false
            referencedRelation: "parcerias_usuarios_validacao"
            referencedColumns: ["id"]
          },
        ]
      }
      parcerias_logs_processamento: {
        Row: {
          executado_em: string | null
          funcao_executada: string
          id: string
          mes_referencia: string
          programa_id: string | null
          resultado: Json | null
          tempo_execucao_ms: number | null
          usuarios_com_erro: number | null
          usuarios_processados: number | null
        }
        Insert: {
          executado_em?: string | null
          funcao_executada: string
          id?: string
          mes_referencia: string
          programa_id?: string | null
          resultado?: Json | null
          tempo_execucao_ms?: number | null
          usuarios_com_erro?: number | null
          usuarios_processados?: number | null
        }
        Update: {
          executado_em?: string | null
          funcao_executada?: string
          id?: string
          mes_referencia?: string
          programa_id?: string | null
          resultado?: Json | null
          tempo_execucao_ms?: number | null
          usuarios_com_erro?: number | null
          usuarios_processados?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parcerias_logs_processamento_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "parcerias_programas"
            referencedColumns: ["id"]
          },
        ]
      }
      parcerias_organizacoes: {
        Row: {
          ativo: boolean | null
          cidade: string | null
          cnpj: string | null
          codigo: string
          contato_email: string | null
          contato_responsavel: string | null
          contato_telefone: string | null
          created_at: string | null
          endereco: string | null
          estado: string | null
          id: string
          logo_url: string | null
          nome: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cidade?: string | null
          cnpj?: string | null
          codigo: string
          contato_email?: string | null
          contato_responsavel?: string | null
          contato_telefone?: string | null
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cidade?: string | null
          cnpj?: string | null
          codigo?: string
          contato_email?: string | null
          contato_responsavel?: string | null
          contato_telefone?: string | null
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      parcerias_programas: {
        Row: {
          ativo: boolean | null
          campos_obrigatorios: string[] | null
          codigo: string
          cor_tema: string | null
          created_at: string | null
          criterios_elegibilidade: string | null
          descricao: string | null
          dia_creditacao: number | null
          documentos_aceitos: string[] | null
          icone: string | null
          id: string
          instrucoes_usuario: string | null
          nome: string
          organizacao_id: string | null
          regex_validacao: Json | null
          updated_at: string | null
          validade_meses: number | null
          valor_mensal: number
        }
        Insert: {
          ativo?: boolean | null
          campos_obrigatorios?: string[] | null
          codigo: string
          cor_tema?: string | null
          created_at?: string | null
          criterios_elegibilidade?: string | null
          descricao?: string | null
          dia_creditacao?: number | null
          documentos_aceitos?: string[] | null
          icone?: string | null
          id?: string
          instrucoes_usuario?: string | null
          nome: string
          organizacao_id?: string | null
          regex_validacao?: Json | null
          updated_at?: string | null
          validade_meses?: number | null
          valor_mensal?: number
        }
        Update: {
          ativo?: boolean | null
          campos_obrigatorios?: string[] | null
          codigo?: string
          cor_tema?: string | null
          created_at?: string | null
          criterios_elegibilidade?: string | null
          descricao?: string | null
          dia_creditacao?: number | null
          documentos_aceitos?: string[] | null
          icone?: string | null
          id?: string
          instrucoes_usuario?: string | null
          nome?: string
          organizacao_id?: string | null
          regex_validacao?: Json | null
          updated_at?: string | null
          validade_meses?: number | null
          valor_mensal?: number
        }
        Relationships: [
          {
            foreignKeyName: "parcerias_programas_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "parcerias_organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      parcerias_usuarios_validacao: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          dados_usuario: Json
          data_solicitacao: string | null
          data_validacao: string | null
          documentos: Json
          id: string
          motivo_rejeicao: string | null
          programa_id: string | null
          status: string | null
          total_creditos_recebidos: number | null
          ultima_creditacao: string | null
          updated_at: string | null
          user_id: string | null
          validado_por: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          dados_usuario: Json
          data_solicitacao?: string | null
          data_validacao?: string | null
          documentos?: Json
          id?: string
          motivo_rejeicao?: string | null
          programa_id?: string | null
          status?: string | null
          total_creditos_recebidos?: number | null
          ultima_creditacao?: string | null
          updated_at?: string | null
          user_id?: string | null
          validado_por?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          dados_usuario?: Json
          data_solicitacao?: string | null
          data_validacao?: string | null
          documentos?: Json
          id?: string
          motivo_rejeicao?: string | null
          programa_id?: string | null
          status?: string | null
          total_creditos_recebidos?: number | null
          ultima_creditacao?: string | null
          updated_at?: string | null
          user_id?: string | null
          validado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parcerias_usuarios_validacao_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "parcerias_programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcerias_usuarios_validacao_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcerias_usuarios_validacao_validado_por_fkey"
            columns: ["validado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      penalidades_usuario: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          expira_em: string | null
          id: string
          motivo: string | null
          nivel: number | null
          tipo: string
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          expira_em?: string | null
          id?: string
          motivo?: string | null
          nivel?: number | null
          tipo: string
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          expira_em?: string | null
          id?: string
          motivo?: string | null
          nivel?: number | null
          tipo?: string
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "penalidades_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      preserved_user_id: {
        Row: {
          id: string | null
        }
        Insert: {
          id?: string | null
        }
        Update: {
          id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aceita_entrega_domicilio: boolean | null
          avatar_url: string | null
          bairro: string | null
          bio: string | null
          cadastro_status: string | null
          cadastro_step: string | null
          categorias_favoritas: string[] | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string | null
          dados_segmentacao: Json | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          instagram: string | null
          interesses: string[] | null
          jornada_ativa: boolean | null
          latitude: number | null
          longitude: number | null
          nome: string | null
          numero: string | null
          numero_whatsapp: string | null
          politica_aceita: boolean | null
          politica_aceita_em: string | null
          ponto_referencia: string | null
          ponto_retirada_preferido: string | null
          profissao: string | null
          raio_entrega_km: number | null
          reputacao: number | null
          ritual_completo: boolean | null
          sobrenome: string | null
          telefone: string | null
          telefone_verificado: boolean | null
          termos_aceitos: boolean | null
          termos_aceitos_em: string | null
          ultima_atividade: string | null
          ultimo_calculo_cotacao: string | null
          updated_at: string | null
          username: string
          verification_code: string | null
          verification_code_expires: string | null
        }
        Insert: {
          aceita_entrega_domicilio?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          bio?: string | null
          cadastro_status?: string | null
          cadastro_step?: string | null
          categorias_favoritas?: string[] | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          dados_segmentacao?: Json | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id: string
          instagram?: string | null
          interesses?: string[] | null
          jornada_ativa?: boolean | null
          latitude?: number | null
          longitude?: number | null
          nome?: string | null
          numero?: string | null
          numero_whatsapp?: string | null
          politica_aceita?: boolean | null
          politica_aceita_em?: string | null
          ponto_referencia?: string | null
          ponto_retirada_preferido?: string | null
          profissao?: string | null
          raio_entrega_km?: number | null
          reputacao?: number | null
          ritual_completo?: boolean | null
          sobrenome?: string | null
          telefone?: string | null
          telefone_verificado?: boolean | null
          termos_aceitos?: boolean | null
          termos_aceitos_em?: string | null
          ultima_atividade?: string | null
          ultimo_calculo_cotacao?: string | null
          updated_at?: string | null
          username: string
          verification_code?: string | null
          verification_code_expires?: string | null
        }
        Update: {
          aceita_entrega_domicilio?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          bio?: string | null
          cadastro_status?: string | null
          cadastro_step?: string | null
          categorias_favoritas?: string[] | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          dados_segmentacao?: Json | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          instagram?: string | null
          interesses?: string[] | null
          jornada_ativa?: boolean | null
          latitude?: number | null
          longitude?: number | null
          nome?: string | null
          numero?: string | null
          numero_whatsapp?: string | null
          politica_aceita?: boolean | null
          politica_aceita_em?: string | null
          ponto_referencia?: string | null
          ponto_retirada_preferido?: string | null
          profissao?: string | null
          raio_entrega_km?: number | null
          reputacao?: number | null
          ritual_completo?: boolean | null
          sobrenome?: string | null
          telefone?: string | null
          telefone_verificado?: boolean | null
          termos_aceitos?: boolean | null
          termos_aceitos_em?: string | null
          ultima_atividade?: string | null
          ultimo_calculo_cotacao?: string | null
          updated_at?: string | null
          username?: string
          verification_code?: string | null
          verification_code_expires?: string | null
        }
        Relationships: []
      }
      recompensas_missoes: {
        Row: {
          data_coleta: string | null
          data_expiracao_girinhas: string | null
          girinhas_recebidas: number
          id: string
          missao_id: string
          transacao_id: string | null
          user_id: string
        }
        Insert: {
          data_coleta?: string | null
          data_expiracao_girinhas?: string | null
          girinhas_recebidas: number
          id?: string
          missao_id: string
          transacao_id?: string | null
          user_id: string
        }
        Update: {
          data_coleta?: string | null
          data_expiracao_girinhas?: string | null
          girinhas_recebidas?: number
          id?: string
          missao_id?: string
          transacao_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recompensas_missoes_missao_id_fkey"
            columns: ["missao_id"]
            isOneToOne: false
            referencedRelation: "missoes"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas: {
        Row: {
          cancelada_em: string | null
          cancelada_por: string | null
          codigo_confirmacao: string | null
          created_at: string
          data_reserva: string
          id: string
          item_id: string
          ledger_transfer_id: string | null
          localizacao_combinada: string | null
          motivo_cancelamento: string | null
          observacoes_cancelamento: string | null
          prazo_expiracao: string
          status: string
          updated_at: string
          usuario_item: string
          usuario_reservou: string
          valor_girinhas: number
          valor_taxa: number
          valor_total: number
        }
        Insert: {
          cancelada_em?: string | null
          cancelada_por?: string | null
          codigo_confirmacao?: string | null
          created_at?: string
          data_reserva?: string
          id?: string
          item_id: string
          ledger_transfer_id?: string | null
          localizacao_combinada?: string | null
          motivo_cancelamento?: string | null
          observacoes_cancelamento?: string | null
          prazo_expiracao?: string
          status?: string
          updated_at?: string
          usuario_item: string
          usuario_reservou: string
          valor_girinhas: number
          valor_taxa?: number
          valor_total?: number
        }
        Update: {
          cancelada_em?: string | null
          cancelada_por?: string | null
          codigo_confirmacao?: string | null
          created_at?: string
          data_reserva?: string
          id?: string
          item_id?: string
          ledger_transfer_id?: string | null
          localizacao_combinada?: string | null
          motivo_cancelamento?: string | null
          observacoes_cancelamento?: string | null
          prazo_expiracao?: string
          status?: string
          updated_at?: string
          usuario_item?: string
          usuario_reservou?: string
          valor_girinhas?: number
          valor_taxa?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservas_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_aprovados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "reservas_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_pendentes_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "reservas_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_rejeitados_moderacao"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "reservas_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_reportados_moderacao"
            referencedColumns: ["item_id"]
          },
        ]
      }
      reservation_cancel_metrics: {
        Row: {
          dt: string
          motivo: string
          total: number
        }
        Insert: {
          dt: string
          motivo: string
          total?: number
        }
        Update: {
          dt?: string
          motivo?: string
          total?: number
        }
        Relationships: []
      }
      seguidores: {
        Row: {
          created_at: string
          id: string
          seguido_id: string
          seguidor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          seguido_id: string
          seguidor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          seguido_id?: string
          seguidor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seguidores_seguido_id_fkey"
            columns: ["seguido_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguidores_seguidor_id_fkey"
            columns: ["seguidor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategorias: {
        Row: {
          ativo: boolean | null
          categoria_pai: string
          created_at: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_pai: string
          created_at?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          categoria_pai?: string
          created_at?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_subcategorias_categoria"
            columns: ["categoria_pai"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["codigo"]
          },
        ]
      }
      templates_segmentacao: {
        Row: {
          created_at: string | null
          criado_por: string | null
          criterios: Json
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
          uso_count: number | null
        }
        Insert: {
          created_at?: string | null
          criado_por?: string | null
          criterios: Json
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          uso_count?: number | null
        }
        Update: {
          created_at?: string | null
          criado_por?: string | null
          criterios?: Json
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          uso_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_segmentacao_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transacao_config: {
        Row: {
          ativo: boolean | null
          categoria: string
          config: Json | null
          cor_hex: string | null
          created_at: string | null
          descricao_pt: string
          icone: string | null
          ordem_exibicao: number | null
          prorrogavel: boolean
          sinal: number
          tipo: string
          transferivel: boolean | null
          updated_at: string | null
          validade_dias: number | null
          valor_padrao: number | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          config?: Json | null
          cor_hex?: string | null
          created_at?: string | null
          descricao_pt: string
          icone?: string | null
          ordem_exibicao?: number | null
          prorrogavel?: boolean
          sinal: number
          tipo: string
          transferivel?: boolean | null
          updated_at?: string | null
          validade_dias?: number | null
          valor_padrao?: number | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          config?: Json | null
          cor_hex?: string | null
          created_at?: string | null
          descricao_pt?: string
          icone?: string | null
          ordem_exibicao?: number | null
          prorrogavel?: boolean
          sinal?: number
          tipo?: string
          transferivel?: boolean | null
          updated_at?: string | null
          validade_dias?: number | null
          valor_padrao?: number | null
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          apelido: string
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string
          endereco: string | null
          estado: string | null
          id: string
          ponto_referencia: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          apelido: string
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          ponto_referencia?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          apelido?: string
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          ponto_referencia?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_instagram_verifications: {
        Row: {
          connected_at: string | null
          connection_proof_url: string | null
          created_at: string | null
          id: string
          instagram_user_id: string | null
          instagram_username: string | null
          rejection_reason: string | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          connected_at?: string | null
          connection_proof_url?: string | null
          created_at?: string | null
          id?: string
          instagram_user_id?: string | null
          instagram_username?: string | null
          rejection_reason?: string | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          connected_at?: string | null
          connection_proof_url?: string | null
          created_at?: string | null
          id?: string
          instagram_user_id?: string | null
          instagram_username?: string | null
          rejection_reason?: string | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          girinhas: boolean | null
          id: string
          mensagens: boolean | null
          push_enabled: boolean | null
          push_subscription: Json | null
          reservas: boolean | null
          sistema: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          girinhas?: boolean | null
          id?: string
          mensagens?: boolean | null
          push_enabled?: boolean | null
          push_subscription?: Json | null
          reservas?: boolean | null
          sistema?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          girinhas?: boolean | null
          id?: string
          mensagens?: boolean | null
          push_enabled?: boolean | null
          push_subscription?: Json | null
          reservas?: boolean | null
          sistema?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_config_bonus: {
        Row: {
          descricao_pt: string | null
          validade_dias: number | null
          valor_padrao: number | null
        }
        Insert: {
          descricao_pt?: string | null
          validade_dias?: number | null
          valor_padrao?: number | null
        }
        Update: {
          descricao_pt?: string | null
          validade_dias?: number | null
          valor_padrao?: number | null
        }
        Relationships: []
      }
      v_reserva: {
        Row: {
          codigo_confirmacao: string | null
          created_at: string | null
          data_reserva: string | null
          id: string | null
          item_id: string | null
          localizacao_combinada: string | null
          prazo_expiracao: string | null
          status: string | null
          updated_at: string | null
          usuario_item: string | null
          usuario_reservou: string | null
          valor_girinhas: number | null
          valor_taxa: number | null
          valor_total: number | null
        }
        Insert: {
          codigo_confirmacao?: string | null
          created_at?: string | null
          data_reserva?: string | null
          id?: string | null
          item_id?: string | null
          localizacao_combinada?: string | null
          prazo_expiracao?: string | null
          status?: string | null
          updated_at?: string | null
          usuario_item?: string | null
          usuario_reservou?: string | null
          valor_girinhas?: number | null
          valor_taxa?: number | null
          valor_total?: number | null
        }
        Update: {
          codigo_confirmacao?: string | null
          created_at?: string | null
          data_reserva?: string | null
          id?: string | null
          item_id?: string | null
          localizacao_combinada?: string | null
          prazo_expiracao?: string | null
          status?: string | null
          updated_at?: string | null
          usuario_item?: string | null
          usuario_reservou?: string | null
          valor_girinhas?: number | null
          valor_taxa?: number | null
          valor_total?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      estatisticas_sistema: {
        Row: {
          denuncias_ativas: number | null
          itens_pendentes: number | null
          itens_publicados_hoje: number | null
          penalidades_ativas: number | null
          reservas_hoje: number | null
          total_usuarios: number | null
          usuarios_ativos: number | null
          usuarios_ativos_mes: number | null
          usuarios_suspensos: number | null
          usuarios_warned: number | null
        }
        Relationships: []
      }
      itens_aprovados_moderacao: {
        Row: {
          categoria: string | null
          data_moderacao: string | null
          data_publicacao: string | null
          denuncia_aceita: boolean | null
          denuncia_id: string | null
          item_id: string | null
          moderacao_id: string | null
          moderacao_status: string | null
          moderado_em: string | null
          primeira_foto: string | null
          tem_denuncia: boolean | null
          titulo: string | null
          total_denuncias: number | null
          usuario_id: string | null
          usuario_nome: string | null
          valor_girinhas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_itens_categoria"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "itens_publicado_por_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderacao_itens_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_pendentes_moderacao: {
        Row: {
          categoria: string | null
          data_moderacao: string | null
          data_publicacao: string | null
          denuncia_aceita: boolean | null
          denuncia_id: string | null
          item_id: string | null
          moderacao_id: string | null
          moderacao_status: string | null
          primeira_foto: string | null
          tem_denuncia: boolean | null
          titulo: string | null
          total_denuncias: number | null
          usuario_id: string | null
          usuario_nome: string | null
          valor_girinhas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_itens_categoria"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "itens_publicado_por_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderacao_itens_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_rejeitados_moderacao: {
        Row: {
          categoria: string | null
          comentario_predefinido: string | null
          data_moderacao: string | null
          data_publicacao: string | null
          denuncia_aceita: boolean | null
          denuncia_id: string | null
          item_id: string | null
          moderacao_id: string | null
          moderacao_status: string | null
          moderado_em: string | null
          observacoes_moderacao: string | null
          primeira_foto: string | null
          tem_denuncia: boolean | null
          titulo: string | null
          total_denuncias: number | null
          usuario_id: string | null
          usuario_nome: string | null
          valor_girinhas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_itens_categoria"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "itens_publicado_por_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderacao_itens_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_reportados_moderacao: {
        Row: {
          categoria: string | null
          data_denuncia: string | null
          data_moderacao: string | null
          data_publicacao: string | null
          denuncia_aceita: boolean | null
          denuncia_id: string | null
          descricao_denuncia: string | null
          item_id: string | null
          moderacao_id: string | null
          moderacao_status: string | null
          motivo_denuncia: string | null
          primeira_foto: string | null
          tem_denuncia: boolean | null
          titulo: string | null
          total_denuncias: number | null
          usuario_id: string | null
          usuario_nome: string | null
          valor_girinhas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_itens_categoria"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "itens_publicado_por_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderacao_itens_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_carteiras: {
        Row: {
          created_at: string | null
          saldo_atual: number | null
          total_gasto: number | null
          total_recebido: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          saldo_atual?: number | null
          total_gasto?: never
          total_recebido?: never
          updated_at?: string | null
          user_id?: never
        }
        Update: {
          created_at?: string | null
          saldo_atual?: number | null
          total_gasto?: never
          total_recebido?: never
          updated_at?: string | null
          user_id?: never
        }
        Relationships: []
      }
      ledger_transacoes: {
        Row: {
          conta_destino: string | null
          conta_origem: string | null
          data_criacao: string | null
          data_expiracao: string | null
          descricao: string | null
          metadata: Json | null
          tipo: string | null
          transacao_id: string | null
          user_id: string | null
          valor: number | null
        }
        Relationships: []
      }
      penalidades_usuarios_detalhada: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          expira_em: string | null
          motivo: string | null
          nivel: number | null
          nivel_descricao: string | null
          penalidade_id: string | null
          status_penalidade: string | null
          tipo: string | null
          tipo_descricao: string | null
          updated_at: string | null
          usuario_email: string | null
          usuario_id: string | null
          usuario_nome: string | null
          usuario_username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "penalidades_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_parcerias_configuracoes: {
        Row: {
          dia_creditacao: number | null
          org_codigo: string | null
          organizacao: string | null
          prog_codigo: string | null
          programa: string | null
          usuarios_aprovados: number | null
          usuarios_ja_creditados: number | null
          usuarios_nunca_creditados: number | null
          validade_meses: number | null
          valor_mensal: number | null
        }
        Relationships: []
      }
      vw_parcerias_pendentes_por_dia: {
        Row: {
          dia_creditacao: number | null
          organizacao: string | null
          programa: string | null
          usuarios_pendentes: number | null
          valor_mensal: number | null
          valor_total_mensal: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      aceitar_denuncia: {
        Args: {
          p_comentario?: string
          p_denuncia_id: string
          p_moderador_id: string
          p_observacoes?: string
        }
        Returns: Json
      }
      admin_buscar_todos_itens: {
        Args: { p_limite?: number; p_offset?: number }
        Returns: {
          categoria: string
          comentario_predefinido: string
          created_at: string
          id: string
          moderacao_status: string
          moderado_em: string
          publicado_por: string
          status: string
          titulo: string
          valor_girinhas: number
          vendedor_nome: string
        }[]
      }
      admin_update_item_basico: {
        Args: {
          p_categoria: string
          p_descricao: string
          p_estado_conservacao: string
          p_genero: string
          p_item_id: string
          p_subcategoria: string
          p_tamanho_valor: string
          p_titulo: string
          p_valor_girinhas: number
        }
        Returns: boolean
      }
      agendar_tarefa: {
        Args: {
          p_comando: string
          p_expressao_cron: string
          p_nome_tarefa: string
        }
        Returns: number
      }
      aplicar_banimento_permanente: {
        Args: { p_admin_id: string; p_motivo: string; p_usuario_id: string }
        Returns: Json
      }
      aplicar_penalidade:
        | {
            Args: {
              p_motivo: string
              p_nivel: number
              p_tipo: string
              p_usuario_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_duracao_dias?: number
              p_motivo: string
              p_nivel: number
              p_tipo: string
              p_usuario_id: string
            }
            Returns: string
          }
      aplicar_suspensao_manual: {
        Args: {
          p_admin_id: string
          p_duracao_dias: number
          p_motivo: string
          p_usuario_id: string
        }
        Returns: Json
      }
      atualizar_contadores_cidade: {
        Args: { p_cidade: string; p_estado: string }
        Returns: undefined
      }
      atualizar_reputacao: {
        Args: { p_nova_nota: number; p_usuario_id: string }
        Returns: undefined
      }
      banir_usuario: {
        Args: {
          p_detalhes?: string
          p_moderador_id: string
          p_motivo?: string
          p_usuario_id: string
        }
        Returns: boolean
      }
      blog_create_post: {
        Args: {
          p_author_id?: string
          p_category_id?: string
          p_content: string
          p_excerpt: string
          p_featured_image?: string
          p_seo_description?: string
          p_seo_title?: string
          p_slug: string
          p_status?: string
          p_title: string
        }
        Returns: {
          author_id: string
          category_id: string
          content: string
          created_at: string
          excerpt: string
          featured_image: string
          id: string
          published_at: string
          seo_description: string
          seo_title: string
          slug: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      blog_get_author_by_slug: {
        Args: { p_slug: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          email: string
          id: string
          name: string
          slug: string
          updated_at: string
        }[]
      }
      blog_get_authors: {
        Args: never
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          email: string
          id: string
          name: string
          slug: string
          updated_at: string
        }[]
      }
      blog_get_categories: {
        Args: never
        Returns: {
          created_at: string
          description: string
          id: string
          name: string
          post_count: number
          seo_description: string
          seo_title: string
          slug: string
          updated_at: string
        }[]
      }
      blog_get_category_by_slug: {
        Args: { p_slug: string }
        Returns: {
          created_at: string
          description: string
          id: string
          name: string
          seo_description: string
          seo_title: string
          slug: string
          updated_at: string
        }[]
      }
      blog_get_post_by_slug: {
        Args: { p_slug: string }
        Returns: {
          author_id: string
          canonical_url: string
          category_id: string
          content: string
          created_at: string
          excerpt: string
          featured_image: string
          featured_image_alt: string
          id: string
          og_description: string
          og_image: string
          og_title: string
          published_at: string
          reading_time_minutes: number
          scheduled_for: string
          seo_description: string
          seo_keywords: string[]
          seo_title: string
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number
        }[]
      }
      blog_get_post_tags: {
        Args: { p_post_id: string }
        Returns: {
          id: string
          name: string
          slug: string
        }[]
      }
      blog_get_posts: {
        Args: {
          p_author_id?: string
          p_category_id?: string
          p_page?: number
          p_page_size?: number
          p_search?: string
          p_status?: string
          p_tag_ids?: string[]
        }
        Returns: {
          author_id: string
          canonical_url: string
          category_id: string
          content: string
          created_at: string
          excerpt: string
          featured_image: string
          featured_image_alt: string
          id: string
          og_description: string
          og_image: string
          og_title: string
          published_at: string
          reading_time_minutes: number
          scheduled_for: string
          seo_description: string
          seo_keywords: string[]
          seo_title: string
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number
        }[]
      }
      blog_get_related_posts: {
        Args: { p_post_id: string }
        Returns: {
          excerpt: string
          featured_image: string
          featured_image_alt: string
          id: string
          published_at: string
          reading_time_minutes: number
          reason: string
          slug: string
          title: string
        }[]
      }
      blog_get_tag_by_slug: {
        Args: { p_slug: string }
        Returns: {
          id: string
          name: string
          slug: string
        }[]
      }
      blog_get_tags: {
        Args: never
        Returns: {
          id: string
          name: string
          post_count: number
          slug: string
        }[]
      }
      blog_increment_view_count: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      blog_update_post: {
        Args: {
          p_category_id?: string
          p_content?: string
          p_excerpt?: string
          p_featured_image?: string
          p_id: string
          p_seo_description?: string
          p_seo_title?: string
          p_slug?: string
          p_status?: string
          p_title?: string
        }
        Returns: {
          author_id: string
          category_id: string
          content: string
          created_at: string
          excerpt: string
          featured_image: string
          id: string
          published_at: string
          seo_description: string
          seo_title: string
          slug: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      buscar_escolas_proximas_por_cep: {
        Args: { cep_usuario: string; limite?: number }
        Returns: {
          cep: string
          codigo_inep: number
          distancia_cep: number
          endereco: string
          escola: string
          latitude: string
          longitude: string
          municipio: string
          uf: string
        }[]
      }
      buscar_itens_com_moderacao: {
        Args: {
          p_categoria?: string
          p_limite?: number
          p_offset?: number
          p_user_id?: string
        }
        Returns: {
          aguardando_moderacao: boolean
          categoria: string
          created_at: string
          descricao: string
          fotos: string[]
          id: string
          moderacao_status: string
          publicado_por: string
          status: string
          subcategoria: string
          titulo: string
          valor_girinhas: number
          vendedor_avatar: string
          vendedor_cidade: string
          vendedor_estado: string
          vendedor_nome: string
        }[]
      }
      buscar_itens_mesma_escola: {
        Args: { p_user_id: string }
        Returns: {
          item_id: string
        }[]
      }
      buscar_itens_mesmo_bairro: {
        Args: { p_user_id: string }
        Returns: {
          item_id: string
        }[]
      }
      buscar_usuario_por_username: {
        Args: { p_username: string }
        Returns: {
          avatar_url: string
          id: string
          nome: string
          username: string
        }[]
      }
      buscar_usuarios_admin: {
        Args: {
          limite?: number
          offset_val?: number
          ordenacao?: string
          search_term?: string
          status_filter?: string
        }
        Returns: {
          avatar_url: string
          cadastro_status: string
          cidade: string
          data_cadastro: string
          email: string
          estado: string
          nome: string
          penalidade_mais_grave: number
          penalidades_ativas: number
          pontuacao_reputacao: number
          saldo_girinhas: number
          status: string
          telefone: string
          total_denuncias_feitas: number
          total_girinhas_gastas: number
          total_girinhas_recebidas: number
          total_itens_publicados: number
          total_penalidades_historico: number
          total_reservas_feitas: number
          total_vendas_realizadas: number
          total_violacoes: number
          ultima_atividade: string
          ultima_penalidade: string
          user_id: string
          username: string
        }[]
      }
      calcular_custo_extensao: {
        Args: { p_valor_expirando: number }
        Returns: number
      }
      calcular_distancia_ceps: {
        Args: { cep1: string; cep2: string }
        Returns: number
      }
      calcular_metricas_saude: { Args: never; Returns: Json }
      calcular_prazo_expiracao: { Args: never; Returns: string }
      calcular_usuarios_elegiveis: {
        Args: { criterios_segmentacao: Json }
        Returns: number
      }
      cancelar_reserva_v2: {
        Args: {
          p_motivo_codigo: string
          p_observacoes?: string
          p_reserva_id: string
          p_usuario_id: string
        }
        Returns: boolean
      }
      carregar_dados_feed_paginado: {
        Args: {
          p_busca?: string
          p_categoria?: string
          p_cidade?: string
          p_genero?: string
          p_item_id?: string
          p_limit?: number
          p_modalidade_logistica?: string
          p_mostrar_reservados?: boolean
          p_page?: number
          p_preco_max?: number
          p_preco_min?: number
          p_subcategoria?: string
          p_tamanho?: string
          p_user_id: string
        }
        Returns: Json
      }
      carregar_itens_usuario_especifico: {
        Args: {
          p_busca?: string
          p_categoria?: string
          p_genero?: string
          p_limit?: number
          p_mostrar_reservados?: boolean
          p_page?: number
          p_preco_max?: number
          p_preco_min?: number
          p_subcategoria?: string
          p_tamanho?: string
          p_target_user_id: string
          p_user_id: string
        }
        Returns: Json
      }
      carregar_maes_seguidas: { Args: { p_user_id: string }; Returns: Json }
      carregar_maes_seguidas_paginado: {
        Args: { p_limit?: number; p_page?: number; p_user_id: string }
        Returns: Json
      }
      check_database_status: {
        Args: never
        Returns: {
          insert_policy_exists: boolean
          policy_count: number
          rls_enabled: boolean
          table_name: string
        }[]
      }
      clean_media_url: { Args: { input_url: string }; Returns: string }
      coletar_recompensa_missao: {
        Args: { p_missao_id: string; p_user_id: string }
        Returns: Json
      }
      concluir_jornada: {
        Args: { p_jornada_id: string; p_user_id: string }
        Returns: Json
      }
      configurar_cron_parcerias_sociais: { Args: never; Returns: string }
      create_notification: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_user_goals: { Args: { p_user_id: string }; Returns: undefined }
      create_user_profile: {
        Args: {
          p_avatar_url: string
          p_email: string
          p_nome: string
          p_user_id: string
          p_username: string
        }
        Returns: undefined
      }
      debug_verificar_indicacao: {
        Args: { p_indicado_id: string }
        Returns: boolean
      }
      delete_user_by_email: { Args: { p_email: string }; Returns: string }
      delete_user_minimal: { Args: { p_email: string }; Returns: string }
      desagendar_tarefa: {
        Args: { p_padrao_nome_tarefa: string }
        Returns: number
      }
      desbanir_usuario: {
        Args: {
          p_moderador_id: string
          p_motivo?: string
          p_usuario_id: string
        }
        Returns: boolean
      }
      diagnosticar_exclusao: { Args: { p_email: string }; Returns: string }
      diagnostico_banda_cambial: {
        Args: never
        Returns: {
          acao_recomendada: string
          cotacao_marketplace: number
          markup_aplicado: string
          preco_venda: number
          status_sistema: string
          zona_atual: string
        }[]
      }
      distribuir_girinhas_promocionais: {
        Args: {
          p_apenas_ativas?: boolean
          p_descricao: string
          p_valor: number
        }
        Returns: number
      }
      endereco_completo: { Args: { p_user_id: string }; Returns: boolean }
      entrar_fila_espera: {
        Args: { p_item_id: string; p_usuario_id: string }
        Returns: Json
      }
      extrair_cep_endereco: { Args: { endereco_text: string }; Returns: string }
      finalizar_troca_com_codigo: {
        Args: { p_codigo_confirmacao: string; p_reserva_id: string }
        Returns: boolean
      }
      geocoding_queue_delete: {
        Args: { msg_ids: number[] }
        Returns: undefined
      }
      gerar_codigo_item: { Args: never; Returns: string }
      get_municipios_por_uf: { Args: { uf_param: string }; Returns: string[] }
      get_prazo_reserva_horas: { Args: never; Returns: number }
      get_user_form_data: { Args: never; Returns: Json }
      inativar_item_com_feedback: {
        Args: {
          p_item_id: string
          p_moderador_id: string
          p_motivo: string
          p_observacoes?: string
        }
        Returns: Json
      }
      inicializar_limites_missoes: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      inicializar_metas_usuario: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_master_admin: { Args: never; Returns: boolean }
      is_trigger_context: { Args: never; Returns: boolean }
      ledger_apagar_dados_usuario: {
        Args: { p_user_id: string }
        Returns: string
      }
      ledger_bonus_avaliacao: {
        Args: {
          p_avaliacao_id: string
          p_avaliado_id: string
          p_avaliador_id: string
        }
        Returns: string
      }
      ledger_bonus_cadastro: { Args: { p_user_id: string }; Returns: string }
      ledger_bonus_diario: { Args: { p_user_id: string }; Returns: string }
      ledger_bonus_indicacao: {
        Args: {
          p_indicado_id: string
          p_indicador_id: string
          p_tipo_bonus: string
        }
        Returns: string
      }
      ledger_compra_existe: {
        Args: { p_chave_idempotencia: string }
        Returns: boolean
      }
      ledger_comprar_girinhas: {
        Args: { p_referencia?: string; p_user_id: string; p_valor: number }
        Returns: string
      }
      ledger_confirmar_venda: {
        Args: {
          p_buyer_id: string
          p_reservation_transfer_id: string
          p_seller_id: string
        }
        Returns: Json
      }
      ledger_estender_validade: {
        Args: { p_transacao_id: string; p_user_id: string }
        Returns: Json
      }
      ledger_get_metricas_basicas: { Args: never; Returns: Json }
      ledger_get_metricas_transferencias_30d: { Args: never; Returns: Json }
      ledger_get_user_balance: { Args: { p_user_id: string }; Returns: number }
      ledger_processar_bonus: {
        Args: {
          p_descricao?: string
          p_tipo: string
          p_user_id: string
          p_valor?: number
        }
        Returns: string
      }
      ledger_queimar_girinhas: {
        Args: { p_motivo: string; p_quantidade: number; p_user_id: string }
        Returns: boolean
      }
      ledger_recompensar_missao: {
        Args: { p_mission_id: string; p_user_id: string }
        Returns: string
      }
      ledger_refund: {
        Args: {
          p_reason: string
          p_reservation_transfer_id: string
          p_user_id: string
        }
        Returns: string
      }
      ledger_reservar: {
        Args: { p_item_id: string; p_user_id: string }
        Returns: Json
      }
      ledger_transferir_p2p: {
        Args: {
          p_destinatario_id: string
          p_quantidade: number
          p_remetente_id: string
        }
        Returns: Json
      }
      ledger_transferir_p2p_email: {
        Args: {
          p_email_destinatario: string
          p_quantidade: number
          p_remetente_id: string
        }
        Returns: Json
      }
      liberar_cidade_manual: {
        Args: {
          p_admin_id: string
          p_cidade: string
          p_estado: string
          p_notas?: string
        }
        Returns: Json
      }
      limpar_penalidades_expiradas: { Args: never; Returns: number }
      log_debug: {
        Args: {
          p_error_details?: Json
          p_message: string
          p_operation: string
          p_user_id: string
        }
        Returns: undefined
      }
      marcar_progresso_jornada: {
        Args: { p_jornada_id: string; p_user_id: string }
        Returns: boolean
      }
      mostrar_config_admin: {
        Args: never
        Returns: {
          configuracao: string
          descricao: string
          valor_atual: string
        }[]
      }
      obter_data_expiracao: { Args: never; Returns: string }
      obter_estatisticas_seguidor: {
        Args: { p_usuario_id: string }
        Returns: {
          total_seguidores: number
          total_seguindo: number
        }[]
      }
      obter_fila_espera: {
        Args: { p_item_id: string }
        Returns: {
          posicao_usuario: number
          total_fila: number
        }[]
      }
      obter_girinhas_expiracao_seguro: {
        Args: { p_user_id: string }
        Returns: {
          detalhes_expiracao: Json
          proxima_expiracao: string
          total_expirando_30_dias: number
          total_expirando_7_dias: number
        }[]
      }
      obter_preco_manual: { Args: never; Returns: number }
      obter_resultado_cancelamento: { Args: { p_data: Json }; Returns: boolean }
      obter_status_limite_avaliacoes: {
        Args: { p_user_id: string }
        Returns: Json
      }
      obter_valor_bonus: { Args: { p_tipo_bonus: string }; Returns: number }
      pode_editar_item: { Args: { p_item_id: string }; Returns: Json }
      pode_usuario_agir: {
        Args: { p_acao?: string; p_user_id: string }
        Returns: boolean
      }
      processar_bonus_indicacao_pendentes: { Args: never; Returns: Json }
      processar_compra_girinhas_v2: { Args: { p_dados: Json }; Returns: Json }
      processar_compra_manual: {
        Args: {
          p_idempotency_key?: string
          p_quantidade: number
          p_user_id: string
        }
        Returns: Json
      }
      processar_compra_segura: {
        Args: {
          p_idempotency_key?: string
          p_quantidade: number
          p_user_id: string
        }
        Returns: Json
      }
      processar_compra_webhook_segura: {
        Args: {
          p_external_reference: string
          p_payment_id: string
          p_payment_method?: string
          p_payment_status?: string
          p_quantidade: number
          p_user_id: string
        }
        Returns: Json
      }
      processar_confirmacao_entrega_v2: {
        Args: { p_dados: Json }
        Returns: Json
      }
      processar_creditos_parcerias_mensais: {
        Args: { p_dia_especifico?: number }
        Returns: {
          erros: number
          organizacoes_processadas: string[]
          processados: number
        }[]
      }
      processar_proximo_fila: {
        Args: { p_item_id: string }
        Returns: {
          reserva_id_retorno: string
          sucesso_retorno: boolean
          usuario_id_retorno: string
        }[]
      }
      processar_reserva_item_v2: { Args: { p_dados: Json }; Returns: Json }
      processar_reservas_expiradas_batch: {
        Args: { p_batch_size?: number }
        Returns: number
      }
      re_enable_rls: { Args: never; Returns: undefined }
      read_geocoding_messages: {
        Args: { p_limit?: number }
        Returns: {
          enqueued_at: string
          message: Json
          msg_id: number
          read_ct: number
          vt: string
        }[]
      }
      reativar_item_corrigido: {
        Args: { p_item_id: string; p_user_id: string }
        Returns: Json
      }
      reconfigurar_cron_parcerias: { Args: never; Returns: string }
      registrar_analytics_missao: {
        Args: {
          p_detalhes?: Json
          p_evento: string
          p_missao_id: string
          p_user_id: string
        }
        Returns: string
      }
      registrar_conversa_whatsapp:
        | {
            Args: { p_reserva_id: string; p_tipo_usuario: string }
            Returns: undefined
          }
        | {
            Args: { p_reserva_id: string; p_usuario_recebeu: string }
            Returns: undefined
          }
      registrar_indicacao: {
        Args: { p_indicado_id: string; p_indicador_id: string }
        Returns: boolean
      }
      rejeitar_denuncia: {
        Args: {
          p_denuncia_id: string
          p_moderador_id: string
          p_observacoes?: string
        }
        Returns: Json
      }
      relatorio_banda_situacao: {
        Args: never
        Returns: {
          cotacao_real: number
          markup_aplicado: string
          preco_recompra: number
          preco_venda: number
          status_sistema: string
          zona_atual: string
        }[]
      }
      relatorio_sistema_admin: {
        Args: never
        Returns: {
          configuracao_markup: string
          cotacao_real: number
          limite_max: number
          limite_min: number
          markup_atual: number
          preco_recompra: number
          preco_venda: number
          status_sistema: string
        }[]
      }
      relatorio_sistema_cotacao: {
        Args: never
        Returns: {
          acao_sistema: string
          cotacao_real: number
          markup_aplicado: number
          preco_meta: number
          preco_recompra: number
          preco_venda: number
          situacao_mercado: string
        }[]
      }
      remover_penalidade: {
        Args: { p_penalidade_id: string }
        Returns: boolean
      }
      remover_penalidade_restaurar_usuario: {
        Args: { p_admin_id: string; p_penalidade_id: string }
        Returns: Json
      }
      resetar_limites_avaliacoes_mensais: { Args: never; Returns: number }
      sair_fila_espera: {
        Args: { p_item_id: string; p_usuario_id: string }
        Returns: boolean
      }
      save_user_phone: { Args: { p_telefone: string }; Returns: boolean }
      save_verification_code: {
        Args: { p_code: string; p_telefone: string }
        Returns: boolean
      }
      send_admin_notification: {
        Args: {
          p_action_text?: string
          p_action_url?: string
          p_message: string
          p_sent_by?: string
          p_target_type?: string
          p_target_users?: string[]
          p_title: string
        }
        Returns: number
      }
      usuario_elegivel_missao: {
        Args: { p_missao_id: string; p_user_id: string }
        Returns: boolean
      }
      validar_valor_item_categoria: {
        Args: { p_categoria: string; p_valor: number }
        Returns: boolean
      }
      verificar_admin: { Args: never; Returns: boolean }
      verificar_e_aplicar_penalidade_rejeicao: {
        Args: { p_usuario_id: string }
        Returns: undefined
      }
      verificar_metas_usuario: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      verificar_progresso_missoes: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      verificar_progresso_missoes_segmentadas: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      verificar_status_usuario: { Args: { p_user_id: string }; Returns: Json }
      verificar_username_disponivel: {
        Args: { p_username: string }
        Returns: boolean
      }
      verify_phone_code:
        | {
            Args: { p_code: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.verify_phone_code(p_code => text), public.verify_phone_code(p_code => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { p_code: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.verify_phone_code(p_code => text), public.verify_phone_code(p_code => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      verify_user_deletion: { Args: { p_email: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
