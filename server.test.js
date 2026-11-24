const test = require('node:test');
const assert = require('node:assert');
const { createAppServer } = require('./server.js');

test('Integracao HTTP: rotas /health, /metrics e 404', async (t) => {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(() => server.close());

  await t.test('GET /health retorna status 200 e payload JSON valido', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(['SAUDAVEL', 'CRITICO'].includes(body.status));
    assert.strictEqual(typeof body.usoMemoriaPercentual, 'number');
  });

  await t.test('GET /metrics retorna metricas no formato Prometheus', async () => {
    const res = await fetch(`${baseUrl}/metrics`);
    const text = await res.text();
    assert.strictEqual(res.status, 200);
    assert.match(text, /app_http_requests_total/);
    assert.match(text, /server_memory_usage_percent/);
  });

  await t.test('GET /inexistente retorna status 404', async () => {
    const res = await fetch(`${baseUrl}/inexistente`);
    assert.strictEqual(res.status, 404);
  });
});
