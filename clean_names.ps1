$content = Get-Content "c:\Apps\pnp\src\json\PlantsList.json"
$cleaned = $content | ForEach-Object {
    $_ -replace ' - #BnB', '' `
       -replace ' - #1', '' `
       -replace ' - #2', '' `
       -replace ' - #3', '' `
       -replace ' - #5', '' `
       -replace ' - #7', '' `
       -replace ' - #10', '' `
       -replace ' - #15', '' `
       -replace ' - #20', '' `
       -replace ' -#01', '' `
       -replace ' -#1', '' `
       -replace ' -#2', '' `
       -replace ' -#3', '' `
       -replace ' -#5', '' `
       -replace ' -#7', '' `
       -replace ' -#10', '' `
       -replace ' -#15', '' `
       -replace ' -#20', ''
}
$cleaned | Out-File "c:\Apps\pnp\src\json\PlantsList_Cleaned.json" -Encoding UTF8
Write-Host "Cleaning completed"