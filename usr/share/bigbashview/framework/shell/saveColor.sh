#!/usr/bin/env bash

if [ ! -e "$HOME/.config/bbv" ]; then
    mkdir "$HOME/.config/bbv"
fi

echo $1 > "$HOME/.config/bbv/bbvColor"
