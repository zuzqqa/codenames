#!/bin/bash

git fetch --tags

current_version=$(git describe --tags --abbrev=0 origin/main)
echo "Current version is: $current_version"

base_version=$(echo "$current_version" | sed 's/-alpha//')

echo "Current base version is: $base_version"

echo "Select the type of version increment:"
echo "1) Patch"
echo "2) Minor"
echo "3) Major"
read -p "Enter your choice [1-3]: " version_type

increment_version() {
    local version=$1
    local type=$2
    IFS='.' read -r major minor patch <<< "$version"

    case $type in
        1)
            patch=$((patch + 1)) 
            ;;
        2)
            minor=$((minor + 1))
            patch=0 
            ;;
        3)
            major=$((major + 1)) 
            minor=0 
            patch=0 
            ;;
        *)
            echo "Invalid version type"
            exit 1
            ;;
    esac

    echo "$major.$minor.$patch"
}

new_version=$(increment_version "$base_version" "$version_type")
echo "New version will be: $new_version"

new_tag="$new_version-alpha"
echo "Creating local tag: $new_tag"
git tag $new_tag

echo "Tag $new_tag has been created locally."
echo "Please push your changes and create a Pull Request to main."
echo "Once the Pull Request is merged, the new tag will be pushed to the repository."
