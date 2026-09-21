[System.Reflection.Assembly]::LoadWithPartialName("System.Drawing") | Out-Null

$src = Join-Path (Get-Location) "public\urbangaon-icon.png"
$dest192 = Join-Path (Get-Location) "public\pwa-192.png"
$dest512 = Join-Path (Get-Location) "public\pwa-512.png"

function Resize-Image($sourcePath, $destinationPath, $width, $height) {
    $img = [System.Drawing.Image]::FromFile($sourcePath)
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $width, $height)
    $bmp.Save($destinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $img.Dispose()
}

Resize-Image $src $dest192 192 192
Resize-Image $src $dest512 512 512
Write-Output "PWA Icons generated successfully!"
