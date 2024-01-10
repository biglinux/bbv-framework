// Variable to store the current mode (dark or light)
let mode = "dark";

// Function to update the theme based on the current mode
const updateTheme = () => {
  // Check if the body element has the "dark" class
  let darkOrLight = document.body.className.indexOf("dark") !== -1 ? "light" : "dark";
  mode = darkOrLight;
  
  // Get the elements with ids "light" and "dark"
  const elementLight =  document.getElementById("light");
  const elementDark =  document.getElementById("dark");
  
  // Update the display property of the elements based on the current mode
  if (mode == "dark") {
    elementLight.style.display = 'none';
    elementDark.style.display = '';
  } else {
    elementLight.style.display = '';
    elementDark.style.display = 'none';    
  }
  
  // Call the "ui" function with the updated mode
  ui("mode", mode);
}

// Function to update the colors with a delay
const updateColors = (url) => {
  setTimeout(() => {
    ui("theme", url);
  }, 360);
}

// Function to refresh the display of the body element with a delay
const refresh = () => {
  document.body.style.display = 'none';
  setTimeout(() => {
    document.body.style.display = 'block';
  }, 180);
}