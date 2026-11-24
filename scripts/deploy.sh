#!/usr/bin/env bash
set -euo pipefail

IMAGE="${1:-ghcr.io/scsandre/devops-na-pratica-fase1:latest}"
CONTAINER_NAME="monitor-saude-app"
BACKUP_NAME="monitor-saude-app-backup"
PORT="3000"

echo "[DEPLOY] Iniciando deploy da imagem: ${IMAGE}"
docker pull "${IMAGE}"

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[DEPLOY] Preservando container anterior para possivel rollback..."
  docker rm -f "${BACKUP_NAME}" >/dev/null 2>&1 || true
  docker stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true
  docker rename "${CONTAINER_NAME}" "${BACKUP_NAME}"
fi

echo "[DEPLOY] Subindo novo container..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  --read-only \
  --security-opt no-new-privileges:true \
  -p "${PORT}:3000" \
  "${IMAGE}"

echo "[DEPLOY] Aguardando verificacao de saude (/health)..."
sleep 3
if curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null; then
  echo "[DEPLOY] Sucesso! Aplicacao saudavel na porta ${PORT}."
  docker rm -f "${BACKUP_NAME}" >/dev/null 2>&1 || true
else
  echo "[ERRO] Falha no healthcheck! Executando rollback..."
  docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
  if docker ps -a --format '{{.Names}}' | grep -q "^${BACKUP_NAME}$"; then
    docker rename "${BACKUP_NAME}" "${CONTAINER_NAME}"
    docker start "${CONTAINER_NAME}"
  fi
  exit 1
fi
