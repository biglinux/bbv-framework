#!/usr/bin/env bash

minimizeButton="
                <a id=\"minimize-btn\" onclick=\"windowControl.minimize()\">
                    <div class=\"window-control-btn-box\">
                        <div class=\"window-control-btn\">
                            <img class=\"window-control-btn-img\" src=\"$(geticons window-minimize-symbolic 2>/dev/null)\">
                        </div>
                    </div>
                </a>
"

maximizeButton="
                <a id=\"maximize-btn\" onclick=\"windowControl.maximize()\">
                    <div class=\"window-control-btn-box\">
                        <div id=\"maximize-btn-image\" class=\"window-control-btn\">
                            <!-- This icon is managed by javascript to change from maximize and restore -->
                            <img class=\"window-control-btn-img\" src=\"$(geticons window-maximize-symbolic 2>/dev/null)\">
                        </div>
                    </div>
                </a>
"

closeButton="
                <a id=\"close-btn\" onclick=\"windowControl.close()\">
                    <div class=\"window-control-btn-box\">
                        <div class=\"window-control-btn\">
                            <img class=\"window-control-btn-img\" src=\"$(geticons window-close-symbolic 2>/dev/null)\">
                        </div>
                    </div>
                </a>
"

if [[ $XDG_CURRENT_DESKTOP != 'KDE' ]]; then

    if grep -q ':.*close' <(gsettings get org.gnome.desktop.wm.preferences button-layout); then
        buttonsRight='IAX'
    else
        buttonsLeft='XIA'
    fi

else
    # Execute command to obtain left-side button configuration
    buttonsLeft=$(kreadconfig6 --group "org.kde.kdecoration2" --key "ButtonsOnLeft" --file "$HOME/.config/kwinrc")

    # Execute command to obtain right-side button configuration
    buttonsRight=$(kreadconfig6 --group "org.kde.kdecoration2" --key "ButtonsOnRight" --file "$HOME/.config/kwinrc")
fi


# Hide window buttons in KDE maximized window if kwin using this configuration
if [[ $XDG_CURRENT_DESKTOP == 'KDE' ]] && grep -q 'BorderlessMaximizedWindows=true' ~/.config/kwinrc; then

    echo "<style>
    #window-controls-right.maximized-mode-window-control-right { display: none; }
    #window-controls-left.maximized-mode-window-control-left { display: none; }
</style>"

fi

if [[ "$buttonsLeft" =~ [XAI] ]]; then

    echo '<div id="window-controls-left" class="window-controls no-drag">'

    # Iterate over each character in the left-side configuration string
    for (( i=0; i<${#buttonsLeft}; i++ )); do
    char=${buttonsLeft:$i:1} # Extract the current character
    
    # Check the character and print its function if it's X, I, or A
    case $char in
        X) echo "$closeButton" ;;
        A) echo "$maximizeButton" ;;
        I) echo "$minimizeButton" ;;
    esac
    done

    echo "</div>"
fi

if [[ "$buttonsRight" =~ [XAI] ]]; then
    echo '<div id="window-controls-right" class="window-controls no-drag">'
    # Iterate over each character in the right-side configuration string
    for (( i=0; i<${#buttonsRight}; i++ )); do
    char=${buttonsRight:$i:1} # Extract the current character
    
    # Check the character and print its function if it's X, I, or A
    case $char in
        X) echo "$closeButton" ;;
        A) echo "$maximizeButton" ;;
        I) echo "$minimizeButton" ;;
    esac
    done

    echo '</div>'
fi

if gsettings get org.gnome.desktop.interface color-scheme | grep -q dark; then

echo '<style>
.window-control-btn-img {
    filter: contrast(0) brightness(5);
}
.window-control-btn {
    background-color: #ffffff18;
}
.window-control-btn:hover {
    background-color: #ffffff22;
}
</style>'
fi
