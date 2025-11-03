# Schedfy Frontend - Docker & GCP Deployment Guide

Este guia explica como fazer deploy do frontend Schedfy no Google Cloud Platform usando Cloud Run.

## 📋 Pré-requisitos

1. **Google Cloud Platform:**

   - Conta GCP ativa
   - Projeto criado
   - Billing habilitado
   - gcloud CLI instalado

2. **Docker:**

   - Docker instalado localmente
   - Docker Hub ou GCR account

3. **Variáveis de Ambiente:**
   - Backend URL configurado

## 🏗️ Arquitetura

```
Frontend (React + Vite)
├── Dockerfile (produção)
├── Dockerfile.dev (desenvolvimento)
├── nginx.conf (servidor web)
└── .dockerignore
```

## 🚀 Deploy Local com Docker

### Build da imagem:

```bash
# Build da imagem de produção
docker build -t schedfy-frontend:latest .

# Ou build de desenvolvimento
docker build -f Dockerfile.dev -t schedfy-frontend:dev .
```

### Executar localmente:

```bash
# Produção
docker run -p 8080:80 \
  -e VITE_API_URL=http://localhost:3001 \
  schedfy-frontend:latest

# Desenvolvimento (com hot-reload)
docker run -p 5173:5173 \
  -v $(pwd)/src:/app/src \
  schedfy-frontend:dev
```

Acesse: http://localhost:8080

## ☁️ Deploy no GCP Cloud Run

### 1. Configurar gcloud CLI

```bash
# Login
gcloud auth login

# Configurar projeto
gcloud config set project YOUR_PROJECT_ID

# Habilitar APIs necessárias
gcloud services enable \
  run.googleapis.com \
  containerregistry.googleapis.com \
  cloudbuild.googleapis.com
```

### 2. Build e Push para GCR

```bash
# Configurar Docker para GCR
gcloud auth configure-docker

# Tag da imagem
export PROJECT_ID=$(gcloud config get-value project)
export IMAGE_TAG="gcr.io/$PROJECT_ID/schedfy-frontend:latest"

# Build e push
docker build -t $IMAGE_TAG .
docker push $IMAGE_TAG
```

### 3. Deploy no Cloud Run

```bash
# Deploy básico
gcloud run deploy schedfy-frontend \
  --image=$IMAGE_TAG \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=80 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars="VITE_API_URL=https://your-backend-url.run.app"

# Deploy com variáveis customizadas
gcloud run deploy schedfy-frontend \
  --image=$IMAGE_TAG \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=80 \
  --memory=512Mi \
  --cpu=1 \
  --set-env-vars="^@^VITE_API_URL=https://api.schedfy.com@VITE_APP_ENV=production"
```

### 4. Configurar Domínio Customizado (Opcional)

```bash
# Mapear domínio
gcloud run domain-mappings create \
  --service=schedfy-frontend \
  --domain=app.schedfy.com \
  --region=us-central1

# Verificar mapeamento
gcloud run domain-mappings list --region=us-central1
```

## 🔧 Configuração de Variáveis de Ambiente

### Durante o Build (build-time):

As variáveis `VITE_*` são embedadas durante o build. Configure no Dockerfile:

```dockerfile
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
```

Build com argumentos:

```bash
docker build \
  --build-arg VITE_API_URL=https://api.schedfy.com \
  -t schedfy-frontend:latest .
```

### No Cloud Run (runtime):

```bash
gcloud run services update schedfy-frontend \
  --set-env-vars="VITE_API_URL=https://api.schedfy.com" \
  --region=us-central1
```

## 📊 Monitoramento

### Logs:

```bash
# Ver logs em tempo real
gcloud run services logs tail schedfy-frontend \
  --region=us-central1 \
  --follow

# Logs das últimas 24h
gcloud run services logs read schedfy-frontend \
  --region=us-central1 \
  --limit=100
```

### Métricas:

```bash
# Ver métricas
gcloud run services describe schedfy-frontend \
  --region=us-central1 \
  --format="value(status)"
```

## 💰 Custos Estimados

**Cloud Run (Frontend):**

- Free tier: 2 milhões de requests/mês
- CPU: $0.00002400 por vCPU-second
- Memory: $0.00000250 per GiB-second
- Requests: $0.40 per million

**Estimativa para 10,000 usuários/mês:**

- ~500,000 requests
- ~10 GiB-hours de memória
- **Total: ~$3-5/mês** 🎉

## 🔒 Segurança

### 1. HTTPS Automático

Cloud Run fornece HTTPS automaticamente com certificado gerenciado.

### 2. CORS

Configure no backend, não no frontend.

### 3. Environment Variables

Nunca commite `.env` com valores reais:

```bash
# .gitignore
.env
.env.local
.env.production
```

## 🚀 CI/CD com GitHub Actions

Ver arquivo `.github/workflows/deploy-frontend.yml` para configuração de deploy automático.

## 🧪 Testes

### Testar build localmente:

```bash
# Build
docker build -t schedfy-frontend:test .

# Run
docker run -p 8080:80 schedfy-frontend:test

# Verificar
curl http://localhost:8080
```

### Testar nginx:

```bash
# Verificar sintaxe
docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro nginx nginx -t
```

## 🔍 Troubleshooting

### Erro: "502 Bad Gateway"

**Causa:** Nginx não consegue servir os arquivos.

**Solução:**

```bash
# Verificar se os arquivos foram copiados
docker run --rm schedfy-frontend:latest ls -la /usr/share/nginx/html
```

### Erro: "VITE_API_URL is undefined"

**Causa:** Variáveis não foram passadas durante o build.

**Solução:**

```bash
# Rebuild com variáveis
docker build --build-arg VITE_API_URL=https://api.schedfy.com -t schedfy-frontend .
```

### Erro: "Cloud Run deployment failed"

**Causa:** Imagem não foi enviada ao GCR ou permissões faltando.

**Solução:**

```bash
# Verificar imagem
gcloud container images list

# Verificar permissões
gcloud projects get-iam-policy YOUR_PROJECT_ID
```

## 📚 Recursos Úteis

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🔄 Rollback

```bash
# Listar revisões
gcloud run revisions list --service=schedfy-frontend --region=us-central1

# Rollback para revisão anterior
gcloud run services update-traffic schedfy-frontend \
  --to-revisions=schedfy-frontend-00001-abc=100 \
  --region=us-central1
```

## 📈 Escala Automática

Cloud Run escala automaticamente de 0 a 10 instâncias (configurável):

```bash
# Configurar limites
gcloud run services update schedfy-frontend \
  --min-instances=1 \
  --max-instances=100 \
  --concurrency=80 \
  --cpu-throttling \
  --region=us-central1
```

## 🎯 Next Steps

1. Configurar domínio customizado
2. Configurar CDN (Cloud CDN) para assets estáticos
3. Configurar monitoramento com Cloud Monitoring
4. Configurar alertas
5. Configurar backup/disaster recovery
