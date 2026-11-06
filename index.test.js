const test = require('node:test');
const assert = require('node:assert');
const { verificarSaudeServidor } = require('./index.js');

test('Deve retornar SAUDAVEL quando CPU e Memoria estiverem dentro do limite', () => {
  assert.strictEqual(verificarSaudeServidor(45, 60), 'SAUDAVEL');
});

test('Deve retornar CRITICO quando o uso de CPU atingir ou ultrapassar 85%', () => {
  assert.strictEqual(verificarSaudeServidor(85, 50), 'CRITICO');
});

test('Deve retornar CRITICO quando o uso de Memoria atingir ou ultrapassar 90%', () => {
  assert.strictEqual(verificarSaudeServidor(50, 92), 'CRITICO');
});

test('Deve lancar erro caso receba metricas negativas', () => {
  assert.throws(() => verificarSaudeServidor(-10, 50), {
    message: 'Metricas invalidas: valores nao podem ser negativos.'
  });
});
