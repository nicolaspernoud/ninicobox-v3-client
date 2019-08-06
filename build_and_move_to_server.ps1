npm run build
Remove-Item -Recurse -Force $PSScriptRoot\..\ninicobox-v3-server\web -Exclude package.json
Move-Item -Force -Path $PSScriptRoot\dist\* -Destination $PSScriptRoot\..\ninicobox-v3-server\web
