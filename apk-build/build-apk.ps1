$ErrorActionPreference = "Stop"

$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "C:\Program Files\Android\Android Studio\jbr\bin;" + $env:PATH

$sdkDir = "C:\Users\Saidimar Rey\AppData\Local\Android\Sdk"
$buildToolsDir = "$sdkDir\build-tools\34.0.0"
$platformJar = "$sdkDir\platforms\android-34\android.jar"
$jdkBin = "C:\Program Files\Android\Android Studio\jbr\bin"

$aapt2 = "$buildToolsDir\aapt2.exe"
$d8 = "$buildToolsDir\d8.bat"
$zipalign = "$buildToolsDir\zipalign.exe"
$apksigner = "$buildToolsDir\apksigner.bat"
$javac = "$jdkBin\javac.exe"
$keytool = "$jdkBin\keytool.exe"

$workDir = "C:\Users\Saidimar Rey\.gemini\antigravity\scratch\moshi(2) AI\apk-build"
$outputDir = "$workDir\build"

Write-Host "Creating build directories..."
if (Test-Path $outputDir) { Remove-Item -Recurse -Force $outputDir }
New-Item -ItemType Directory -Force -Path "$outputDir\compiled_res", "$outputDir\gen", "$outputDir\classes" | Out-Null

Write-Host "1. Compiling resources with AAPT2..."
& $aapt2 compile --dir "$workDir\res" -o "$outputDir\compiled_res"

Write-Host "2. Linking resources and generating R.java..."
$resFiles = Get-ChildItem "$outputDir\compiled_res\*.flat" | ForEach-Object { $_.FullName }
& $aapt2 link -I $platformJar `
    --manifest "$workDir\AndroidManifest.xml" `
    --java "$outputDir\gen" `
    -A "$workDir\assets" `
    -o "$outputDir\unaligned.apk" `
    --auto-add-overlay `
    $resFiles

Write-Host "3. Compiling Java sources with javac..."
$srcFiles = @(Get-ChildItem -Path "$workDir\src" -Recurse -Filter "*.java" | ForEach-Object { $_.FullName })
$genFiles = @(Get-ChildItem -Path "$outputDir\gen" -Recurse -Filter "*.java" | ForEach-Object { $_.FullName })
$javaSources = @($srcFiles + $genFiles)
& $javac -source 8 -target 8 -cp $platformJar -d "$outputDir\classes" @javaSources

Write-Host "4. Generating classes.dex with D8..."
$classFiles = @(Get-ChildItem -Path "$outputDir\classes" -Recurse -Filter "*.class" | ForEach-Object { $_.FullName })
& $d8 --output "$outputDir" --min-api 21 --lib $platformJar @classFiles

Write-Host "5. Adding classes.dex to APK..."
$zipScript = @"
Add-Type -AssemblyName System.IO.Compression.FileSystem
`$zip = [System.IO.Compression.ZipFile]::Open('$outputDir\unaligned.apk', 'Update')
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(`$zip, '$outputDir\classes.dex', 'classes.dex')
`$zip.Dispose()
"@
Invoke-Expression $zipScript

Write-Host "6. Aligning APK with zipalign..."
& $zipalign -f -p 4 "$outputDir\unaligned.apk" "$outputDir\aligned.apk"

Write-Host "7. Ensuring debug keystore exists..."
$keystore = "$workDir\debug.keystore"
if (-not (Test-Path $keystore)) {
    & $keytool -genkey -v -keystore $keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
}

Write-Host "8. Signing APK with apksigner..."
& $apksigner sign --ks $keystore --ks-pass pass:android --ks-key-alias androiddebugkey --key-pass pass:android --out "$outputDir\FloraAI.apk" "$outputDir\aligned.apk"

Write-Host "9. Verifying signed APK..."
& $apksigner verify "$outputDir\FloraAI.apk"

$destDownloads = "C:\Users\Saidimar Rey\Downloads\FloraAI.apk"
$destPublic = "C:\Users\Saidimar Rey\.gemini\antigravity\scratch\moshi(2) AI\public\FloraAI.apk"

Copy-Item -Force "$outputDir\FloraAI.apk" $destDownloads
Copy-Item -Force "$outputDir\FloraAI.apk" $destPublic

$sizeMb = ((Get-Item $destDownloads).Length / 1MB).ToString("0.0")
Write-Host "=========================================================="
Write-Host "SUCCESS: FloraAI.apk ($sizeMb MB) successfully created!"
Write-Host "Location: $destDownloads"
Write-Host "=========================================================="
