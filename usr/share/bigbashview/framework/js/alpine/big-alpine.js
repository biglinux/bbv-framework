const cachedComponents = {};

// Helper function to load and cache components
async function loadAndCacheComponent(componentName, jsonFile) {
    if (cachedComponents[componentName]) {
        return cachedComponents[componentName];
    }

    let response;
    let componentHtml = "";

    // Try to load the component from the provided paths
    for (const path of [`components/${componentName}.html`, `/usr/share/bigbashview/framework/component/${componentName}.html`]) {
        response = await fetch(path);
        if (response.ok) {
            componentHtml = await response.text();
            break; // Exit the loop if the component is found
        }
    }

    if (componentHtml) {
        const componentData = { html: componentHtml };

        if (jsonFile) {
            const jsonData = await fetch(jsonFile).then((res) => res.json());
            componentData.data = jsonData;
        }

        cachedComponents[componentName] = componentData;
        return componentData;
    } else {
        console.error(`Component '${componentName}' not found in either path.`);
        return null;
    }
}

// Alpine.js initialization
document.addEventListener("alpine:init", () => {
    // Alpine component for fetching JSON data
    Alpine.data('fetchJson', (url) => ({
        data: {},
        async init() {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                }
                this.data = await response.json();
            } catch (error) {
                console.error('Error fetching JSON data:', error);
            }
        }
    }));

    // Alpine component for fetching text data
    Alpine.data('fetchTxt', (url) => ({
        data: '',
        async init() {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                }
                this.data = await response.text();
            } catch (error) {
                console.error('Error fetching text data:', error);
            }
        }
    }));

    Alpine.magic("fetchjson", () => {
        return async (url, jsonItem = null, method = "GET") => {
            return xfetch(url, jsonItem, method);
        };
    });

    Alpine.magic("fetch", () => {
        return async (url, method = "GET") => {
            return xfetch(url, null, method);
        };
    });

    Alpine.magic("fetchCompleteJson", () => {
        return async (url, method = "GET") => {
            return xfetchCompleteJson(url, method);
        };
    });

    Alpine.magic("loadComponent", () => {
        return async (url, target) => {
            const response = await fetch(url);
            const text = await response.text();
            document.querySelector(target).innerHTML = text;
            Alpine.initializeComponent(document.querySelector(target));
        };
    });

    Alpine.magic("isActive", () => {
        return async (url) => {
            try {
                const response = await fetch(url);
                const text = await response.text();
                return text.trim().toLowerCase() === "true";
            } catch (error) {
                console.error("Failed to verify isActive:", error);
                return false;
            }
        };
    });

    isActive = function (alpineComponent, url) {
        fetch(url)
            .then((response) => response.text())
            .then((text) => {
                alpineComponent.active = text.trim();
            })
            .catch((error) => {
                console.error("Failed to verify isActive:", error);
                return false;
            });
    };

    document.querySelectorAll("[component]").forEach(async component => {
        const componentName = component.getAttribute("component");
        const jsonFile = component.getAttribute("load-json");

        const componentData = await loadAndCacheComponent(componentName, jsonFile);

        if (componentData) {
            component.innerHTML = componentData.html;

            if (jsonFile && componentData.data) {
                Alpine.addScopeToNode(component, componentData.data, Alpine.reactive);
            }
        }
    });
});

// Actual fetch function
async function xfetch(url, jsonItem = null, method = "GET") {
    try {
        const response = await fetch(url, { method: method });
        if (jsonItem == null) {
            return response.text();
        } else {
            return response.json();
        }
    } catch (error) {
        console.log(error);
    }
}

// New fetch function for fetching complete JSON
async function xfetchCompleteJson(url, method = "GET") {
    try {
        const response = await fetch(url, { method: method });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error("Fetching complete JSON failed:", error);
    }
}

// Function to execute a command
function _run(run) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/execute$ " + run);
    xhttp.send();
}

// Function to automatically adjust the grid layout
function autoAdjustGrid() {
    const containers = document.querySelectorAll(".grid-container-auto-adjust");

    containers.forEach((container) => {
        const minWidth = parseInt(container.dataset.minWidth, 10) || 250;
        const maxWidth = parseInt(container.dataset.maxWidth, 10) || null;
        const containerWidth = maxWidth ? Math.min(container.offsetWidth, maxWidth) : container.offsetWidth;
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
