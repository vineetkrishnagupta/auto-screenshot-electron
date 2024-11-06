// renderer.js
const { ipcRenderer } = require('electron');

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const pauseButton = document.getElementById('pauseButton'); // Pause button
const statusMessage = document.getElementById('statusMessage');
const timerDisplay = document.getElementById('timerDisplay');

let timerInterval; // Timer interval variable
let elapsedTime = 0; // Elapsed time in seconds
let isPaused = false; // Track if the timer is paused

// Start taking screenshots
startButton.addEventListener('click', () => {
  if (isPaused) {
    // Resume if it was paused
    isPaused = false;
    pauseButton.textContent = 'Pause';
    startTimer();
  } else {
    ipcRenderer.send('start-screenshots');
    statusMessage.textContent = 'Taking screenshots every 5 seconds...';
    startTimer();
  }
});

// Stop taking screenshots and reset the timer
stopButton.addEventListener('click', () => {
  ipcRenderer.send('stop-screenshots');
  statusMessage.textContent = 'Stopped screenshot capturing.';
  stopTimer();
  resetTimerDisplay();
});

// Pause or resume the timer
pauseButton.addEventListener('click', () => {
  if (isPaused) {
    // Resume the timer
    isPaused = false;
    ipcRenderer.send('start-screenshots'); // Resume screenshot capturing
    pauseButton.textContent = 'Pause';
    startTimer();
    statusMessage.textContent = 'Resumed screenshot capturing.';
  } else {
    // Pause the timer
    isPaused = true;
    ipcRenderer.send('stop-screenshots'); // Stop screenshot capturing
    pauseButton.textContent = 'Resume';
    clearInterval(timerInterval); // Stop the timer
    statusMessage.textContent = 'Paused screenshot capturing.';
  }
});

// Listen for feedback from the main process
ipcRenderer.on('screenshot-taken', (event, message) => {
  statusMessage.textContent = message;
});

ipcRenderer.on('screenshot-error', (event, message) => {
  statusMessage.textContent = message;
});

ipcRenderer.on('screenshot-stopped', (event, message) => {
  statusMessage.textContent = message;
});

// Function to start the timer
function startTimer() {
  timerInterval = setInterval(updateTimer, 1000);
}

// Function to stop the timer
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// Function to reset the timer display
function resetTimerDisplay() {
  elapsedTime = 0;
  timerDisplay.textContent = '00:00:00';
}

// Function to update the timer display
function updateTimer() {
  if (!isPaused) {
    elapsedTime++;
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    // Format time with leading zeros
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    timerDisplay.textContent = `${formattedTime}`;
  }
}
