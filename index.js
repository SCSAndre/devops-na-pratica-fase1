function verificarSaudeServidor(usoCpuPercentual, usoMemoriaPercentual) {
  if (usoCpuPercentual < 0 || usoMemoriaPercentual < 0) {
    throw new Error('Metricas invalidas: valores nao podem ser negativos.');
  }
  if (usoCpuPercentual >= 85 || usoMemoriaPercentual >= 90) {
    return 'CRITICO';
  }
  return 'SAUDAVEL';
}

module.exports = { verificarSaudeServidor };
