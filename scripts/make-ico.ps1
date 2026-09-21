[System.Reflection.Assembly]::LoadWithPartialName("System.Drawing") | Out-Null

$srcPath = Join-Path (Get-Location) "public\urbangaon-icon.png"
$appDataDir = Join-Path $env:LOCALAPPDATA "UrbanGaon"
if (-not (Test-Path $appDataDir)) {
    New-Item -ItemType Directory -Path $appDataDir -Force | Out-Null
}
$icoPath = Join-Path $appDataDir "urbangaon.ico"
$projIcoPath = Join-Path (Get-Location) "public\favicon.ico"

# Load source image
$srcImg = [System.Drawing.Image]::FromFile($srcPath)

# Standard Windows icon sizes
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

# Write multi-size ICO binary format
$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)

# ICO Header
$bw.Write([UInt16]0) # Reserved
$bw.Write([UInt16]1) # Type 1 = ICO
$bw.Write([UInt16]$sizes.Count) # Number of images

$offset = 6 + ($sizes.Count * 16)
$pngStreams = @()

foreach ($bmp in $bitmaps) {
    $pngMs = New-Object System.IO.MemoryStream
    $bmp.Save($pngMs, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngStreams += $pngMs
}

for ($i = 0; $i -lt $sizes.Count; $i++) {
    $s = $sizes[$i]
    $pngLen = $pngStreams[$i].Length
    
    $wByte = if ($s -eq 256) { [byte]0 } else { [byte]$s }
    $hByte = if ($s -eq 256) { [byte]0 } else { [byte]$s }
    
    $bw.Write($wByte) # Width
    $bw.Write($hByte) # Height
    $bw.Write([byte]0) # Colors
    $bw.Write([byte]0) # Reserved
    $bw.Write([UInt16]1) # Planes
    $bw.Write([UInt16]32) # Bits per pixel
    $bw.Write([UInt32]$pngLen) # Size
    $bw.Write([UInt32]$offset) # Offset
    
    $offset += $pngLen
}

foreach ($pngMs in $pngStreams) {
    $pngBytes = $pngMs.ToArray()
    $bw.Write($pngBytes, 0, $pngBytes.Length)
    $pngMs.Dispose()
}

$icoBytes = $ms.ToArray()
[System.IO.File]::WriteAllBytes($icoPath, $icoBytes)
[System.IO.File]::WriteAllBytes($projIcoPath, $icoBytes)

$bw.Dispose()
$ms.Dispose()
foreach ($bmp in $bitmaps) { $bmp.Dispose() }
$srcImg.Dispose()

Write-Output "Generated multi-resolution ICO at: $icoPath"

# Now create/update Desktop Shortcut
$desktopPath = [Environment]::GetFolderPath("Desktop")

# Remove old .url if exists so there is only one clean, official app shortcut
$oldUrl = Join-Path $desktopPath "UrbanGaon ATS.url"
if (Test-Path $oldUrl) { Remove-Item -Path $oldUrl -Force }

$shortcutPath = Join-Path $desktopPath "UrbanGaon ATS.lnk"
$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)

# Prefer Chrome if available, else Edge
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if (Test-Path $chrome) {
    $shortcut.TargetPath = $chrome
    $shortcut.Arguments = "--app=https://recruitment-portal-rose.vercel.app/"
} elseif (Test-Path $edge) {
    $shortcut.TargetPath = $edge
    $shortcut.Arguments = "--app=https://recruitment-portal-rose.vercel.app/"
} else {
    $shortcut.TargetPath = "https://recruitment-portal-rose.vercel.app/"
}

$shortcut.Description = "UrbanGaon ATS - Unified Recruitment Portal"
$shortcut.IconLocation = "$icoPath,0"
$shortcut.WorkingDirectory = [Environment]::GetFolderPath("UserProfile")
$shortcut.Save()

# Also update the .url version in project so user can share it
$urlFileContent = @"
[{000214A0-0000-0000-C000-000000000046}]
Prop3=19,11
[InternetShortcut]
IDList=
URL=https://recruitment-portal-rose.vercel.app/
IconFile=$icoPath
IconIndex=0
HotKey=0
"@
$urlProject = Join-Path (Get-Location) "UrbanGaon ATS.url"
Set-Content -Path $urlProject -Value $urlFileContent -Encoding ASCII

# Restart Windows Icon Cache Explorer so it refreshes immediately
Write-Output "Shortcut successfully created on Desktop with custom icon!"
