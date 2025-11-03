# GitHub Actions - Secrets Configuration

Este guia explica como configurar os secrets necessários para os workflows de CI/CD.

## 📋 Secrets Necessários

### Frontend (schedfy_frontend)

Configure em: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

| Secret Name | Description | Example |
|------------|-------------|---------|
| `GCP_PROJECT_ID` | ID do projeto no GCP | `schedfy-production` |
| `GCP_SA_KEY` | Service Account JSON key | `{ "type": "service_account", ... }` |
| `STAGING_API_URL` | URL da API de staging | `https://api-staging.schedfy.com` |
| `PRODUCTION_API_URL` | URL da API de produção | `https://api.schedfy.com` |

### Backend (schedfy_backend)

| Secret Name | Description | Example |
|------------|-------------|---------|
| `GCP_PROJECT_ID` | ID do projeto no GCP | `schedfy-production` |
| `GCP_SA_KEY` | Service Account JSON key | `{ "type": "service_account", ... }` |
| `GCP_SERVICE_ACCOUNT_EMAIL` | Email da Service Account | `schedfy-backend@project.iam.gserviceaccount.com` |
| `FRONTEND_URL` | URL do frontend | `https://app.schedfy.com` |
| `GCS_BUCKET_NAME` | Nome do bucket GCS | `schedfy-storage` |

**Nota:** Secrets sensíveis (MongoDB, JWT, Stripe) devem ser configurados no **Google Secret Manager**, não no GitHub Actions.

## 🔐 Configurar Service Account

### 1. Criar Service Account

```bash
# Criar SA
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions CI/CD"

# Dar permissões
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### 2. Criar e Baixar Key

```bash
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Copiar conteúdo do arquivo
cat github-actions-key.json

# IMPORTANTE: Deletar arquivo local após copiar
rm github-actions-key.json
```

### 3. Adicionar ao GitHub

1. Copie TODO o conteúdo do JSON
2. Vá em: Repository → Settings → Secrets → New repository secret
3. Nome: `GCP_SA_KEY`
4. Value: Cole o JSON completo

## 🔧 Configurar Google Secret Manager

Para dados sensíveis (recomendado):

```bash
# Habilitar API
gcloud services enable secretmanager.googleapis.com

# Criar secrets
echo -n "mongodb+srv://user:pass@cluster.mongodb.net/schedfy" | \
  gcloud secrets create mongodb-uri --data-file=-

echo -n "your-super-secret-jwt-key" | \
  gcloud secrets create jwt-secret --data-file=-

echo -n "sk_live_your-stripe-key" | \
  gcloud secrets create stripe-secret --data-file=-

# Dar permissões à Service Account
gcloud secrets add-iam-policy-binding mongodb-uri \
  --member="serviceAccount:schedfy-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:schedfy-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding stripe-secret \
  --member="serviceAccount:schedfy-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## 🚀 Trigger Deploy

### Automático (Push)

```bash
# Deploy para staging
git push origin main

# Deploy para production
git push origin production
```

### Manual

1. Vá em: Repository → Actions
2. Selecione o workflow
3. Clique em "Run workflow"
4. Selecione a branch

## 🔍 Verificar Status

### Via GitHub UI

1. Repository → Actions
2. Clique no workflow run
3. Ver logs e status

### Via CLI

```bash
# Listar workflows
gh workflow list

# Ver runs
gh run list

# Ver logs
gh run view <run-id> --log
```

## 📊 Monitoramento

### Logs de Deploy

```bash
# Backend
gcloud run services logs tail schedfy-backend --region=us-central1

# Frontend
gcloud run services logs tail schedfy-frontend --region=us-central1
```

### Status dos Serviços

```bash
# Listar serviços
gcloud run services list --region=us-central1

# Detalhes
gcloud run services describe schedfy-backend --region=us-central1
gcloud run services describe schedfy-frontend --region=us-central1
```

## 🐛 Troubleshooting

### Erro: "Permission denied"

**Solução:** Verificar permissões da Service Account

```bash
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions@*"
```

### Erro: "Secret not found"

**Solução:** Criar o secret no Secret Manager e dar permissões

```bash
# Listar secrets
gcloud secrets list

# Ver permissões
gcloud secrets get-iam-policy mongodb-uri
```

### Erro: "Image not found"

**Solução:** Verificar se a imagem foi enviada ao GCR

```bash
gcloud container images list
gcloud container images list-tags gcr.io/YOUR_PROJECT_ID/schedfy-backend
```

## 🔄 Rollback

Se algo der errado, faça rollback para versão anterior:

```bash
# Listar revisões
gcloud run revisions list --service=schedfy-backend --region=us-central1

# Rollback
gcloud run services update-traffic schedfy-backend \
  --to-revisions=schedfy-backend-00001-abc=100 \
  --region=us-central1
```

## 📚 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud Run CI/CD](https://cloud.google.com/run/docs/continuous-deployment)
- [Secret Manager Best Practices](https://cloud.google.com/secret-manager/docs/best-practices)
