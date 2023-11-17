#!/usr/bin/env bash

if [ ! -e "$HOME/.config/bbv/bbvColor" ]; then
    if [[ "$XDG_CURRENT_DESKTOP" = "KDE" ]]; then
        bgColor=$(kreadconfig5 --group "Colors:Window" --key BackgroundNormal)

        if [ $(((${bgColor//,/+})/3)) -gt 127 ]; then
            echo 'light'
        else
            echo 'dark'
        fi
    fi
else
	echo $(<~/.config/bbv/bbvColor)
fi
