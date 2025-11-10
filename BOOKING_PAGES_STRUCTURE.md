# Estrutura de Páginas - Schedfy

## 📋 Visão Geral

**Planos Disponíveis:** Simple, Individual, Business

As páginas foram organizadas em **2 categorias principais**: **Públicas** e **Internas**

---

## 🌐 PÁGINAS PÚBLICAS (Clientes sem Login)

### 1. Perfil Público da Empresa

**Localização:** `/pages/public/entity-profile.tsx`

**Acesso:** `/book/:slug` (ex: `/book/dieegoolimaa`)

**Propósito:** Página pública que clientes acessam para conhecer a empresa e fazer agendamentos

**Características:**
- ✅ Estilo de **perfil de rede social**
- ✅ Informações da empresa (nome, descrição, avaliações)
- ✅ Galeria de fotos/trabalhos
- ✅ Lista de serviços disponíveis
- ✅ Equipe de profissionais
- ✅ Horário de funcionamento
- ✅ Localização e contato
- ✅ Redes sociais
- ✅ **Formulário de agendamento integrado**

**Customização:**
- ⚠️ **NÃO customizável pela conta** (aparência padrão do sistema)
- Dados vêm das configurações em Settings
- Layout fixo tipo Instagram/Facebook profile

### 2. Agendamento Público

**Integrado em:** `/pages/public/entity-profile.tsx` (mesmo arquivo acima)

**Integrado em:** `/pages/public/entity-profile.tsx` (mesmo arquivo acima)

**Características do Agendamento:**
- ✅ Cliente pode agendar **sem login**
- ✅ Seleção de serviço
- ✅ Seleção de profissional (opcional)
- ✅ Seleção de data e horário usando `TimeSlotPicker`
- ✅ **Apenas 1 agendamento por vez**
- ✅ Formulário com dados do cliente (nome, email, telefone, notas)
- ✅ Visualização de horários disponíveis em tempo real

**Tecnologia:**
- Usa `publicService.createBooking()`
- Componente `TimeSlotPicker` para seleção de horários
- Busca disponibilidade em tempo real do backend

---

## 🔐 PÁGINAS INTERNAS (Usuários Autenticados)

### 1. Perfil Interno da Empresa

**Localização:** `/pages/common/entity-profile.tsx`

**Acesso:** `/entity/profile`, `/individual/profile`, `/simple/profile`

**Propósito:** Página interna estilo **perfil de rede social** para gerenciar informações da empresa

**Características:**
- ✅ Modo visualização e modo edição
- ✅ Cover image customizável
- ✅ Logo/Avatar da empresa
- ✅ Informações de contato
- ✅ Redes sociais
- ✅ Horário de funcionamento
- ✅ Estatísticas da conta
- ✅ Configurações de assinatura

**Customização:**
- ✅ **Editável** pelos usuários autenticados
- ✅ Upload de logo e cover image
- ✅ Edição de descrição e informações
- ✅ Gerenciamento de horários
- ✅ Links de redes sociais

**Dados vêm de Settings:**
- Nome da empresa
- Descrição
- Endereço e contato
- Redes sociais (Instagram, Facebook, etc.)
- Horários de funcionamento
- Logo e imagens

---

### 2. Páginas de Agendamento Interno

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

**Planos:** Individual e Business

**Localização:** `/pages/common/booking-management.tsx` ⭐ (COMPARTILHADA)

**Rotas:**
- `/individual/booking-management` - Gestão avançada para Individual
- `/entity/booking-management` - Gestão avançada para Business

**Características Avançadas:**
- ✅ **Criação de múltiplos agendamentos em lote (Batch operations)**
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
- ✅ **Batch operations disponível para Individual E Business**

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

| Funcionalidade              | Público | Simple | Individual | Business |
|-----------------------------|---------|--------|------------|----------|
| Agendamento único           | ✅      | ✅     | ✅         | ✅       |
| Múltiplos profissionais     | ✅      | ✅     | ❌         | ✅       |
| Múltiplos agendamentos      | ❌      | ❌     | ✅         | ✅       |
| Seleção de profissional     | ✅      | ✅     | ❌         | ✅       |
| Pacotes de serviços         | ❌      | ❌     | ✅         | ✅       |
| Gestão avançada             | ❌      | ❌     | ✅         | ✅       |
| AI Insights                 | ❌      | ❌     | ✅         | ✅       |
| Pagamentos                  | ❌      | ❌     | ✅         | ✅       |
| **Batch operations**        | ❌      | ❌     | **✅**     | **✅**   |
| Perfil editável             | ❌      | ✅     | ✅         | ✅       |
| Gestão de equipe            | ❌      | ✅     | ❌         | ✅       |
| User management/permissões  | ❌      | ❌     | ❌         | ✅       |
| Comissões                   | ❌      | ❌     | ❌         | ✅       |
| Loyalty programs            | ❌      | ❌     | ❌         | ✅       |
| Customização visual pública | ❌      | ❌     | ❌         | ❌       |

**Nota sobre Páginas Públicas:**
- 🌐 **Perfil público** (`/book/:slug`) = Aparência **FIXA** tipo rede social
- 🔧 **Dados** vêm de Settings mas **layout NÃO é customizável**
- 🔐 **Perfil interno** (`/entity/profile`) = **Editável** pelos usuários

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
│   ├── entity-profile.tsx          # 🌐 PERFIL PÚBLICO + Agendamento
│   │                               # Aparência FIXA tipo rede social
│   │                               # Clientes sem login
│   └── business-discovery.tsx      # Lista pública de empresas
├── common/
│   ├── client-profile.tsx          # Gestão de clientes (Simple, Individual, Business)
│   ├── entity-profile.tsx          # 🔐 PERFIL INTERNO editável
│   │                               # Estilo rede social MAS customizável
│   │                               # Settings definem os dados
│   └── booking-management.tsx      # Gestão avançada (Individual + Business)
│                                   # Batch operations para AMBOS
├── simple/
│   ├── dashboard.tsx               # Usa CreateBookingDialog
│   ├── bookings.tsx                # Lista + CreateBookingDialog
│   ├── services.tsx                # Gestão de serviços
│   ├── professionals.tsx           # Gestão de profissionais ⭐
│   ├── reports.tsx                 # Relatórios básicos
│   └── settings.tsx                # Configurações básicas
├── individual/
│   ├── dashboard.tsx               # Usa CreateBookingDialog
│   ├── bookings.tsx                # Lista + CreateBookingDialog
│   ├── package-management.tsx      # Gestão de pacotes
│   └── settings.tsx                # Configurações + perfil público
└── business/
    ├── dashboard.tsx               # Usa CreateBookingDialog
    ├── bookings.tsx                # Lista + CreateBookingDialog
    ├── package-management.tsx      # Gestão de pacotes
    ├── professionals.tsx           # Gestão de equipe
    └── settings.tsx                # Configurações completas + perfil público
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
├── time-slot-picker.tsx            # Seletor de horários
└── business-profile-manager.tsx    # Componente de settings para perfil público
```

**Settings:** Configurações que alimentam o perfil público:
```
business/settings.tsx (ou individual/settings.tsx):
├── Business Info Tab
│   ├── Nome da empresa
│   ├── Descrição
│   ├── Logo/Avatar
│   ├── Cover image
│   ├── Tipo de negócio
│   └── Endereço completo
├── Contact Tab
│   ├── Email
│   ├── Telefone
│   ├── Website
│   └── Redes sociais (Instagram, Facebook, etc.)
├── Working Hours Tab
│   └── Horários para cada dia da semana
└── Appearance Tab (apenas visual interno)
    ├── Theme (light/dark)
    └── Idioma
```

---

## ✅ Integração Completa

### Backend Integration
- ✅ `publicService.createBooking()` - Agendamentos públicos
- ✅ `useBookings().createBooking()` - Agendamentos internos
- ✅ `useServices()` - Lista de serviços
- ✅ `useClients()` - Busca de clientes
- ✅ `entitiesService.getById()` - Dados da empresa para perfil público
- ✅ TimeSlotPicker busca slots do backend
- ✅ Validação de disponibilidade em tempo real

### Package Integration
- ✅ `clientSubscriptions` - Lista de pacotes ativos
- ✅ Validação de sessões disponíveis
- ✅ Validação de serviços incluídos
- ✅ Dedução automática após agendamento
- ✅ Alertas e avisos para o usuário

---

## 🎯 PLANOS E FUNCIONALIDADES

### Simple Plan
**Foco:** Agendamento e atendimento (ideal para departamentos públicos, clínicas simples)
- ✅ Agendamentos básicos (1 por vez)
- ✅ **Múltiplos profissionais** (gestão de equipe)
- ✅ Perfil interno editável
- ✅ Settings básicas
- ✅ Gestão de profissionais (professionals.tsx)
- ❌ Sem pacotes
- ❌ Sem batch operations

### Individual Plan
**Foco:** Profissional autônomo ou pequeno negócio (1 pessoa)
- ✅ Agendamentos básicos
- ✅ Pacotes de serviços
- ✅ **Batch operations** (múltiplos agendamentos)
- ✅ Gestão avançada (booking-management.tsx)
- ✅ AI Insights
- ✅ Payment management
- ❌ **Apenas 1 profissional** (o próprio dono)
- ❌ Sem gestão de equipe

### Business Plan
**Foco:** Empresas completas com recursos avançados
- ✅ **Múltiplos profissionais**
- ✅ Gestão de equipe (professionals.tsx)
- ✅ Pacotes de serviços
- ✅ **Batch operations** (múltiplos agendamentos)
- ✅ Gestão avançada (booking-management.tsx)
- ✅ User management (permissões e roles)
- ✅ Analytics avançados
- ✅ Sistema de comissões
- ✅ Loyalty programs
- ✅ AI Insights

**Nota:** Não existem outros planos (Professional, etc.). Apenas Simple, Individual e Business.

---

## 🚀 Próximos Passos

1. ✅ Páginas consolidadas e organizadas
2. ✅ Dialog unificado implementado
3. ✅ Suporte a pacotes integrado
4. ✅ TimeSlotPicker funcionando
5. ✅ Batch operations para Individual E Business
6. ✅ Estrutura de planos clarificada (Simple, Individual, Business)
7. ⏳ Redesign do perfil público tipo rede social
8. ⏳ Integração visual entre Settings e perfil público
9. ⏳ Testes end-to-end
10. ⏳ Documentação de API

---

## 📝 Notas Importantes

### Sobre Páginas Públicas vs Internas

**🌐 PÚBLICAS** (Clientes sem login):
- `/book/:slug` - Perfil público da empresa + Agendamento
- Layout **FIXO** tipo Instagram/Facebook profile
- **NÃO customizável** visualmente pela conta
- Dados vêm de Settings mas aparência é padronizada
- Objetivo: Consistência e profissionalismo

**🔐 INTERNAS** (Usuários autenticados):
- `/entity/profile` ou `/individual/profile` - Perfil interno
- Layout estilo rede social **MAS editável**
- Usuários podem editar informações, logo, cover, etc.
- Dados também vêm de Settings

### Sobre Planos

✅ **Planos Existentes:**
- Simple
- Individual  
- Business

❌ **Não existem:**
- Professional
- Enterprise
- Outros planos customizados

### Sobre Batch Operations

- ✅ Disponível para **Individual** (não só Business)
- ✅ Permite criar múltiplos agendamentos de uma vez
- ✅ Suporta múltiplos serviços e datas
- ✅ Integrado com pacotes
- ✅ Usado em `booking-management.tsx` (comum para Individual e Business)

### Sobre Settings

Settings é onde os dados do perfil público são gerenciados:
- Business Info → Nome, descrição, logo, cover
- Contact → Email, telefone, website, redes sociais  
- Working Hours → Horários de funcionamento
- Appearance → Apenas para visual interno (theme, idioma)

O perfil público **consome** esses dados mas **não permite customização visual** da página em si.
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
