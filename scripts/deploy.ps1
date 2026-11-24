param(
    [string]$Image = "ghcr.io/scsandre/devops-na-pratica-fase1:latest",
    [switch]$LocalBuild
)

$ErrorActionPreference = "Stop"
$ContainerName = "monitor-saude-app"
$BackupName = "monitor-saude-app-backup"
$Port = 3000

if ($LocalBuild) {
    Write-Host "[DEPLOY] Construindo imagem localmente: $Image"
    docker build -t $Image .
} else {
    Write-Host "[DEPLOY] Baixando imagem do registro: $Image"
    docker pull $Image
}

$existing = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $ContainerName }
if ($existing) {
    Write-Host "[DEPLOY] Preservando container anterior para rollback..."
    $oldBackup = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $BackupName }
    if ($oldBackup) { docker rm -f $BackupName | Out-Null }
    docker stop $ContainerName | Out-Null
    docker rename $ContainerName $BackupName | Out-Null
}

Write-Host "[DEPLOY] Subindo novo container..."
docker run -d `
    --name $ContainerName `
    --restart unless-stopped `
    --read-only `
    --security-opt no-new-privileges:true `
    -p "${Port}:3000" `
    $Image | Out-Null

Start-Sleep -Seconds 3
$healthy = $false
try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:${Port}/health" -TimeoutSec 5
    Write-Host "[DEPLOY] Sucesso! Status da aplicacao: $($response.status)"
    $healthy = $true
} catch {
    Write-Warning "[ERRO] Healthcheck falhou. Executando rollback..."
}

if ($healthy) {
    $backup = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $BackupName }
    if ($backup) { docker rm -f $BackupName | Out-Null }
} else {
    docker rm -f $ContainerName | Out-Null
    $backup = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $BackupName }
    if ($backup) {
        docker rename $BackupName $ContainerName | Out-Null
        docker start $ContainerName | Out-Null
    }
    exit 1
}
