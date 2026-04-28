# Find duplicate plant names in PlantsList.json
$jsonPath = "c:\Apps\pnp\src\json\PlantsList.json"
$plants = Get-Content $jsonPath | ConvertFrom-Json

# Group by Name and find duplicates
$duplicates = $plants | Group-Object -Property Name | Where-Object { $_.Count -gt 1 }

Write-Host "Duplicate Plant Names Found:"
Write-Host "============================"

if ($duplicates.Count -eq 0) {
    Write-Host "No duplicate plant names found!"
} else {
    foreach ($dup in $duplicates) {
        Write-Host "Name: $($dup.Name)"
        Write-Host "Count: $($dup.Count)"
        Write-Host "IDs: $(($dup.Group | Select-Object -ExpandProperty id) -join ', ')"
        Write-Host "---"
    }
}

Write-Host "Total unique plants: $($plants.Count)"
Write-Host "Total duplicates: $($duplicates.Count)"