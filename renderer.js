// DOM Elements
const timerDisplay = document.getElementById('timer');
const progressBar = document.getElementById('progress');
const currentRoundDisplay = document.getElementById('current-round');
const totalRoundsDisplay = document.getElementById('total-rounds');
const timeOnDisplay = document.getElementById('time-on');
const timeOffDisplay = document.getElementById('time-off');
const totalWorkoutTimeDisplay = document.getElementById('total-workout-time');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const exerciseInput = document.getElementById('exercise-name');
const addExerciseButton = document.getElementById('add-exercise');
const exerciseList = document.getElementById('exercise-list');
const currentExerciseDisplay = document.getElementById('current-exercise');
const modeSelect = document.getElementById('timer-mode');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const soundBeforeRound = document.getElementById('sound-before-round');
const soundBeforeRest = document.getElementById('sound-before-rest');
const soundOnlyStart = document.getElementById('sound-only-start');
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
let totalWorkoutTime = "3:50";
let restTime = 10;
let exercises = [];
let currentExerciseIndex = 0;


function playSound(type) {
    window.electronAPI.send('play-sound', type);
}

function playSoundsForTransition(isWorkout, isStart = false) {
    if (isStart && soundOnlyStart.checked) {
        playSound('countdown');
        setTimeout(() => playSound('fightBell'), 3000); // Play fight bell after 3 seconds
    } else if (isWorkout && soundBeforeRound.checked) {
        playSound('fightBell');
    } else if (!isWorkout && soundBeforeRest.checked) {
        playSound('countdown');
    } else if (soundAllTransitions.checked) {
        playSound(isWorkout ? 'fightBell' : 'countdown');
    }
}

function animateCountdown(count, callback) {
    if (count > 0) {
        countdownOverlay.style.display = 'flex';
        countdownNumber.textContent = count;
        setTimeout(() => animateCountdown(count - 1, callback), 1000);
    } else {
        countdownOverlay.style.display = 'none';
        callback();
    }
}

// Show countdown
function showCountdown(callback) {
    animateCountdown(3, callback);
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
async function startTimer() {
    if (exercises.length === 0) {
        const alertMessage = 'Please add at least one exercise before starting the timer.';
        await window.electronAPI.showErrorBox('No Exercises', alertMessage);
        
        setTimeout(() => {
            exerciseInput.focus();
        }, 100);
        return;
    }

    startButton.disabled = true;
    showCountdown(() => {
        currentTime = workoutTime;
        currentRound = 1;
        isWorkout = true;
        updateRoundDisplay();
        updateCurrentExercise();
        playSoundsForTransition(true, true); // Play start sounds
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
                playSoundsForTransition(false);
            }
        } else {
            isWorkout = true;
            currentTime = workoutTime;
            currentRound++;
            currentExerciseIndex = (currentExerciseIndex + 1) % exercises.length;
            updateRoundDisplay();
            updateCurrentExercise();
            playSoundsForTransition(true);
        }
    } else if (currentTime === 3) {
        playSoundsForTransition(isWorkout);
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
    totalWorkoutTimeDisplay.textContent = totalWorkoutTime;
}

// Add exercise
function addExercise() {
    const exerciseName = exerciseInput.value.trim();
    if (exerciseName) {
        exercises.push(exerciseName);
        exerciseInput.value = '';
        updateExerciseList();
        exerciseInput.focus(); // Refocus on the input after adding
    } else {
        window.electronAPI.showErrorBox('Invalid Exercise', 'Please enter an exercise name.');
        setTimeout(() => {
            exerciseInput.focus();
        }, 100);
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
    window.electronAPI.send('play-sound', type);
}

// Save score
function saveScore() {
    const score = scoreValue.value.trim();
    if (score) {
        console.log(`Saving score: ${score}`);
        window.electronAPI.send('save-workout', { exercises, score });
        scoreInput.style.display = 'none';
        scoreValue.value = '';
    } else {
        window.electronAPI.showErrorBox('Invalid Score', 'Please enter a valid score.');
    }
}

// Event listeners
startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
addExerciseButton.addEventListener('click', addExercise);
saveScoreButton.addEventListener('click', saveScore);
exerciseInput.addEventListener('blur', function() {
    // Refocus after a short delay if the input is empty
    if (this.value.trim() === '' && exercises.length === 0) {
        setTimeout(() => {
            this.focus();
        }, 10);
    }
});


modeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'tabata') {
        workoutTime = 20;
        restTime = 10;
        totalRounds = 8;
        totalWorkoutTime = "3:50"
    } else if (e.target.value === 'tabata-this') {
        workoutTime = 20;
        restTime = 10;
        totalRounds = 40;
        totalWorkoutTime = "23:50"
    }
    resetTimer();
});





// IPC listeners
ipcRenderer.on('start-timer', startTimer);
ipcRenderer.on('reset-timer', resetTimer);

// IPC listeners
window.electronAPI.on('start-timer', startTimer);
window.electronAPI.on('reset-timer', resetTimer);

// Initial setup
updateTimerDisplay(workoutTime);
updateRoundDisplay();
updateTimerOptions();
countdownOverlay.style.display = 'none';  // Hide countdown overlay on start
scoreInput.style.display = 'none';  // Hide score input on start

// Ensure input is focusable on page load
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        exerciseInput.focus();
    }, 100);
});

// Add a global click event listener to refocus on the input field
document.addEventListener('click', (event) => {
    if (exercises.length === 0 && event.target !== exerciseInput && event.target !== addExerciseButton) {
        exerciseInput.focus();
    }
});