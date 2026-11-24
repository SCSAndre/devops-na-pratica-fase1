FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY index.js server.js ./

# Boa pratica DevSecOps: executar container com usuario nao-privilegiado
RUN chown -R node:node /app
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
