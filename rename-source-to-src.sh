#!/bin/bash

# This script renames the 'source' directory to 'src' and updates all references

# Check if the source directory exists
if [ ! -d "source" ]; then
  echo "Error: source directory not found!"
  exit 1
fi

# Check if src directory already exists
if [ -d "src" ]; then
  echo "Error: src directory already exists. Please remove it first."
  exit 1
fi

# Rename the directory
echo "Renaming 'source' directory to 'src'..."
mv source src

echo "Directory renamed successfully!"
echo "Please remember to run the following commands to apply all config changes:"
echo "  yarn install"
echo "  yarn build:chrome"

echo "Done!" 