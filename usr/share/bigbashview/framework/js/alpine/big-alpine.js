// Alpine listeners
document.addEventListener("alpine:init", async () => {
    // Existing 'fetchjson' magic method for fetching and returning a specific item from JSON
    Alpine.magic("fetchjson", () => {
        return async (url, jsonItem = null, method = "GET") => {
            let response = await xfetch(
                (url = url),
                (jsonItem = jsonItem),
                (method = method)
            );
            return response;
        };
    });

    // Existing 'fetch' magic method for fetching and returning text
    Alpine.magic("fetch", () => {
        return async (url, method = "GET") => {
            let response = await xfetch(
                (url = url),
                (jsonItem = null),
                (method = method)
            );
            return response;
        };
    });

    // New 'fetchCompleteJson' magic method for fetching and returning complete JSON
    Alpine.magic("fetchCompleteJson", () => {
        return async (url, method = "GET") => {
            let response = await xfetchCompleteJson(url, method);
            return response;
        };
    });

    // Magic method to load a component from a URL and initialize it
    Alpine.magic("loadComponent", () => {
        return async (url, target) => {
            const response = await fetch(url);
            const text = await response.text();
            document.querySelector(target).innerHTML = text;
            Alpine.initializeComponent(document.querySelector(target));
        };
    });

    // Function to check if the result of a URL is 'active'
    Alpine.magic("isActive", () => {
        return async (url) => {
            try {
                const response = await fetch(url);
                const text = await response.text();
                return text.trim().toLowerCase() === "true";
            } catch (error) {
                console.error("Fail to verify isActive:", error);
                return false;
            }
        };
    });

    // Define a global function to check the 'active' state
    isActive = function (alpineComponent, url) {
        fetch(url)
            .then((response) => response.text())
            .then((text) => {
                alpineComponent.active = text.trim();
            })
            .catch((error) => {
                console.error("Fail to verify isActive:", error);
                return false;
            });
    };

    // Loop through all elements with the 'component' attribute
    document.querySelectorAll("[component]").forEach(async (component) => {
        const componentName = component.getAttribute("component");
        const jsonFile = component.getAttribute("load-json");

        let response = await fetch(`components/${componentName}.html`);
        let componentHtml = "";

        if (!response.ok) {
            // Try to load the component from the alternative path if not found in the first one
            response = await fetch(
                `/usr/share/bigbashview/framework/component/${componentName}.html`
            );
        }

        if (response.ok) {
            componentHtml = await response.text();

            if (jsonFile) {
                const jsonData = await fetch(jsonFile).then((res) => res.json());
                component.innerHTML = componentHtml;
                Alpine.addScopeToNode(component, jsonData, Alpine.reactive);
            } else {
                component.innerHTML = componentHtml;
            }
        } else {
            console.error(`Component '${componentName}' not found in either path.`);
        }
    });
});

// Actual fetch function
async function xfetch(url, jsonItem = null, method = "GET") {
    if (jsonItem == null) {
        return fetch(url, { method: method })
            .then((response) => response.text())
            .then((responseText) => {
                return responseText;
            })
            .catch((error) => {
                console.log(error);
            });
    } else {
        return fetch(url, { method: method })
            .then((response) => response.json())
            .then((responseJson) => {
                return responseJson;
            })
            .catch((error) => {
                console.log(error);
            });
    }
}

// New fetch function for fetching complete JSON
async function xfetchCompleteJson(url, method = "GET") {
    return fetch(url, { method: method })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            console.error("Fetching complete JSON failed:", error);
        });
}

// Function to execute a command
function _run(run) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/execute$ " + run);
    xhttp.send();
}

// Function to automatically adjust the grid layout
function autoAdjustGrid() {
    // Select all elements with the class 'grid-container-auto-adjust'
    const containers = document.querySelectorAll(".grid-container-auto-adjust");

    containers.forEach((container) => {
        // The rest of the code is applied to each container individually
        const minWidth = parseInt(container.dataset.minWidth, 10) || 320;
        const maxWidth = parseInt(container.dataset.maxWidth, 10) || null;
        const containerWidth = maxWidth
            ? Math.min(container.offsetWidth, maxWidth)
            : container.offsetWidth;
        const totalDivs = container.children.length;

        let maxColumns = Math.floor(containerWidth / minWidth);
        let columns = maxColumns;

        while (totalDivs % columns !== 0 && columns > 1) {
            columns--;
        }

        container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        if (maxWidth) {
            container.style.maxWidth = `${maxWidth}px`;
        }
    });
}
