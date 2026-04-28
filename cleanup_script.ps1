# Plant Name Cleanup Script for PNP Nursery
# This script removes size/batch indicators from plant names

Write-Host "Starting plant name cleanup..."

# Read the JSON file
$jsonPath = "c:\Apps\pnp\src\json\PlantsList.json"
$content = Get-Content $jsonPath -Raw

# Define suffixes to remove
$suffixes = @(
    " - #BnB",
    " - #1",
    " - #2",
    " - #3",
    " - #5",
    " - #7",
    " - #10",
    " - #15",
    " - #20",
    " -#01",
    " -#1",
    " -#2",
    " -#3",
    " -#5",
    " -#7",
    " -#10",
    " -#15",
    " -#20"
)

# Apply replacements
$originalContent = $content
foreach ($suffix in $suffixes) {
    $content = $content -replace [regex]::Escape($suffix), ""
}

# Save the cleaned file
$outputPath = "c:\Apps\pnp\src\json\PlantsList_Cleaned.json"
$content | Out-File $outputPath -Encoding UTF8

# Count changes
$changes = 0
foreach ($suffix in $suffixes) {
    $count = ($originalContent -split [regex]::Escape($suffix)).Count - 1
    if ($count -gt 0) {
        Write-Host "Removed $count instances of '$suffix'"
        $changes += $count
    }
}

Write-Host "Total changes made: $changes"
Write-Host "Cleaned file saved to: $outputPath"
Write-Host ""
Write-Host "To apply the changes, run:"
Write-Host "Copy-Item '$outputPath' '$jsonPath' -Force"