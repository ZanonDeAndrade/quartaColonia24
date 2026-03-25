param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,
  [string]$ServiceName = 'quarta-colonia',
  [string]$Region = 'southamerica-east1',
  [string]$ImageName = 'quarta-colonia'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Assert-Command {
  param([string]$CommandName)

  if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $CommandName"
  }
}

function Invoke-Gcloud {
  param([string[]]$Arguments)

  & gcloud @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "gcloud command failed: gcloud $($Arguments -join ' ')"
  }
}

function Get-HttpStatus {
  param([string]$Url)

  $curlCommand = if (Get-Command curl.exe -ErrorAction SilentlyContinue) { 'curl.exe' } else { 'curl' }
  $status = & $curlCommand -s -o NUL -w "%{http_code}" $Url
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to call $Url"
  }

  return "$status".Trim()
}

Assert-Command 'gcloud'

$imageUri = "gcr.io/$ProjectId/$ImageName"

Write-Host "Building container image with Dockerfile: $imageUri"
Invoke-Gcloud @('builds', 'submit', '.', "--tag=$imageUri", "--project=$ProjectId")

Write-Host "Deploying image to Cloud Run service: $ServiceName"
Invoke-Gcloud @(
  'run',
  'deploy',
  $ServiceName,
  "--image=$imageUri",
  "--region=$Region",
  '--platform=managed',
  '--allow-unauthenticated',
  "--project=$ProjectId"
)

$serviceUrl = (& gcloud run services describe $ServiceName "--region=$Region" "--project=$ProjectId" '--format=value(status.url)').Trim()
if (-not $serviceUrl) {
  throw 'Failed to resolve deployed Cloud Run service URL.'
}

Write-Host "Validating deployed endpoints at: $serviceUrl"
$healthStatus = Get-HttpStatus "$serviceUrl/health"
$newsStatus = Get-HttpStatus "$serviceUrl/api/news"

if ($healthStatus -ne '200') {
  throw "Healthcheck validation failed: /health returned $healthStatus"
}

if ($newsStatus -ne '200') {
  throw "API validation failed: /api/news returned $newsStatus"
}

Write-Host "Cloud Run deployment finished successfully."
Write-Host "Service URL: $serviceUrl"
Write-Host "/health status: $healthStatus"
Write-Host "/api/news status: $newsStatus"
