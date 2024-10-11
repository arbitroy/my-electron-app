const { ipcRenderer } = require('electron');

// DOM Elements
const timerDisplay = document.getElementById('timer');
const progressBar = document.getElementById('progress');
const currentRoundDisplay = document.getElementById('current-round');
const totalRoundsDisplay = document.getElementById('total-rounds');
const timeOnDisplay = document.getElementById('time-on');
const timeOffDisplay = document.getElementById('time-off');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const exerciseInput = document.getElementById('exercise-name');
const addExerciseButton = document.getElementById('add-exercise');
const exerciseList = document.getElementById('exercise-list');
const currentExerciseDisplay = document.getElementById('current-exercise');
const modeSelect = document.getElementById('timer-mode');
const countdownOverlay = document.getElementById('countdown');
const soundBeforeRound = document.getElementById('sound-before-round');
const soundBeforeRest = document.getElementById('sound-before-rest');
const soundAllTransitions = document.getElementById('sound-all-transitions');
const scoreInput = document.getElementById('score-input');
const scoreValue = document.getElementById('score');
const saveScoreButton = document.getElementById('save-score');

// Timer variables
let timerInterval;
let currentTime;
let isWorkout = true;
let currentRound = 0;
let totalRounds = 8;
let workoutTime = 20;
let restTime = 10;
let exercises = [];
let currentExerciseIndex = 0;


function playSound(type) {
    ipcRenderer.send('play-sound', type);
}

// Update timer display
function updateTimerDisplay(time) {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

// Update progress bar
function updateProgressBar(currentTime, totalTime) {
    const progress = (1 - currentTime / totalTime) * 100;
    progressBar.style.width = `${progress}%`;
}

// Start timer
function startTimer() {
    if (exercises.length === 0) {
        alert('Please add at least one exercise before starting the timer.');
        return;
    }

    startButton.disabled = true;
    showCountdown(() => {
        currentTime = workoutTime;
        currentRound = 1;
        isWorkout = true;
        updateRoundDisplay();
        updateCurrentExercise();
        timerInterval = setInterval(timerTick, 1000);
    });
}

// Timer tick
function timerTick() {
    currentTime--;
    updateTimerDisplay(currentTime);
    updateProgressBar(currentTime, isWorkout ? workoutTime : restTime);

    if (currentTime <= 0) {
        if (isWorkout) {
            if (currentRound >= totalRounds) {
                endTimer();
            } else {
                isWorkout = false;
                currentTime = restTime;
                playSound('rest');
            }
        } else {
            isWorkout = true;
            currentTime = workoutTime;
            currentRound++;
            currentExerciseIndex = (currentExerciseIndex + 1) % exercises.length;
            updateRoundDisplay();
            updateCurrentExercise();
            playSound('workout');
        }
    } else if (currentTime === 3) {
        if ((isWorkout && soundBeforeRest.checked) || (!isWorkout && soundBeforeRound.checked) || soundAllTransitions.checked) {
            playSound('transition');
        }
    }
}

// End timer
function endTimer() {
    clearInterval(timerInterval);
    startButton.disabled = false;
    alert('Workout completed!');
    scoreInput.style.display = 'block';
}

// Reset timer
function resetTimer() {
    clearInterval(timerInterval);
    currentTime = workoutTime;
    currentRound = 0;
    isWorkout = true;
    currentExerciseIndex = 0;
    updateTimerDisplay(currentTime);
    updateProgressBar(currentTime, workoutTime);
    updateRoundDisplay();
    updateTimerOptions();
    updateCurrentExercise();
    startButton.disabled = false;
    scoreInput.style.display = 'none';
}

// Update round display
function updateRoundDisplay() {
    currentRoundDisplay.textContent = currentRound;
    totalRoundsDisplay.textContent = totalRounds;
}

function updateTimerOptions() {
    timeOffDisplay.textContent = restTime;
    timeOnDisplay.textContent = workoutTime;
}

// Add exercise
function addExercise() {
    const exerciseName = exerciseInput.value.trim();
    if (exerciseName) {
        exercises.push(exerciseName);
        exerciseInput.value = '';
        updateExerciseList();
    } else {
        alert('Please enter an exercise name.');
    }
}

// Update exercise list
function updateExerciseList() {
    exerciseList.innerHTML = '';
    exercises.forEach((exercise, index) => {
        const li = document.createElement('li');
        li.textContent = exercise;
        if (index === currentExerciseIndex) {
            li.style.fontWeight = 'bold';
        }
        exerciseList.appendChild(li);
    });
}

// Update current exercise display
function updateCurrentExercise() {
    if (exercises.length > 0) {
        currentExerciseDisplay.textContent = `Current Exercise: ${exercises[currentExerciseIndex]}`;
    } else {
        currentExerciseDisplay.textContent = '';
    }
    updateExerciseList();
}

// Show countdown
function showCountdown(callback) {
    countdownOverlay.style.display = 'flex';
    let count = 3;
    countdownOverlay.textContent = count;

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownOverlay.textContent = count;
        } else {
            clearInterval(countdownInterval);
            countdownOverlay.style.display = 'none';
            callback();
        }
    }, 1000);
}

// Play sound
function playSound(type) {
    console.log(`Playing ${type} sound`);
    ipcRenderer.send('play-sound', type);
}

// Save score
function saveScore() {
    const score = scoreValue.value.trim();
    if (score) {
        console.log(`Saving score: ${score}`);
        ipcRenderer.send('save-workout', { exercises, score });
        scoreInput.style.display = 'none';
        scoreValue.value = '';
    } else {
        alert('Please enter a valid score.');
    }
}

// Event listeners
startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
addExerciseButton.addEventListener('click', addExercise);
saveScoreButton.addEventListener('click', saveScore);

modeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'tabata') {
        workoutTime = 20;
        restTime = 10;
        totalRounds = 8;
    } else if (e.target.value === 'tabata-this') {
        workoutTime = 40;
        restTime = 20;
        totalRounds = 4;
    }
    
    resetTimer();
});

// IPC listeners
ipcRenderer.on('start-timer', startTimer);
ipcRenderer.on('reset-timer', resetTimer);

// Initial setup
updateTimerDisplay(workoutTime);
updateRoundDisplay();
updateTimerOptions();
countdownOverlay.style.display = 'none';  // Hide countdown overlay on start
scoreInput.style.display = 'none';  // Hide score input on start