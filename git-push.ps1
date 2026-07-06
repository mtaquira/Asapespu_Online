$ConfirmPreference = 'None'
cd "c:\Users\JD_MSI\Documents\Proyectos Asapespu\Asapespu_Online"
git add proxy.conf.json angular.json "src/environments/environment.ts"
git commit -m "Add proxy config for dev CORS bypass" -q
git push
Write-Host "Push completado"
