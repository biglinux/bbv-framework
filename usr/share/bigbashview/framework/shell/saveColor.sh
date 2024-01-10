#!/usr/bin/env bash

# Check if the directory ~/.config/bbv exists
# If it doesn't exist, create it
if [ ! -e "$HOME/.config/bbv" ]; then
    mkdir "$HOME/.config/bbv"
fi

# Save the value of the first argument ($1) to the file ~/.config/bbv/bbvColor
echo $1 > "$HOME/.config/bbv/bbvColor"
