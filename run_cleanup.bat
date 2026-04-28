@echo off
echo Starting plant name cleanup...
powershell.exe -ExecutionPolicy Bypass -File "c:\Apps\pnp\cleanup_script.ps1"
echo.
echo If the cleanup was successful, run this command to apply changes:
echo Copy-Item "c:\Apps\pnp\src\json\PlantsList_Cleaned.json" "c:\Apps\pnp\src\json\PlantsList.json" -Force
pause