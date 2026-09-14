# LDC Public Tunnel Script
# Makes dashboard accessible from ANY device, ANY network, ANY location

$ROOT  = Split-Path -Parent $MyInvocation.MyCommand.Path
$PORT  = 3000
$CFD   = Join-Path $ROOT "cloudflared.exe"

if (-not (Test-Path $CFD)) {
    Write-Host "ERROR: cloudflared.exe not found in $ROOT" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Clear-Host
Write-Host ""
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host "   LAKSHMI DENTAL CARE - Public Access Mode" -ForegroundColor Cyan
Write-Host "   Powered by Cloudflare Quick Tunnels (FREE)" -ForegroundColor Cyan
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Checking if Next.js frontend is running on port $PORT ..." -ForegroundColor White

# Test if server is up
try {
    $test = Invoke-WebRequest -Uri ("http://localhost:" + $PORT) -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "  Frontend server READY" -ForegroundColor Green
} catch {
    Write-Host "  Frontend server on port 3000 does not seem to be running!" -ForegroundColor Red
    Write-Host "  Please run 'npm run dev' in the frontend folder first." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Connecting to Cloudflare network..." -ForegroundColor White
Write-Host "  (Creating a FREE public HTTPS URL - no account needed)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  ================================================" -ForegroundColor DarkGray
Write-Host "   PUBLIC URL will appear below in about 5 seconds" -ForegroundColor Yellow
Write-Host "  ================================================" -ForegroundColor DarkGray
Write-Host ""

# Start cloudflared tunnel process
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName  = $CFD
$psi.Arguments = "tunnel --url http://localhost:$PORT"
$psi.UseShellExecute        = $false
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError  = $true
$psi.CreateNoWindow         = $false

$proc = New-Object System.Diagnostics.Process
$proc.StartInfo = $psi
$proc.Start() | Out-Null

# Read output to find the public URL
$urlFound  = $false
$publicUrl = ""
$deadline  = (Get-Date).AddSeconds(45)

while (-not $urlFound -and (Get-Date) -lt $deadline) {
    if (-not $proc.StandardError.EndOfStream) {
        $line = $proc.StandardError.ReadLine()
        if ($line -ne $null -and $line -match 'https://[a-z0-9\-]+\.trycloudflare\.com') {
            $publicUrl = $matches[0]
            $urlFound  = $true
        }
    }
    Start-Sleep -Milliseconds 300
}

if ($urlFound) {
    Write-Host ""
    Write-Host "  ================================================" -ForegroundColor Green
    Write-Host "       DASHBOARD IS NOW PUBLIC - SHARE THIS:" -ForegroundColor Green
    Write-Host "  ================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  $publicUrl" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  ================================================" -ForegroundColor Green
    Write-Host "  Works on: mobile, tablet, laptop, PC" -ForegroundColor Cyan
    Write-Host "  From:     any WiFi, any city, any state" -ForegroundColor Cyan
    Write-Host "  Requires: this window to stay open" -ForegroundColor Cyan
    Write-Host "  ================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray

    # Save URL to file for easy reference
    $publicUrl | Out-File -FilePath (Join-Path $ROOT "LAST-PUBLIC-URL.txt") -Encoding utf8 -Force
    Write-Host "  (Also saved to: LAST-PUBLIC-URL.txt)" -ForegroundColor DarkGray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "  Could not auto-detect URL. Look above for a line with 'trycloudflare.com'" -ForegroundColor Yellow
    Write-Host ""
}

# Keep running until user presses Ctrl+C
try {
    $proc.WaitForExit()
} catch {
    # Ctrl+C pressed
} finally {
    if (-not $proc.HasExited) {
        $proc.Kill()
    }
    Write-Host ""
    Write-Host "  Tunnel stopped." -ForegroundColor DarkGray
    Read-Host "  Press Enter to exit"
}
