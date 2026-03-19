# T10_README_STEPS - Passo a passo para implementar MVP1 Reservas

## MVP1 Sistema de Reservas GiraMãe - Guia de Implementação

### 📋 Visão Geral

Este MVP implementa:
- ✅ Expiração automática de reservas via job horário
- ✅ Lembretes antes da expiração (24h, 6h, 1h)  
- ✅ Motivo de cancelamento rastreado
- ✅ Configurações dinâmicas via `config_sistema`
- ✅ UI com contador regressivo, modal de cancelamento e badge de notificações

### 🚀 Passo a Passo de Implementação

#### Etapa 1: Aplicar Migrações de Banco (CRÍTICO)

```bash
# As migrações já foram aplicadas automaticamente:
# 20250117000001_mvp1_reservas_schema.sql
# 20250117000002_patch_cancelar_reserva_motivo.sql  
# 20250117000003_func_processar_expiradas_batch.sql
# 20250117000004_patch_processar_reserva_prazo.sql
```

**Verificar se aplicaram corretamente:**
```sql
-- Verificar coluna criada
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'reservas' AND column_name = 'motivo_cancelamento';

-- Verificar configurações
SELECT chave, valor FROM config_sistema 
WHERE chave IN ('reserva_prazo_horas', 'notificacao_horas');

-- Verificar funções
\df public.cancelar_reserva
\df public.processar_reservas_expiradas_batch
```

#### Etapa 2: Configurar Edge Functions

As Edge Functions foram criadas em:
- `supabase/functions/process-expired-reservations/index.ts`
- `supabase/functions/send-reservation-reminders/index.ts`

**Configurar agendamento (Cron):**

1. Acesse o Supabase Dashboard
2. Vá em Database > Cron Jobs (se disponível) ou use SQL:

```sql
-- Job para processar reservas expiradas (a cada hora)
SELECT cron.schedule(
  'process-expired-reservations-hourly',
  '0 * * * *', -- Todo minuto 0 de cada hora
  $$
  SELECT net.http_post(
    url := 'https://mkuuwnqiaeguuexeeicw.supabase.co/functions/v1/process-expired-reservations',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Job para enviar lembretes (a cada hora)
SELECT cron.schedule(
  'send-reservation-reminders-hourly',
  '15 * * * *', -- Minuto 15 de cada hora
  $$
  SELECT net.http_post(
    url := 'https://mkuuwnqiaeguuexeeicw.supabase.co/functions/v1/send-reservation-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

#### Etapa 3: Integrar Componentes Frontend

Os componentes foram criados:
- `src/components/reservas/TempoRestante.tsx`
- `src/components/reservas/CancelarReservaModal.tsx`  
- `src/components/notifications/NotificacoesBadge.tsx`

**Integrar no ReservaCard.tsx:**
```tsx
import { TempoRestante } from './TempoRestante';
import { CancelarReservaModal } from './CancelarReservaModal';

// No JSX do componente:
{reserva.status === 'pendente' && (
  <TempoRestante prazoExpiracao={reserva.prazo_expiracao} />
)}

// Adicionar modal de cancelamento com motivo
```

**Integrar NotificacoesBadge no Header:**
```tsx
import { NotificacoesBadge } from '@/components/notifications/NotificacoesBadge';

// No header principal:
<NotificacoesBadge />
```

#### Etapa 4: Testes Essenciais

Execute os scripts de teste em `scripts/test_mvp1_reservas.sql`:

```bash
# 1. Verificar migrações
psql -f scripts/test_mvp1_reservas.sql

# 2. Testar manualmente uma expiração
# (criar reserva com prazo no passado)

# 3. Testar processamento batch
SELECT processar_reservas_expiradas_batch(5);

# 4. Verificar notificações criadas
SELECT * FROM notifications WHERE type = 'reserva_expirada' ORDER BY created_at DESC;
```

#### Etapa 5: Configurações de Produção

**Ajustar configurações conforme necessário:**
```sql
-- Alterar prazo padrão das reservas (horas)
UPDATE config_sistema 
SET valor = '{"valor": 72}'::jsonb 
WHERE chave = 'reserva_prazo_horas';

-- Alterar marcos de notificação
UPDATE config_sistema 
SET valor = '{"valores": [48, 24, 6, 1]}'::jsonb 
WHERE chave = 'notificacao_horas';

-- Ativar/desativar penalidades
UPDATE config_sistema 
SET valor = '{"ativo": true, "pontos": 10}'::jsonb 
WHERE chave = 'penalidade_vendedor';
```

### ⚠️ Cuidados Importantes

1. **Backup**: Sempre faça backup antes de aplicar em produção
2. **Testes**: Execute todos os testes em ambiente de desenvolvimento primeiro
3. **Monitoramento**: Acompanhe logs das Edge Functions nos primeiros dias
4. **RLS**: Verifique se políticas RLS cobrem as novas colunas
5. **Performance**: Monitore performance das queries de expiração

### 🔧 Troubleshooting

**Edge Functions não executam:**
- Verificar se chaves de ambiente estão configuradas
- Verificar logs no Supabase Dashboard > Edge Functions > Logs

**Notificações não aparecem:**
- Verificar políticas RLS na tabela `notifications`
- Verificar se realtime está habilitado

**Expiração não funciona:**
- Verificar se cron jobs estão ativos
- Verificar se função `processar_reservas_expiradas_batch` executa corretamente

### 📊 Métricas e Monitoramento

**Queries úteis para monitoramento:**
```sql
-- Reservas expiradas nas últimas 24h
SELECT COUNT(*) FROM reservas 
WHERE status = 'expirada' 
AND updated_at > now() - interval '24 hours';

-- Tipos de cancelamento mais comuns
SELECT motivo_cancelamento, COUNT(*) 
FROM reservas 
WHERE motivo_cancelamento IS NOT NULL 
GROUP BY motivo_cancelamento 
ORDER BY COUNT(*) DESC;

-- Performance do processamento batch
SELECT * FROM error_log 
WHERE error_message LIKE '%processar_reservas_expiradas_batch%' 
ORDER BY created_at DESC;
```

### 🚀 Próximos Passos (Backlog)

Para implementar após MVP1:
- [ ] Penalidades automáticas de reputação
- [ ] Dashboard de métricas administrativo
- [ ] Hardening de concorrência na fila
- [ ] Notificações push via OneSignal
- [ ] Segmentação avançada de notificações

---

**🎉 Conclusão**: Com estes passos, o MVP1 do Sistema de Reservas estará completamente funcional, proporcionando expiração automática, lembretes inteligentes e rastreamento detalhado de cancelamentos!