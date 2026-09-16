# =============================================
# LAKSHMI DENTAL CARE — Network HTTP Server
# Serves index.html to any device on your LAN
# =============================================
# FIRST RUN: Double-click or right-click > Run with PowerShell
# It will auto-request Administrator if needed.
# =============================================

# Self-elevate if not already admin
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")) {
    $args = "-NoExit -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    Start-Process powershell -Verb RunAs -ArgumentList $args
    exit
}

$PORT = 8080
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# Get local WiFi/LAN IP
$localIP = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.*' } |
    Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LAKSHMI DENTAL CARE - Network Server  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Serving: $ROOT" -ForegroundColor White
Write-Host ""
Write-Host "  [PC/Laptop]     http://127.0.0.1:$PORT" -ForegroundColor Green
if ($localIP) {
    Write-Host "  [Mobile/Tablet] http://${localIP}:$PORT" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Open the YELLOW URL on any device on the same WiFi!" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

# MIME types
$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$PORT/")
if ($localIP) {
    $listener.Prefixes.Add("http://${localIP}:$PORT/")
}

try {
    $listener.Start()
    Write-Host "  Server is LIVE!" -ForegroundColor Green
    Write-Host ""

    while ($listener.IsListening) {
        $ctx     = $listener.GetContext()
        $req     = $ctx.Request
        $res     = $ctx.Response
        $urlPath = $req.Url.LocalPath

        # Default to index.html for root
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }

        $filePath = Join-Path $ROOT ($urlPath.TrimStart('/').Replace('/', '\'))

        if (Test-Path $filePath -PathType Leaf) {
            $ext      = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mimeType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
            $bytes    = [System.IO.File]::ReadAllBytes($filePath)

            $res.ContentType     = $mimeType
            $res.ContentLength64 = $bytes.Length
            $res.StatusCode      = 200
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "  [200] $urlPath" -ForegroundColor DarkGray
        } else {
            $body = [System.Text.Encoding]::UTF8.GetBytes("404 - File not found: $urlPath")
            $res.StatusCode = 404
            $res.OutputStream.Write($body, 0, $body.Length)
            Write-Host "  [404] $urlPath" -ForegroundColor Red
        }

        $res.OutputStream.Close()
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
} finally {
    if ($listener.IsListening) { $listener.Stop() }
    Write-Host ""
    Write-Host "  Server stopped." -ForegroundColor DarkGray
}
