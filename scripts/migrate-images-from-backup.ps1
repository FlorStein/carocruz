param(
  [Parameter(Mandatory = $true)]
  [string]$BackupPath,

  [string]$OutputDir = "assets/products",
  [string]$MapPath = "github-image-map.js"
)

$ErrorActionPreference = "Stop"

function Get-SafeId {
  param([string]$Value)
  $safe = ($Value -replace '[^a-zA-Z0-9._-]', '_').Trim('_')
  if ([string]::IsNullOrWhiteSpace($safe)) { return $null }
  return $safe
}

function Get-ExtensionFromContentType {
  param([string]$ContentType, [string]$FallbackUrl)
  if ($ContentType -match 'png') { return '.png' }
  if ($ContentType -match 'jpe?g') { return '.jpg' }
  if ($ContentType -match 'gif') { return '.gif' }
  if ($ContentType -match 'webp') { return '.webp' }
  $path = ([uri]$FallbackUrl).AbsolutePath
  $ext = [System.IO.Path]::GetExtension($path)
  if ($ext -match '^\.(png|jpe?g|gif|webp)$') { return $ext.ToLowerInvariant() }
  return '.webp'
}

function Add-ItemWithId {
  param($Collection, [object]$Item, [string]$FallbackId)
  if ($null -eq $Item) { return }
  $id = [string]$Item.id
  if ([string]::IsNullOrWhiteSpace($id)) { $id = $FallbackId }
  $imagen = [string]$Item.imagen
  if ([string]::IsNullOrWhiteSpace($id) -or [string]::IsNullOrWhiteSpace($imagen)) { return }
  $Collection.Add([PSCustomObject]@{
    id = $id
    imagen = $imagen
  }) | Out-Null
}

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$backup = Get-Content -Raw -LiteralPath $BackupPath | ConvertFrom-Json
$items = [System.Collections.Generic.List[object]]::new()

if ($backup.productos_admin) {
  foreach ($item in $backup.productos_admin) {
    Add-ItemWithId -Collection $items -Item $item -FallbackId ""
  }
}

if ($backup.productos_overrides) {
  foreach ($prop in $backup.productos_overrides.PSObject.Properties) {
    Add-ItemWithId -Collection $items -Item $prop.Value -FallbackId $prop.Name
  }
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$map = [ordered]@{}
$seen = @{}
$downloaded = 0
$embedded = 0
$skipped = 0
$failed = 0

foreach ($item in $items) {
  $safeId = Get-SafeId $item.id
  if (-not $safeId -or $seen.ContainsKey($safeId)) {
    $skipped++
    continue
  }
  $seen[$safeId] = $true

  $imagen = [string]$item.imagen
  try {
    if ($imagen -match '^data:image/([^;]+);base64,(.+)$') {
      $kind = $Matches[1].ToLowerInvariant()
      $ext = if ($kind -eq 'jpeg') { '.jpg' } else { ".$kind" }
      if ($ext -notmatch '^\.(png|jpg|gif|webp)$') { $ext = '.webp' }
      $relative = "$OutputDir/$safeId$ext"
      $bytes = [Convert]::FromBase64String($Matches[2])
      if ($bytes.Length -le 0) { throw "Data URL vacia" }
      [System.IO.File]::WriteAllBytes((Join-Path $root $relative), $bytes)
      $map[$item.id] = $relative.Replace('\', '/')
      $embedded++
      continue
    }

    if ($imagen -match '^https?://') {
      $resp = Invoke-WebRequest -Uri $imagen -UseBasicParsing -TimeoutSec 45
      if ($resp.StatusCode -lt 200 -or $resp.StatusCode -ge 300) { throw "HTTP $($resp.StatusCode)" }
      $contentType = [string]$resp.Headers['Content-Type']
      if ($contentType -notmatch '^image/') { throw "No es imagen: $contentType" }
      $ext = Get-ExtensionFromContentType -ContentType $contentType -FallbackUrl $imagen
      $relative = "$OutputDir/$safeId$ext"
      if ($resp.RawContentStream) {
        $ms = New-Object System.IO.MemoryStream
        $resp.RawContentStream.CopyTo($ms)
        [System.IO.File]::WriteAllBytes((Join-Path $root $relative), $ms.ToArray())
        $ms.Dispose()
      } else {
        [System.IO.File]::WriteAllBytes((Join-Path $root $relative), $resp.Content)
      }
      $map[$item.id] = $relative.Replace('\', '/')
      $downloaded++
      continue
    }

    $skipped++
  } catch {
    $failed++
    Write-Warning "No se pudo migrar $($item.id): $($_.Exception.Message)"
  }
}

$lines = @(
  "// Generado por scripts/migrate-images-from-backup.ps1",
  "// Mapa: id_producto -> imagen local servida por GitHub Pages",
  "window.GITHUB_IMAGE_MAP = {"
)

$pairs = foreach ($key in $map.Keys) {
  "  " + ($key | ConvertTo-Json -Compress) + ": " + ($map[$key] | ConvertTo-Json -Compress)
}

$lines += ($pairs -join ",`n")
$lines += "};"
Set-Content -LiteralPath $MapPath -Value ($lines -join "`n") -Encoding UTF8

[PSCustomObject]@{
  Total = $items.Count
  Migradas = $map.Count
  Descargadas = $downloaded
  Embebidas = $embedded
  Omitidas = $skipped
  Fallidas = $failed
  Mapa = $MapPath
  Carpeta = $OutputDir
}
