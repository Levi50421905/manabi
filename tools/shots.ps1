param(
  [string]$Base = "http://localhost:3100",
  [string]$Out = "G:\Projects\manabi\.design-review",
  [string]$Prefix = "shot",
  [string[]]$Pages = @("/"),
  [ValidateSet("desktop", "tablet", "mobile")]
  [string]$Viewport = "desktop",
  [int]$Height = 0,
  # Mode iframe: lebar viewport dipaksa persis, mis. "390x844" atau "390x844,834x1112".
  # Chrome di Windows menolak window lebih sempit dari 500px, jadi mode ini
  # diperlukan untuk QA mobile yang jujur.
  [string]$Frames = "",
  # Skema warna yang dipaksa: light | dark | system (Windows headless defaultnya gelap).
  [ValidateSet("light", "dark", "system")]
  [string]$Scheme = "system"
)

$chrome = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) { Write-Error "Chrome tidak ditemukan"; exit 1 }
New-Item -ItemType Directory -Force -Path $Out | Out-Null

$sizes = @{ desktop = @(1440, 1000); tablet = @(834, 1112); mobile = @(390, 844) }
$schemeFlag = switch ($Scheme) { "light" { "--blink-settings=preferredColorScheme=1" } "dark" { "--blink-settings=preferredColorScheme=2" } default { "" } }
$index = 0

function Slug([string]$path) {
  $slug = ($path -replace '^/', '' -replace '/', '-')
  if ([string]::IsNullOrWhiteSpace($slug)) { return "home" }
  return $slug
}

if ([string]::IsNullOrWhiteSpace($Frames)) {
  $w = $sizes[$Viewport][0]
  $h = if ($Height -gt 0) { $Height } else { $sizes[$Viewport][1] }

  foreach ($page in $Pages) {
    $index++
    $name = "$Prefix-$(Slug $page)-$Viewport"
    $profile = Join-Path $env:TEMP "dsh-shot-$Prefix-$Viewport-$index"
    & $chrome --headless=new --disable-gpu --no-first-run --no-default-browser-check `
      --disable-crash-reporter --hide-scrollbars --force-device-scale-factor=1 $schemeFlag `
      --user-data-dir="$profile" --window-size="$w,$h" `
      --screenshot="$Out\$name.png" --virtual-time-budget=9000 "$Base$page" 2>&1 | Out-Null
    if (Test-Path "$Out\$name.png") {
      Write-Output "OK   $name.png  (w=$w)"
    } else {
      Write-Output "FAIL $name.png  ($page)"
    }
  }
  return
}

# ---- Mode iframe ----
$specs = $Frames.Split(",") | ForEach-Object { $_.Trim() }
$totalW = 16
$maxH = 0
foreach ($spec in $specs) {
  $parts = $spec.Split("x")
  $totalW += [int]$parts[0] + 16
  $maxH = [Math]::Max($maxH, [int]$parts[1])
}
$windowH = $maxH + 60

# Chrome di Windows tidak bisa membuat window lebih sempit dari ~500 CSS px,
# jadi viewport mobile jujur diperoleh dengan me-render halaman di dalam <iframe>
# selebar yang diminta. Viewer-nya ditulis sementara ke public/ lalu dihapus lagi
# supaya tidak ada file QA yang ikut ke bundle produksi.
$appRoot = Join-Path (Split-Path -Parent $PSScriptRoot) "apps\web"
$qaDir = Join-Path $appRoot "public\_qa"
$qaFile = Join-Path $qaDir "view.html"
$qaHtml = @'
<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#fff}
.row{display:flex;gap:16px;padding:16px;align-items:flex-start}
.cap{font:600 11px/1 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#8a8578;margin-bottom:8px}
iframe{border:1px solid #ddd;display:block;background:#fff}
</style></head><body><div class="row" id="row"></div><script>
const p=new URLSearchParams(location.search);
const target=p.get("page")||"/";
const frames=(p.get("frames")||"390x844").split(",");
const row=document.getElementById("row");
for(const spec of frames){
  const [w,h]=spec.split("x").map(Number);
  const col=document.createElement("div");
  const cap=document.createElement("div");cap.className="cap";cap.textContent=w+" x "+h;
  const f=document.createElement("iframe");f.width=w||390;f.height=h||844;f.src=target;
  col.appendChild(cap);col.appendChild(f);row.appendChild(col);
}
</script></body></html>
'@

New-Item -ItemType Directory -Force -Path $qaDir | Out-Null
Set-Content -LiteralPath $qaFile -Value $qaHtml -Encoding UTF8

try {
  foreach ($page in $Pages) {
    $index++
    $name = "$Prefix-$(Slug $page)-frames"
    $profile = Join-Path $env:TEMP "dsh-frame-$Prefix-$index"
    $encFrames = [uri]::EscapeDataString($Frames)
    $encPage = [uri]::EscapeDataString($page)
    $url = "$Base/_qa/view.html?page=$encPage&frames=$encFrames"
    & $chrome --headless=new --disable-gpu --no-first-run --no-default-browser-check `
      --disable-crash-reporter --hide-scrollbars --force-device-scale-factor=1 $schemeFlag `
      --user-data-dir="$profile" --window-size="$totalW,$windowH" `
      --screenshot="$Out\$name.png" --virtual-time-budget=12000 $url 2>&1 | Out-Null
    if (Test-Path "$Out\$name.png") {
      Write-Output "OK   $name.png  (window=$totalW,$windowH frames=$Frames)"
    } else {
      Write-Output "FAIL $name.png  ($page)"
    }
  }
} finally {
  Remove-Item -LiteralPath $qaDir -Recurse -Force -ErrorAction SilentlyContinue
}

