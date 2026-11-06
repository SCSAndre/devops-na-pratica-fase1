# DevOps na Prática — Fase 1: Configuração e Automação Inicial

Repositório referente à entrega da Fase 1 da disciplina **DevOps na Prática**.

## Estrutura do Projeto
- `index.js` e `index.test.js`: Módulo da aplicação e suíte de testes unitários automatizados.
- `.github/workflows/ci.yml`: Pipeline de Integração Contínua (GitHub Actions) que executa os testes automatizados e valida os scripts de IaC.
- `infra/main.tf`: Script Terraform para provisionamento de infraestrutura na AWS (EC2 Ubuntu 24.04 LTS + Security Group).
