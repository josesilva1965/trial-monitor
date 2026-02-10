# launch.ps1
$ErrorActionPreference = "SilentlyContinue"

Write-Host "Starting Trial Monitor Server..." -ForegroundColor Cyan

# 1. Start npm run dev (Vite) in background and capture the process
$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = "cmd.exe"
$processInfo.Arguments = "/c npm run dev"
$processInfo.WindowStyle = "Hidden" # Hide the black window entirely
$processInfo.UseShellExecute = $true
$npmProcess = [System.Diagnostics.Process]::Start($processInfo)

# Wait for server to be reachable on port 5173
Write-Host "Waiting for server to be ready..." -ForegroundColor Cyan
$maxRetries = 30
$retryCount = 0
$serverReady = $false

while ($retryCount -lt $maxRetries) {
    $conn = Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet
    if ($conn) {
        $serverReady = $true
        break
    }
    Start-Sleep -Seconds 1
    $retryCount++
    Write-Host "." -NoNewline -ForegroundColor DarkGray
}
Write-Host ""

if (-not $serverReady) {
    # Restore window so user can see the error
    $win32::ShowWindow((Get-Host).UI.RawUI.WindowHandle, 9) # 9 = SW_RESTORE
    
    Write-Host "Error: Server failed to start on port 5173." -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    exit
}

Write-Host "Server is ready!" -ForegroundColor Green

Write-Host "Launching App..." -ForegroundColor Green

# 2. Start Edge in App Mode
# Note: msedge often exits the initial process immediately and hands off to the main edge process
# So -Wait doesn't always work. We'll start it and then monitor/wait.
Start-Process msedge -ArgumentList "--app=http://localhost:5173"

# Minimize this PowerShell window automatically to keep desktop clean
$t = '[DllImport("user32.dll")] public static extern bool ShowWindow(int handle, int state);'
$win32 = Add-Type -MemberDefinition $t -Name Win32ShowWindow -Namespace Win32 -PassThru
$win32::ShowWindow((Get-Host).UI.RawUI.WindowHandle, 2) # 2 = SW_SHOWMINIMIZED

Write-Host "App is running! Window is minimized." -ForegroundColor Green
Write-Host "Monitoring for 'Trial Monitor' window..."

# Loop and check if the App window is still open
# We look for a process named 'msedge' (or chrome) that has a MainWindowTitle containing 'Trial Monitor'
while ($true) {
    Start-Sleep -Seconds 2
    
    # Check for Edge/Chrome window with our specific title
    $appWindow = Get-Process | Where-Object { 
        ($_.ProcessName -eq "msedge" -or $_.ProcessName -eq "chrome") -and $_.MainWindowTitle -match "Trial Monitor" 
    }

    # If we found it at least once, we start tracking its closure.
    # But wait, initially it might take a moment to appear.
    # So we only exit if we SEEN it before and NOW it's gone?
    # Or just wait for it to appear first?
    
    # Let's simple wait for it to appear first
    if (-not $startTracking) {
        if ($appWindow) {
            $startTracking = $true
            Write-Host "App Window Detected. Tracking..." -ForegroundColor Cyan
        }
    } else {
        # We are tracking, if it's gone, we exit
        if (-not $appWindow) {
            Write-Host "App Window Closed. Shutting down..." -ForegroundColor Yellow
            break
        }
    }
}

Write-Host "Cleaning up..."

# 3. Kill the specific node/vite processes
# Since we can't easily get the PID of the grandchild node process from cmd, 
# we'll look for node processes running vite/trial-monitor.
# A simpler approach for single-user desktop: Kill all node.exe started recently or by this user?
# Safest 'Kill Switch':
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Also ensure the cmd wrapper is gone if accessible (mostly it closes itself)
if ($npmProcess) {
    Stop-Process -Id $npmProcess.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "Done."
exit
