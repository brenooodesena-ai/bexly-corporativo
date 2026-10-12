# 🚀 Guia Oficial: Sistema de Automação do Instagram & Gestão Nativa de Leads — Bexly

Este documento contém a documentação completa, arquitetural e prática da funcionalidade de **Automação de Conversão pelo Instagram** da Bexly.

---

## 🏗️ 1. Arquitetura do Sistema

O sistema foi construído de forma **nativa, desacoplada e pronta para produção**, sem dependência de CRMs externos.

```
[ Usuário no Instagram ]
       │
       ▼ (Comenta "QUERO" num Post/Reel)
[ Meta Webhooks ] ──(HMAC-SHA256)──► [ GET/POST /api/webhooks/meta ]
                                            │
                                            ├── Responde 200 OK (< 200ms)
                                            ▼
                                     [ In-Process Queue ] (com retry & backoff)
                                            │
                                            ▼
                                  [ Automation Engine ]
                                            ├── Avalia Post (id / all)
                                            ├── Avalia Palavra-chave ("QUERO", "ABRIR", etc.)
                                            ├── Descriptografa Token (AES-256-GCM)
                                            ├── Dispara Private Reply oficial da Meta API
                                            ▼
                                  [ Native Lead Service ]
                                            ├── Deduplica por instagram_user_id / username
                                            ├── Cria/Atualiza Lead nativo
                                            ├── Registra Timeline & Touchpoints de Atribuição
                                            └── Atribui Tags e Estágio no Pipeline
```

---

## 🔒 2. Segurança e Criptografia

- **Tokens de Acesso da Meta**: NUNCA são salvos em texto plano. São criptografados usando **AES-256-GCM** com IV aleatório e tag de autenticação através do serviço `server/services/tokenEncryption.ts`.
- **Assinatura de Webhooks**: Todas as requisições recebidas da Meta em `/api/webhooks/meta` têm o header `x-hub-signature-256` verificado com `META_APP_SECRET`.
- **Idempotência**: Cada evento de webhook tem uma chave externa única `provider + external_event_id` indexada no SQLite/PostgreSQL para garantir que comentários repetidos nunca disparem ações duplicadas.

---

## 🛠️ 3. Como Configurar no Meta for Developers

Para conectar uma conta real do Instagram em produção:

1. Acesse o [Meta for Developers](https://developers.facebook.com/).
2. Crie ou selecione um aplicativo do tipo **Business**.
3. Adicione o produto **Instagram** ao aplicativo.
4. Em **Permissões de Acesso (Permissions)**, solicite:
   - `instagram_business_basic`
   - `instagram_business_manage_messages` (para Private Replies / envio de Direct)
   - `instagram_business_manage_comments` (para escuta e resposta a comentários)
5. Em **Webhooks**, configure:
   - **Objeto**: `instagram`
   - **Callback URL**: `https://seu-dominio.com/api/webhooks/meta`
   - **Verify Token**: O mesmo valor colocado no seu `.env` (`META_VERIFY_TOKEN`)
   - **Campos subscritos**: `comments`, `live_comments`, `messages`
6. Em **OAuth Redirect URIs**, adicione:
   - `https://seu-dominio.com/integrations/instagram/callback` (em dev: `http://localhost:5173/integrations/instagram/callback`)
7. Copie o **App ID** e **App Secret** para o seu `.env`:
   ```env
   META_APP_ID=seu_app_id_aqui
   META_APP_SECRET=seu_app_secret_aqui
   META_REDIRECT_URI=http://localhost:5173/integrations/instagram/callback
   META_VERIFY_TOKEN=bexly_webhook_verify_2024
   ```

---

## 📦 4. Executando o Projeto

### Iniciar o Backend (API na porta 3001)
```bash
npm run server
```
Ou com recarregamento automático (hot-reload):
```bash
npm run dev:server
```

### Iniciar o Frontend (Vite na porta 5173)
```bash
npm run dev
```

### Rodar os Testes Automatizados
```bash
npm test
```
*Testa criptografia AES-256-GCM, deduplicação de leads, máquina de automação e triggers com 100% de aprovação.*

---

## 📊 5. Gestão Nativa de Leads

Nenhum CRM de terceiros é necessário. Cada comentário processado gera ou atualiza um lead na tabela `leads` com:
- Nome e username do Instagram
- Histórico completo na aba **Timeline** (comentário original, envio da DM, abertura de link)
- Atribuição multitoque (**Touchpoints**) para rastrear qual post/reel gerou qual oportunidade
- Pipeline de status: `novo` ➔ `contatado` ➔ `qualificado` ➔ `oportunidade` ➔ `cliente` ➔ `perdido`
- Tags automáticas configuráveis por automação (ex: "Lead Quero", "VIP", "Planilha")
