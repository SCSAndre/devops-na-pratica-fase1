const http = require('node:http');
const os = require('node:os');
const { verificarSaudeServidor } = require('./index.js');

const PORT = process.env.PORT || 3000;
let totalRequests = 0;

function coletarMetricasSistema() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usoMemoriaPercentual = Number((((totalMem - freeMem) / totalMem) * 100).toFixed(2));
  const loadAvg1m = os.loadavg()[0] || 0;
  const cpuCount = os.cpus().length || 1;
  const usoCpuPercentual = Number(Math.min((loadAvg1m / cpuCount) * 100, 100).toFixed(2));
  const status = verificarSaudeServidor(usoCpuPercentual, usoMemoriaPercentual);

  return {
    status,
    usoCpuPercentual,
    usoMemoriaPercentual,
    uptimeSegundos: Math.floor(process.uptime())
  };
}

function logEstruturado(level, mensagem, dados = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    mensagem,
    ...dados
  }));
}

function createAppServer() {
  return http.createServer((req, res) => {
    const inicio = Date.now();
    totalRequests += 1;

    if (req.url === '/health' && req.method === 'GET') {
      const dados = coletarMetricasSistema();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(dados));
    } else if (req.url === '/metrics' && req.method === 'GET') {
      const dados = coletarMetricasSistema();
      const prometheusOutput = [
        '# HELP app_http_requests_total Total de requisicoes HTTP recebidas',
        '# TYPE app_http_requests_total counter',
        `app_http_requests_total ${totalRequests}`,
        '# HELP server_cpu_usage_percent Percentual estimado de uso de CPU',
        '# TYPE server_cpu_usage_percent gauge',
        `server_cpu_usage_percent ${dados.usoCpuPercentual}`,
        '# HELP server_memory_usage_percent Percentual de uso de memoria',
        '# TYPE server_memory_usage_percent gauge',
        `server_memory_usage_percent ${dados.usoMemoriaPercentual}`,
        '# HELP app_uptime_seconds Tempo de atividade da aplicacao em segundos',
        '# TYPE app_uptime_seconds gauge',
        `app_uptime_seconds ${dados.uptimeSegundos}`
      ].join('\n') + '\n';

      res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
      res.end(prometheusOutput);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ erro: 'Rota nao encontrada' }));
    }

    logEstruturado('INFO', 'Requisicao processada', {
      metodo: req.method,
      rota: req.url,
      statusCode: res.statusCode,
      duracaoMs: Date.now() - inicio
    });
  });
}

if (require.main === module) {
  const server = createAppServer();
  server.listen(PORT, '0.0.0.0', () => {
    logEstruturado('INFO', 'Servidor de monitoramento iniciado', { porta: PORT });
  });
}

module.exports = { createAppServer, coletarMetricasSistema };
