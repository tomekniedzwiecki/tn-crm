<#
  mgmt-q.ps1 - helper for Supabase Management API /database/query (SQL without MCP).
  Token sbp_* from Windows Credential Manager (target "Supabase CLI:supabase", blob UTF-8 offset 40).

  Usage:
    powershell -File scripts/mgmt-q.ps1 -Ref <project-ref> -Query "select 1"
    powershell -File scripts/mgmt-q.ps1 -Ref <project-ref> -File path/to/query.sql
    ... -Raw   # return raw JSON instead of a table

  Returns JSON array of rows (UTF-8). Single statements (multi-statement may 400).
  ASCII-only source on purpose: PS 5.1 -File misreads UTF-8 bytes as ANSI (0x94 -> quote) and breaks parsing.
#>
param(
  [Parameter(Mandatory=$true)][string]$Ref,
  [string]$Query,
  [string]$File,
  [switch]$Raw
)
$ErrorActionPreference = 'Stop'

if (-not $Query -and $File) { $Query = [IO.File]::ReadAllText($File) }
if (-not $Query) { Write-Error "Provide -Query or -File"; exit 2 }

Add-Type -Namespace Cred -Name Native -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("advapi32.dll", CharSet=System.Runtime.InteropServices.CharSet.Unicode, SetLastError=true)]
public static extern bool CredRead(string target, int type, int flags, out System.IntPtr credential);
[System.Runtime.InteropServices.DllImport("advapi32.dll")]
public static extern void CredFree(System.IntPtr cred);
'@
$ptr = [IntPtr]::Zero
if (-not [Cred.Native]::CredRead("Supabase CLI:supabase", 1, 0, [ref]$ptr)) {
  Write-Error "CredRead failed - missing target 'Supabase CLI:supabase' (run: npx supabase login)"; exit 2
}
try {
  $size = [System.Runtime.InteropServices.Marshal]::ReadInt32($ptr, 32)
  $blob = [System.Runtime.InteropServices.Marshal]::ReadIntPtr($ptr, 40)
  $bytes = New-Object byte[] $size
  [System.Runtime.InteropServices.Marshal]::Copy($blob, $bytes, 0, $size)
  $token = [Text.Encoding]::UTF8.GetString($bytes)
} finally { [Cred.Native]::CredFree($ptr) }

$uri = "https://api.supabase.com/v1/projects/$Ref/database/query"
$payload = @{ query = $Query } | ConvertTo-Json -Compress -Depth 10
$bodyBytes = [Text.Encoding]::UTF8.GetBytes($payload)
try {
  $resp = Invoke-WebRequest -Uri $uri -Method Post -Body $bodyBytes `
    -ContentType 'application/json; charset=utf-8' `
    -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing -UserAgent "tn-mgmt-q/1.0"
} catch {
  $r = $_.Exception.Response
  if ($r) {
    $sr = New-Object IO.StreamReader($r.GetResponseStream())
    $errBody = $sr.ReadToEnd()
    Write-Error ("HTTP " + [int]$r.StatusCode + ": " + $errBody)
  } else { Write-Error $_.Exception.Message }
  exit 1
}
$text = [Text.Encoding]::UTF8.GetString($resp.RawContentStream.ToArray())
if ($Raw) { Write-Output $text; exit 0 }
try {
  $rows = $text | ConvertFrom-Json
  $n = @($rows).Count
  Write-Output ("rows: " + $n)
  if ($n -gt 0) { $rows | Format-Table -AutoSize | Out-String -Width 400 | Write-Output }
} catch { Write-Output $text }
exit 0
