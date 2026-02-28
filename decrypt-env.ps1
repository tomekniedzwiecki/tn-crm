# Decrypt .env file from .env.encrypted (PowerShell)
# Usage: .\decrypt-env.ps1

& "C:\Program Files\Git\usr\bin\openssl.exe" enc -aes-256-cbc -d -pbkdf2 -in .env.encrypted -out .env
Write-Host "Done! .env file created."
