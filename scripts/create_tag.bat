@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: Fetch the latest tags from remote
git fetch --tags

:: Get the current version on main (or base branch)
for /f "tokens=*" %%a in ('git describe --tags --abbrev^=0 origin/main') do set current_version=%%a
echo Current version is: %current_version%

:: Remove the "v" prefix if it exists
set current_version=%current_version:v=%

:: Remove any suffix (e.g., "-alpha", "-beta") from the version
for /f "tokens=1 delims=-" %%a in ("%current_version%") do set clean_version=%%a

:: Prompt user for version increment type
echo Select version increment type:
echo 1) Patch
echo 2) Minor
echo 3) Major
set /p version_type=Enter your choice [1-3]:

:: Split the version into major, minor, and patch numbers
for /f "tokens=1,2,3 delims=." %%a in ("%clean_version%") do (
    set major=%%a
    set minor=%%b
    set patch=%%c
)

for /f "tokens=1-3 delims=." %%a in ("%clean_version%") do (
    set major=%%a
    set minor=%%b
    set patch=%%c
)

if not defined major ( echo Error: Invalid version format & exit /b 1 )
if not defined minor ( echo Error: Invalid version format & exit /b 1 )
if not defined patch ( echo Error: Invalid version format & exit /b 1 )

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
echo v%new_tag% > selected_version.txt
echo Version saved to selected_version.txt. Please create a Pull Request.

:: Prompt for release note title with a default value
echo Enter the release title (Press Enter to use default: 🎮 Alpha Release – Early version of the game):
set /p release_title=Title: 

:: If no title is provided, use the default one
if "%release_title%"=="" (
    set "release_title=🎮 Alpha Release – Early version of the game"
)

:: Debug: Print the title to the console
echo(%release_title% > release_note.txt



:: Create the release note
echo **🔧 What's included in this release?** > release_note.txt
echo /p description=Enter the description
echo %description% > release_note.txt

:: Collect Key additions
set key_additions=""
:input_key_additions
set /p user_input=Key addition (or press 'q' to quit): 
if "%user_input%"=="q" goto input_development
echo - %user_input% >> release_note.txt
goto input_key_additions

:: Collect What's still under development
:input_development
echo **🚧 What's still under development?** >> release_note.txt
echo Type each item and press Enter to add to the list. Press 'q' and Enter when done. >> release_note.txt
set dev_items=""
:input_dev
set /p user_input=Development item (or press 'q' to quit): 
if "%user_input%"=="q" goto input_important
echo - %user_input% >> release_note.txt
goto input_dev

:: Collect Important section
:input_important
echo **⚠️ Important!** >> release_note.txt
echo (Default: "This release is primarily for team members and stakeholders to establish a foundation for project management. Some aspects of the infrastructure may evolve as the project progresses.")
set /p important_message=Important message (or press Enter to accept default): 

if "!important_message!"=="" (
    set "important_message=This release is primarily for team members and stakeholders to establish a foundation for project management. Some aspects of the infrastructure may evolve as the project progresses."
)
echo !important_message! >> release_note.txt

:: Final notification
echo Release note has been saved to release_note.txt. Please review the file.

