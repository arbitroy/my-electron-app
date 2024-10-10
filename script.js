$(document).ready(function(){
    var workTime = 20;
    var restTime = 10;
    var rounds = 8;
    var currentRound = 1;
    var isTabata = true;
    var isWorking = true;
    var tabataThisExercises = ['Squats', 'Row', 'Pull-ups', 'Sit-ups', 'Push-ups'];
    var currentExercise = 0;

    $("#workTime").html(workTime);
    $("#restTime").html(restTime);
    $("#rounds").html(rounds);
    $("#stats").html("Ready");

    var clock = $(".timer").FlipClock(0, {
        countdown: true,
        clockFace: 'MinuteCounter',
        autoStart: false,
        callbacks: {
            interval: function(){
                if (clock.getTime() == 0){
                    if (isWorking) {
                        if (isTabata || (!isTabata && currentExercise < tabataThisExercises.length)) {
                            clock.setTime(restTime);
                            clock.start();
                            isWorking = false;
                            $("#stats").html("Rest");
                        } else {
                            currentExercise++;
                            if (currentExercise < tabataThisExercises.length) {
                                clock.setTime(60);
                                clock.start();
                                $("#stats").html("Rest (1 min)");
                            } else {
                                clock.stop();
                                $("#stats").html("Finished");
                            }
                        }
                    } else {
                        currentRound++;
                        if (currentRound <= rounds) {
                            clock.setTime(workTime);
                            clock.start();
                            isWorking = true;
                            if (isTabata) {
                                $("#stats").html("Work");
                            } else {
                                $("#stats").html(tabataThisExercises[currentExercise]);
                            }
                        } else {
                            if (isTabata) {
                                clock.stop();
                                $("#stats").html("Finished");
                            } else {
                                currentRound = 1;
                                currentExercise++;
                                if (currentExercise < tabataThisExercises.length) {
                                    clock.setTime(workTime);
                                    clock.start();
                                    isWorking = true;
                                    $("#stats").html(tabataThisExercises[currentExercise]);
                                } else {
                                    clock.stop();
                                    $("#stats").html("Finished");
                                }
                            }
                        }
                    }
                }        
            }
        }
    });

    // Work Time
    $("#workInc").on("click", function(){
        if (workTime < 60) {
            workTime++;
            $("#workTime").html(workTime);
        }
    });
    $("#workDec").on("click", function(){
        if (workTime > 1) {
            workTime--;
            $("#workTime").html(workTime);
        }
    });

    // Rest Time
    $("#restInc").on("click", function(){
        if (restTime < 60) {
            restTime++;
            $("#restTime").html(restTime);
        }
    });
    $("#restDec").on("click", function(){
        if (restTime > 1) {
            restTime--;
            $("#restTime").html(restTime);
        }
    });

    // Rounds
    $("#roundsInc").on("click", function(){
        if (rounds < 20) {
            rounds++;
            $("#rounds").html(rounds);
        }
    });
    $("#roundsDec").on("click", function(){
        if (rounds > 1) {
            rounds--;
            $("#rounds").html(rounds);
        }
    });

    // Mode Toggle
    $("#modeToggle").on("click", function(){
        isTabata = !isTabata;
        $(this).text(isTabata ? "Tabata" : "Tabata This");
    });

    $("#start").on("click", function(){
        if (clock.getTime() == 0) {
            clock.setTime(workTime);
            currentRound = 1;
            currentExercise = 0;
            isWorking = true;
        }
        clock.start();
        if (isTabata) {
            $("#stats").html("Work");
        } else {
            $("#stats").html(tabataThisExercises[currentExercise]);
        }
    });

    $("#stop").on("click", function(){
        clock.stop();
    });

    $("#clear").on("click", function(){
        clock.stop();
        clock.setTime(0);
        currentRound = 1;
        currentExercise = 0;
        isWorking = true;
        $("#stats").html("Ready");
    });
});