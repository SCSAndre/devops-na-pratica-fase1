# DevOps na Prática — Fases 1 e 2

Repositório referente às entregas das **Fases 1 e 2** da disciplina **DevOps na Prática**.

## Arquitetura e Estrutura do Projeto
- `index.js` e `index.test.js`: Regras de saúde de servidores e 4 testes unitários nativos (Fase 1).
- `server.js` e `server.test.js`: Servidor HTTP nativo com endpoints `/health`, `/metrics` (Prometheus), logs estruturados em JSON e testes de integração (Fase 2).
- `infra/main.tf`: Provisionamento declarativo AWS com Terraform (EC2 Ubuntu 24.04 LTS + Security Group).
- `Dockerfile` e `docker-compose.yml`: Containerização segura (`node:22-alpine`, usuário `node`, `HEALTHCHECK`) e orquestração local com Prometheus (`monitoring/prometheus.yml`).
- `k8s/`: Manifestos Kubernetes (`deployment.yaml` e `service.yaml`) com probes e `securityContext`.
- `scripts/`: Scripts automatizados de deploy com verificação de saúde e rollback (`deploy.sh` e `deploy.ps1`).
- `.github/workflows/ci.yml`: Pipeline completo de **CI/CD + DevSecOps** (Testes, Terraform, Trivy, Smoke Test e entrega automática no GitHub Container Registry).
