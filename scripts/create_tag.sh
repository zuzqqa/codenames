#!/bin/bash

echo -e "\033[38;5;117m============================="
echo -e "   🚀 GIT TAG CREATOR    "
echo -e "=============================\033[0m"

# Fetch the latest tags from remote
git fetch --tags

# Get the current version on main (or base branch)
current_version=$(git describe --tags --abbrev=0 origin/main)
echo -e "\033[38;5;175mCurrent version is: $current_version"

# Increment version based on user input
echo "Select version increment type:"
echo "1) Patch"
echo "2) Minor"
echo -e "3) Major\033[0m"
read -p "Enter your choice [1-3]: " version_type

# Function to increment version
increment_version() {
    local version=$1
    local type=$2
    IFS='.' read -r major minor patch <<< "$version"

    case $type in
        1) patch=$((patch + 1)) ;;
        2) minor=$((minor + 1)); patch=0 ;;
        3) major=$((major + 1)); minor=0; patch=0 ;;
        *) echo "Invalid version"; exit 1 ;;
    esac

    echo "$major.$minor.$patch"
}

new_version=$(increment_version "$current_version" "$version_type")
new_tag="$new_version-alpha"
echo -e "\033[38;5;186mSelected version: $new_tag"

# Save the selected version to a file instead of creating a tag
echo "$new_tag" > selected_version.txt
echo -e "Version saved to selected_version.txt. Please create a Release Note.\033[0m"

echo -e "\033[38;5;117m============================="
echo -e "   🚀 Release Note Editor    "
echo -e "=============================\033[0m"

# Enter title of the release
echo -e "\033[38;5;175m🎯 Enter the release title (Press Enter to use default: 🎮 Alpha Release – Early version of the game)\033[0m"
read -p "Title: " title

# If the title is not set apply default
if [ -z "$title" ]; then
    title="🎮 Alpha Release – Early version of the game"
fi

# Enter the description of the release
echo -e "\033[38;5;175m🔧 What's included in this release? (Write a short note)\033[0m"
read -p "Description: " description

# Save title, description to the file
echo -e "$title\n**🔧 What's included in this release?**\n$description\n\nKey additions: " > release_note.md

echo -e "\033[38;5;175m📌 What are the key additions in this release?"
echo -e "Type each item and press Enter to add to the list. Press 'q' and Enter when done.\033[0m"

# Enter multiple items
while :
do 
    read -p "➕ Write a key addition (or press 'q' to quit): " addition
    if [ "$addition" = "q" ]; then
        break
    fi
    echo "- $addition" >> release_note.md
done

echo -e "\033[38;5;175m🚧 What's still under development?"
echo -e "Type each item and press Enter to add to the list. Press 'q' and Enter when done.\033[0m"

echo -e "\n**🚧 What's still under development?**" >> release_note.md

# Enter multiple items
while :
do 
    read -p "🔨 Write next line (or press 'q' to quit): " u_dev
    if [ "$u_dev" = "q" ]; then
        break
    fi
    echo "- $u_dev" >> release_note.md
done

echo -e "\n⚠️Important! This version is intended for testers and developers. Please note that the game is not fully functional yet, and some elements may not behave as expected." >> release_note.md

read -e -p $'\033[38;5;186m✅ Good job! One last question, is it a pre-release version? (Y/N) 🚀\033[0m\n' pre_release
pre_release=$(echo "$pre_release" | tr '[:upper:]' '[:lower:]')

if [[ "$pre_release" == "y" ]]; then
    echo -e "\033[38;5;46m✔️ This is a pre-release version! Make a pull request!\033[0m"
    echo -e "\nPRE-RELEASE" >> release_note.md
else
    echo -e "\033[38;5;196m❌ This is NOT a pre-release version! Make a pull request!\033[0m"
fi
