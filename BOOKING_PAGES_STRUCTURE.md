# Estrutura de Páginas de Agendamento - Schedfy

## 📋 Visão Geral

As páginas de agendamento foram organizadas em **2 categorias principais**:

### 1. 🌐 Agendamento Público (Cliente Externo)

**Localização:** `/pages/public/entity-profile.tsx`

**Acesso:** Página pública acessível via `/book/:slug` (ex: `/book/dieegoolimaa`)

**Características:**

- ✅ Cliente público pode agendar sem login
- ✅ Seleção de serviço
- ✅ Seleção de profissional (opcional)
- ✅ Seleção de data e horário usando `TimeSlotPicker`
- ✅ **Apenas 1 agendamento por vez**
- ✅ Formulário com dados do cliente (nome, email, telefone)
- ✅ Visualização de horários de funcionamento
- ✅ Informações da empresa (avaliações, endereço, contato)

**Tecnologia:**

- Usa `publicService.createBooking()`
- Componente `TimeSlotPicker` para seleção de horários
- Busca disponibilidade em tempo real

---

### 2. 🔐 Agendamento Interno (Usuários Autenticados)

#### A. Páginas Simples de Visualização

**Planos:** Simple, Individual, Business

**Localizações:**

- `/pages/simple/bookings.tsx` - Plano Simple
- `/pages/individual/bookings.tsx` - Plano Individual
- `/pages/business/bookings.tsx` - Plano Business

**Rotas:**

- `/simple/bookings` - Visualizar agendamentos do plano Simple
- `/individual/bookings` - Visualizar agendamentos do plano Individual
- `/entity/bookings` - Visualizar agendamentos do plano Business

**Características:**

- ✅ Visualização de lista de agendamentos
- ✅ Filtros por status, data, cliente
- ✅ Estatísticas (total, confirmados, pendentes, cancelados)
- ✅ Visualização em calendário
- ✅ Criação de **agendamentos simples** usando `CreateBookingDialog`
- ✅ AI Insights (para Individual e Business)

---

#### B. Página Avançada de Gestão de Agendamentos

**Planos:** Individual e Business (somente)

**Localização:** `/pages/common/booking-management.tsx` ⭐ (COMPARTILHADA)

**Rotas:**

- `/individual/booking-management` - Gestão avançada para Individual
- `/entity/booking-management` - Gestão avançada para Business

**Características Avançadas:**

- ✅ **Criação de múltiplos agendamentos em lote**
- ✅ Seleção de múltiplos serviços
- ✅ Múltiplas datas e horários
- ✅ **Suporte a Pacotes de Serviços**
  - Seleção de pacote ativo do cliente
  - Dedução automática de sessões
  - Validação de sessões disponíveis
  - Verificação de serviços incluídos no pacote
- ✅ Busca e seleção de cliente existente
- ✅ Filtros avançados (serviço, profissional, status de pagamento)
- ✅ Gestão de pagamentos
- ✅ Histórico detalhado
- ✅ Batch operations

**Componentes Usados:**

- `CreateBookingDialog` - Dialog completo com todas as funcionalidades
- `TimeSlotPicker` - Seleção de horários disponíveis
- `PaymentForm` - Processamento de pagamentos

---

## 🎯 Dialog Unificado: CreateBookingDialog

**Localização:** `/components/dialogs/create-booking-dialog.tsx`

**Usado por:** Todas as páginas de agendamento interno

**Funcionalidades:**

### Modo Simples (allowMultiple = false)

- 1 serviço
- 1 data/horário
- Dados do cliente
- Notas opcionais

### Modo Avançado (allowMultiple = true)

- ✅ **Múltiplos agendamentos simultâneos**
- ✅ Adicionar/remover slots de agendamento
- ✅ Cada slot com seu próprio:
  - Serviço
  - Data
  - Horário (via TimeSlotPicker)
  - Profissional (selecionado automaticamente pelo slot)
- ✅ **Integração com Pacotes**
  - Toggle para usar sessão de pacote
  - Lista de pacotes ativos do cliente
  - Validação de sessões disponíveis
  - Validação de serviços incluídos
  - Dedução automática de sessões
  - Alertas informativos

### Props Principais

```typescript
interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  services: Service[];
  onSubmit: (bookingData: any) => Promise<void>;
  allowMultiple?: boolean; // Permitir múltiplos agendamentos
  clientId?: string; // ID do cliente para pacotes
  packages?: ServicePackage[]; // Pacotes disponíveis
  clientSubscriptions?: PackageSubscription[]; // Assinaturas ativas
}
```

---

## 📊 Comparação de Funcionalidades

| Funcionalidade          | Público | Simple | Individual | Business |
| ----------------------- | ------- | ------ | ---------- | -------- |
| Agendamento único       | ✅      | ✅     | ✅         | ✅       |
| Múltiplos agendamentos  | ❌      | ❌     | ✅         | ✅       |
| Seleção de profissional | ✅      | ❌     | ✅         | ✅       |
| Pacotes de serviços     | ❌      | ❌     | ✅         | ✅       |
| Gestão avançada         | ❌      | ❌     | ✅         | ✅       |
| AI Insights             | ❌      | ❌     | ✅         | ✅       |
| Pagamentos              | ❌      | ❌     | ✅         | ✅       |
| Batch operations        | ❌      | ❌     | ❌         | ✅       |

---

## 🔄 Fluxo de Agendamento

### Fluxo Público (Cliente)

```
1. Cliente acessa /book/:slug
2. Visualiza empresa e serviços
3. Seleciona serviço
4. (Opcional) Seleciona profissional
5. Seleciona data
6. TimeSlotPicker mostra horários disponíveis
7. Seleciona horário
8. Preenche dados pessoais
9. Confirma agendamento
10. Recebe confirmação por email
```

### Fluxo Interno Simples (Simple Plan)

```
1. Acessa /simple/bookings
2. Clica "New Booking"
3. CreateBookingDialog abre (allowMultiple=false)
4. Preenche dados do cliente
5. Seleciona serviço
6. Seleciona data
7. TimeSlotPicker mostra horários
8. Seleciona horário
9. Adiciona notas (opcional)
10. Confirma
```

### Fluxo Interno Avançado (Individual/Business)

```
1. Acessa /individual/booking-management ou /entity/booking-management
2. Clica "Create Multiple Bookings"
3. CreateBookingDialog abre (allowMultiple=true)
4. Busca e seleciona cliente existente
5. (Opcional) Ativa uso de pacote
   - Seleciona pacote ativo
   - Sistema valida sessões disponíveis
6. Adiciona primeiro slot:
   - Seleciona serviço
   - Seleciona data
   - TimeSlotPicker mostra horários
   - Seleciona horário
7. (Opcional) Adiciona mais slots repetindo passo 6
8. Revisa resumo (X slots, Y sessões do pacote)
9. Confirma criação em lote
10. Sistema cria todos os agendamentos
11. Se pacote usado, deduz sessões automaticamente
```

---

## 🛠️ Componentes Compartilhados

### TimeSlotPicker

**Localização:** `/components/time-slot-picker.tsx`

**Usado em:**

- Página pública (entity-profile.tsx)
- CreateBookingDialog (todas as páginas internas)

**Funcionalidades:**

- Busca slots disponíveis do backend
- Exibe horários em grade
- Mostra profissional associado ao slot
- Indica slots indisponíveis
- Loading states

### CreateBookingDialog

**Localização:** `/components/dialogs/create-booking-dialog.tsx`

**Usado em:**

- Simple: bookings.tsx, dashboard.tsx
- Individual: bookings.tsx, dashboard.tsx
- Business: bookings.tsx, dashboard.tsx
- Common: booking-management.tsx

---

## 📁 Estrutura de Arquivos

```
src/pages/
├── public/
│   └── entity-profile.tsx          # Agendamento público
├── common/
│   ├── client-profile.tsx          # Gestão de clientes (todos os planos)
│   ├── entity-profile.tsx          # Perfil da empresa (todos os planos)
│   └── booking-management.tsx      # Gestão avançada (Individual + Business)
├── simple/
│   ├── dashboard.tsx               # Usa CreateBookingDialog
│   └── bookings.tsx                # Lista + CreateBookingDialog
├── individual/
│   ├── dashboard.tsx               # Usa CreateBookingDialog
│   ├── bookings.tsx                # Lista + CreateBookingDialog
│   └── package-management.tsx      # Gestão de pacotes
└── business/
    ├── dashboard.tsx               # Usa CreateBookingDialog
    ├── bookings.tsx                # Lista + CreateBookingDialog
    └── package-management.tsx      # Gestão de pacotes

src/components/
├── dialogs/
│   └── create-booking-dialog.tsx   # Dialog unificado
└── time-slot-picker.tsx            # Seletor de horários
```

---

## ✅ Integração Completa

### Backend Integration

- ✅ `publicService.createBooking()` - Agendamentos públicos
- ✅ `useBookings().createBooking()` - Agendamentos internos
- ✅ `useServices()` - Lista de serviços
- ✅ `useClients()` - Busca de clientes
- ✅ TimeSlotPicker busca slots do backend
- ✅ Validação de disponibilidade em tempo real

### Package Integration

- ✅ `clientSubscriptions` - Lista de pacotes ativos
- ✅ Validação de sessões disponíveis
- ✅ Validação de serviços incluídos
- ✅ Dedução automática após agendamento
- ✅ Alertas e avisos para o usuário

---

## 🚀 Próximos Passos

1. ✅ Páginas consolidadas e organizadas
2. ✅ Dialog unificado implementado
3. ✅ Suporte a pacotes integrado
4. ✅ TimeSlotPicker funcionando
5. ⏳ Testes end-to-end
6. ⏳ Documentação de API
7. ⏳ Tutoriais em vídeo

---

## 📝 Notas Importantes

- **Página pública** é específica e não compartilhada (público vs autenticado)
- **booking-management.tsx** está em `/common` porque Individual e Business compartilham a mesma lógica avançada
- **Simple plan** usa apenas páginas básicas (bookings.tsx) sem gestão avançada
- **CreateBookingDialog** é o único componente de criação de agendamentos (removido QuickBookingDialog)
- **TimeSlotPicker** é usado em TODAS as interfaces de agendamento para consistência
