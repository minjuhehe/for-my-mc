param(
    [Parameter(Mandatory=$true)][string]$JdkBin,
    [Parameter(Mandatory=$true)][string]$ProtocolLibJar,
    [Parameter(Mandatory=$true)][string]$SpigotApiJar,
    [Parameter(Mandatory=$true)][string]$OutputDirectory
)
$ErrorActionPreference = 'Stop'
$classes = Join-Path $OutputDirectory 'classes'
New-Item -ItemType Directory -Force -Path $classes | Out-Null
& (Join-Path $JdkBin 'javac.exe') --release 21 -cp "$ProtocolLibJar;$SpigotApiJar" -d $classes (Get-ChildItem (Join-Path $PSScriptRoot 'src/net/lostsky/worth/*.java') | Select-Object -ExpandProperty FullName)
if ($LASTEXITCODE -ne 0) { throw 'Compilation failed' }
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'plugin.yml') -Destination (Join-Path $classes 'plugin.yml')
& (Join-Path $JdkBin 'jar.exe') --create --file (Join-Path $OutputDirectory 'LostSkyWorth.jar') -C $classes .
if ($LASTEXITCODE -ne 0) { throw 'Packaging failed' }
