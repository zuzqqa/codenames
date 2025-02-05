#!/bin/bash

# Fetch the latest tags from remote
git fetch --tags

# Get the current version on main (or base branch)
current_version=$(git describe --tags --abbrev=0 origin/main)
echo "Current version is: $current_version"

# Increment version based on user input
echo "Select version increment type:"
echo "1) Patch"
echo "2) Minor"
echo "3) Major"
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
echo "Selected version: $new_tag"

# Save the selected version to a file instead of creating a tag
echo "$new_tag" > selected_version.txt
echo "Version saved to selected_version.txt. Please create a Pull Request."
