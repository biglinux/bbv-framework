document.addEventListener('DOMContentLoaded', function () {
    new QWebChannel(qt.webChannelTransport, function (channel) {
        window.windowControl = channel.objects.windowControl;

        // Sets up a listener for window state changes
        windowControl.windowStateChanged.connect(function (state) {
            updatePageStyle(state);
        });

        // Checks the initial window state
        windowControl.isMaximized(function (maximized) {
            updatePageStyle(maximized ? 'maximized' : 'normal');
        });

        // Variables for double-click detection
        let lastClickTime = 0;
        disableDragArea = false;
        const doubleClickDelay = 300; // Tempo máximo em milissegundos entre cliques para ser considerado um clique duplo
        // Maybe use in future if qtwayland double click fixed // Adds a double-click event listener on the title bar to toggle window state
        // Maybe use in future if qtwayland double click fixed // var titleBar = document.getElementById('title-bar');
        // Maybe use in future if qtwayland double click fixed // titleBar.addEventListener('dblclick', function () {
        // Maybe use in future if qtwayland double click fixed //     window.windowControl.maximize(); // Calls the method to maximize or restore the window
        // Maybe use in future if qtwayland double click fixed // });

        // Start workaround for qtwayland bug with double click
        // Adds a mousedown event listener on the title bar
        var titleBar = document.getElementById('title-bar');
        titleBar.addEventListener('mousedown', function (event) {
            const currentTime = new Date().getTime();
            const timeSinceLastClick = currentTime - lastClickTime;

            if (timeSinceLastClick < doubleClickDelay) {
                // Clique duplo detectado
                window.windowControl.maximize(); // Calls the method to maximize or restore the window
                disableDragArea = true;
                setTimeout(() => {
                    disableDragArea = false;
                }, 300);
            }
            lastClickTime = currentTime;
        });
        // End workaround for maximize window with double click
    });
    function updatePageStyle(state) {
        var page = document.getElementById('page');
        var body = document.body;
        var windowControlsRight = document.getElementById('window-controls-right');
        var windowControlsLeft = document.getElementById('window-controls-left');
        var windowControls = document.querySelector('.window-controls');
        var maximize = document.querySelector('#maximize-btn-image');
        var right = document.getElementById('right');

        if (state === 'maximized') {
            // Adds the specific class and removing others
            page?.classList.add('maximized-mode');
            body?.classList.add('maximized-mode');
            page?.classList.remove('normal-mode');
            body?.classList.remove('normal-mode');
            windowControlsRight?.classList.add('maximized-mode-window-control-right');
            windowControlsLeft?.classList.add('maximized-mode-window-control-left');
            windowControlsRight?.classList.remove('window-controls');
            windowControlsLeft?.classList.remove('window-controls');
            right?.classList.add('maximized-mode-window-control-right');
            right?.classList.remove('normal-mode');
            canResize = false;
            if (maximize) { maximize.innerHTML = `<img class="window-control-btn-img" src="<?include bash RUST_BACKTRACE=0 geticons --no-fallbacks window-restore-symbolic | head -n1 ?>">`; }
        } else {
            // Adds the specific class and removing others
            page?.classList.add('normal-mode');
            body?.classList.add('normal-mode');
            page?.classList.remove('maximized-mode');
            body?.classList.remove('maximized-mode');
            right?.classList.add('normal-mode');
            right?.classList.remove('maximized-mode-window-control-right');
            windowControlsRight?.classList.remove('maximized-mode-window-control-right');
            windowControlsLeft?.classList.remove('maximized-mode-window-control-left');
            windowControlsRight?.classList.add('window-controls');
            windowControlsLeft?.classList.add('window-controls');
            canResize = true;
            if (maximize) { maximize.innerHTML = `<img class="window-control-btn-img" src="<?include bash RUST_BACKTRACE=0 geticons --no-fallbacks window-maximize-symbolic | head -n1 ?>">`; }
        }
    }

    // Moves the window when a draggable area is pressed
    document.addEventListener('mousedown', function (event) {
        let dragArea = event.target.closest('.drag-area');

        if (dragArea && event.target === dragArea) {
            // Calculates if the click was within the visible content dimensions
            let withinVisibleWidth = event.clientX < (dragArea.getBoundingClientRect().left + dragArea.clientWidth);
            let withinVisibleHeight = event.clientY < (dragArea.getBoundingClientRect().top + dragArea.clientHeight);

            // If the click was not within the visible dimensions, it may be on the scrollbar
            let possiblyOnScrollbar = !withinVisibleWidth || !withinVisibleHeight;

            if (!possiblyOnScrollbar && !disableDragArea) {
                // Here, you call your 'moveWindow' method from your 'windowControl' object in Python
                window.windowControl.moveWindow();
            }
        }
    });

    // Changes the cursor based on mouse position
    window.addEventListener('mousemove', function (event) {
        reevaluateCursor(event);
    });

    function reevaluateCursor(event) {
        if (!canResize) {
            if (document.documentElement.style.cursor !== 'default') {
                document.documentElement.style.cursor = 'default';
            }
            return;
        }

        const resizeRegion = detectResizeRegion(event);
        updateCursorStyle(resizeRegion);
    }

    function updateCursorStyle(region) {
        let newCursorStyle = 'default';
        switch (region) {
            case 'top-left':
            case 'bottom-right':
                newCursorStyle = 'nwse-resize';
                break;
            case 'top-right':
            case 'bottom-left':
                newCursorStyle = 'nesw-resize';
                break;
            case 'top':
            case 'bottom':
                newCursorStyle = 'ns-resize';
                break;
            case 'left':
            case 'right':
                newCursorStyle = 'ew-resize';
                break;
        }

        // Directly applying the cursor style can help enforce the update
        if (document.documentElement.style.cursor !== newCursorStyle) {
            document.documentElement.style.cursor = newCursorStyle;
        }
    }

    document.documentElement.addEventListener('mousedown', function (event) {
        const detectedRegion = detectResizeRegion(event);
        if (detectedRegion && canResize) {
            windowControl.resizeWindowBy(detectedRegion);
        }
    });

    function detectResizeRegion(event) {
        const cornerThreshold = 20; // Increases the sensitive area size for corners
        const edgeThreshold = 15; // Keeps a smaller area for edges
        const { clientX, clientY } = event;
        const { innerWidth, innerHeight } = window;

        const nearTopEdge = clientY < edgeThreshold;
        const nearBottomEdge = innerHeight - clientY < edgeThreshold;
        const nearLeftEdge = clientX < edgeThreshold;
        const nearRightEdge = innerWidth - clientX < edgeThreshold;

        const nearTopCorner = clientY < cornerThreshold;
        const nearBottomCorner = innerHeight - clientY < cornerThreshold;
        const nearLeftCorner = clientX < cornerThreshold;
        const nearRightCorner = innerWidth - clientX < cornerThreshold;

        // Checks corners first for priority over edges
        if (nearTopCorner && nearLeftCorner) return 'top-left';
        if (nearTopCorner && nearRightCorner) return 'top-right';
        if (nearBottomCorner && nearLeftCorner) return 'bottom-left';
        if (nearBottomCorner && nearRightCorner) return 'bottom-right';

        // Checks edges
        if (nearTopEdge) return 'top';
        if (nearBottomEdge) return 'bottom';
        if (nearLeftEdge) return 'left';
        if (nearRightEdge) return 'right';
    }
});

// Selects the div with the class 'window-controls-left'
var windowControlsLeft = document.querySelector('#window-controls-left');

// Checks if the div exists
if (windowControlsLeft) {
    // Gets the height of the div
    var height = windowControlsLeft.offsetHeight + 5;

    // Selects the div with the id 'left'
    var leftDiv = document.getElementById('left');

    // Checks if the 'left' div exists
    if (leftDiv) {
        // Applies the height of the 'window-controls-left' div as the top margin on the 'left' div
        leftDiv.style.marginTop = height + 'px';
    }
}
