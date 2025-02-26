@echo off
setlocal enabledelayedexpansion

:: Fetch the latest tags from remote
git fetch --tags

:: Get the current version on main (or base branch)
for /f "tokens=*" %%a in ('git describe --tags --abbrev^=0 origin/main') do set current_version=%%a
echo Current version is: %current_version%

:: Increment version based on user input
echo Select version increment type:
echo 1) Patch
echo 2) Minor
echo 3) Major
set /p version_type=Enter your choice [1-3]:

:: Divide version into parts
for /f "tokens=1,2,3 delims=." %%a in (%current_version%) do (
    set major=%%a
    set minor=%%b
    set patch=%%c
)

:: Function to increment version
if "%version_type%"=="1" (
    set /a patch+=1
) else if "%version_type%"=="2" (
    set /a minor+=1
    set patch=0
) else if "%version_type%"=="3" (
    set /a major+=1
    set minor=0
    set patch=0
) else (
    echo Invalid version
    exit /b 1
)

:: Crete new tag
set new_version=%major%.%minor%.%patch%
set new_tag=%new_version%-alpha
echo Selected version: %new_tag%

:: Save the selected version to a file instead of creating a tag
echo %new_tag% > selected_version.txt
echo Version saved to selected_version.txt. Please create a Pull Request.