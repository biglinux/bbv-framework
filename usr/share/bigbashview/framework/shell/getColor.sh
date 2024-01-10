#!/usr/bin/env bash

# Check if the bbvColor file does not exist in the user's config directory
if [ ! -e "$HOME/.config/bbv/bbvColor" ]; then
    # Check if the current desktop environment is KDE
    if [[ "$XDG_CURRENT_DESKTOP" = "KDE" ]]; then
        # Get the background color from the KDE configuration
        bgColor=$(kreadconfig5 --group "Colors:Window" --key BackgroundNormal)

        # Calculate the average value of the RGB components of the background color
        # If the average is greater than 127, consider it as a light color, otherwise consider it as a dark color
        if [ $(((${bgColor//,/+})/3)) -gt 127 ]; then
            echo 'light'
        else
            echo 'dark'
        fi
    fi
else
    # If the bbvColor file exists, read its contents and output them
    echo $(<~/.config/bbv/bbvColor)
fi
