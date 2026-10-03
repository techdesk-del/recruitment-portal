@echo off
setlocal enabledelayedexpansion
title Installing UrbanGaon Work Suite on Desktop...
echo ========================================================
echo       Setting up UrbanGaon Apps on Desktop...
echo ========================================================
echo.
echo Please wait a moment...

set "PSTMP=%TEMP%\urbangaon_suite_install.ps1"
powershell.exe -ExecutionPolicy Bypass -NoProfile -Command "$f = '%~f0'; $raw = [System.IO.File]::ReadAllText($f); $m = '###POWERSHELL' + '_START###'; $idx = $raw.LastIndexOf($m); if ($idx -ge 0) { [System.IO.File]::WriteAllText($env:PSTMP, $raw.Substring($idx + $m.Length).Trim()) }"
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%PSTMP%"
if exist "%PSTMP%" del /f /q "%PSTMP%" >nul 2>&1

echo.
echo ========================================================
echo  UrbanGaon Apps successfully installed on Desktop!
echo.
echo  Folder Location: Desktop\UrbanGaon\
echo    [1] UrbanGaon ATS
echo    [2] Social Pulse Dashboard
echo ========================================================
echo.
pause
exit /b

###POWERSHELL_START###
[System.Reflection.Assembly]::LoadWithPartialName('System.Drawing') | Out-Null
$appData = Join-Path $env:LOCALAPPDATA 'UrbanGaon'
if (-not (Test-Path $appData)) { New-Item -ItemType Directory -Path $appData -Force | Out-Null }
$pngPath = Join-Path $appData 'icon.png'
$icoPath = Join-Path $appData 'urbangaon.ico'

# 1. Download official UrbanGaon icon from live web app
try {
    Invoke-WebRequest -Uri 'https://recruitment-portal-rose.vercel.app/urbangaon-icon.png' -OutFile $pngPath -UseBasicParsing -TimeoutSec 15
} catch {
    Write-Host "Warning: Could not fetch icon from online, checking fallback..."
}

# 2. Build crisp multi-resolution ICO (16, 32, 48, 64, 128, 256)
if (Test-Path $pngPath) {
    try {
        $srcImg = [System.Drawing.Image]::FromFile($pngPath)
        $sizes = @(16, 32, 48, 64, 128, 256)
        $bitmaps = @()

        foreach ($s in $sizes) {
            $bmp = New-Object System.Drawing.Bitmap($s, $s)
            $g = [System.Drawing.Graphics]::FromImage($bmp)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $g.DrawImage($srcImg, 0, 0, $s, $s)
            $g.Dispose()
            $bitmaps += $bmp
        }

        $ms = New-Object System.IO.MemoryStream
        $bw = New-Object System.IO.BinaryWriter($ms)
        $bw.Write([UInt16]0)
        $bw.Write([UInt16]1)
        $bw.Write([UInt16]$sizes.Count)

        $offset = 6 + ($sizes.Count * 16)
        $pngStreams = @()

        foreach ($b in $bitmaps) {
            $pMs = New-Object System.IO.MemoryStream
            $b.Save($pMs, [System.Drawing.Imaging.ImageFormat]::Png)
            $pngStreams += $pMs
        }

        for ($i = 0; $i -lt $sizes.Count; $i++) {
            $s = $sizes[$i]
            $len = $pngStreams[$i].Length
            $wb = if ($s -eq 256) { [byte]0 } else { [byte]$s }
            $bw.Write($wb)
            $bw.Write($wb)
            $bw.Write([byte]0)
            $bw.Write([byte]0)
            $bw.Write([UInt16]1)
            $bw.Write([UInt16]32)
            $bw.Write([UInt32]$len)
            $bw.Write([UInt32]$offset)
            $offset += $len
        }

        foreach ($pMs in $pngStreams) {
            $bytes = $pMs.ToArray()
            $bw.Write($bytes, 0, $bytes.Length)
            $pMs.Dispose()
        }

        [System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())
        $bw.Dispose()
        $ms.Dispose()
        foreach ($b in $bitmaps) { $b.Dispose() }
        $srcImg.Dispose()
    } catch {
        Write-Host "Icon generator note: $_"
    }
}

# 3. Create 'UrbanGaon' Folder on Desktop
$desktop = [Environment]::GetFolderPath('Desktop')
$suiteFolder = Join-Path $desktop 'UrbanGaon'
if (-not (Test-Path $suiteFolder)) {
    New-Item -ItemType Directory -Path $suiteFolder -Force | Out-Null
}

# Optional: Set the official UrbanGaon icon for the Desktop folder itself
try {
    if (Test-Path $icoPath) {
        $iniPath = Join-Path $suiteFolder 'desktop.ini'
        $iniContent = "[.ShellClassInfo]`r`nIconResource=$icoPath,0`r`n[ViewState]`r`nMode=`r`nVid=`r`nFolderType=Generic`r`n"
        if (Test-Path $iniPath) {
            attrib -h -s -r $iniPath
        }
        [System.IO.File]::WriteAllText($iniPath, $iniContent, [System.Text.Encoding]::Unicode)
        attrib +h +s $iniPath
        attrib +r $suiteFolder
    }
} catch {}

# Find Google Chrome or Microsoft Edge
$chromePaths = @(
    'C:\Program Files\Google\Chrome\Application\chrome.exe',
    'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    (Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe')
)
$edgePaths = @(
    'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
)

$browserExe = $null
foreach ($cp in $chromePaths) {
    if (Test-Path $cp) { $browserExe = $cp; break }
}
if (-not $browserExe) {
    foreach ($ep in $edgePaths) {
        if (Test-Path $ep) { $browserExe = $ep; break }
    }
}

$wsh = New-Object -ComObject WScript.Shell

# 4. Create Shortcut 1: UrbanGaon ATS (Inside Desktop\UrbanGaon)
$atsLnkPath = Join-Path $suiteFolder 'UrbanGaon ATS.lnk'
$atsShortcut = $wsh.CreateShortcut($atsLnkPath)
if ($browserExe) {
    $atsShortcut.TargetPath = $browserExe
    $atsShortcut.Arguments = '--app=https://recruitment-portal-rose.vercel.app/'
} else {
    $atsShortcut.TargetPath = 'https://recruitment-portal-rose.vercel.app/'
}
$atsShortcut.Description = 'UrbanGaon ATS - Unified Recruitment Portal'
$atsShortcut.WorkingDirectory = [Environment]::GetFolderPath('UserProfile')
if (Test-Path $icoPath) {
    $atsShortcut.IconLocation = "$icoPath,0"
}
$atsShortcut.Save()

# 5. Create Shortcut 2: Social Pulse Dashboard (Inside Desktop\UrbanGaon)
$spLnkPath = Join-Path $suiteFolder 'Social Pulse Dashboard.lnk'
$spShortcut = $wsh.CreateShortcut($spLnkPath)
if ($browserExe) {
    $spShortcut.TargetPath = $browserExe
    $spShortcut.Arguments = '--app=https://social-pulse-dashboard-drab.vercel.app/'
} else {
    $spShortcut.TargetPath = 'https://social-pulse-dashboard-drab.vercel.app/'
}
$spShortcut.Description = 'Social Pulse - Weekly Performance Dashboard'
$spShortcut.WorkingDirectory = [Environment]::GetFolderPath('UserProfile')
if (Test-Path $icoPath) {
    $spShortcut.IconLocation = "$icoPath,0"
}
$spShortcut.Save()

# 6. Clean up any loose individual shortcuts from outside Desktop to keep Desktop neat
$outsideAts = Join-Path $desktop 'UrbanGaon ATS.lnk'
if (Test-Path $outsideAts) { Remove-Item $outsideAts -Force }

$outsideSp = Join-Path $desktop 'Social Pulse Dashboard.lnk'
if (Test-Path $outsideSp) { Remove-Item $outsideSp -Force }

# 7. Refresh Desktop Icon Cache
try {
    & ie4uinit.exe -show
} catch {}
