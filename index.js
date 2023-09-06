("use-strict");

const timerTitleElement = document.getElementById("timer-title");
const timerElement = document.getElementById("timer");
const timerTextElement = document.getElementById("timer-text");
const keys = Array.from(document.getElementsByClassName("num-key"));
const codeInput = document.getElementById("code-input");

const changeStuffForm = document.getElementById("change-stuff-form");
// const changeTimerSecondsInput = document.getElementById("change-timer-seconds");
const changeTimerMinutesInput = document.getElementById("change-timer-minutes");
const changeTimerHoursInput = document.getElementById("change-timer-hours");
const changeCodeInput = document.getElementById("change-code");
const changeStuffBtn = document.getElementById("change-stuff");

const playButtonElement = document.getElementById("play-button");
const backTrackElement = document.getElementsByClassName("playlist-button")[0];
const forwardTrackElement =
  document.getElementsByClassName("playlist-button")[2];
const playlistTitleEelement = document.getElementById("playlist-title");

/******************************* Helper functions ***********************************/

// seconds to string
String.prototype.toHHMMSS = function () {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  // if (hours < 10) {
  //   hours = "0" + hours;
  // }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
};

/******************************* Wake Lock ***********************************/

console.log("WakeLock");

let screenLock = await navigator.wakeLock.request("screen");
console.log(screenLock);

// remake the lock when we navigate away then back again
document.addEventListener("visibilitychange", async () => {
  if (screenLock !== null && document.visibilityState === "visible") {
    screenLock = await navigator.wakeLock.request("screen");
  }
});

function releaseScreenLock() {
  if (typeof screenLock !== "undefined" && screenLock != null) {
    screenLock.release().then(() => {
      console.log("Lock released 🎈");
      screenLock = null;
    });
  }
}

// local storage
function setCounting(c) {
  counting = c;
  localStorage.setItem("timerRunning", c);
}

// CSS property (messed up html colors when it was in the style tag???)
window.CSS.registerProperty({
  name: "--p",
  syntax: "<number>",
  inherits: true,
  initialValue: 1,
});

let timerInterval;
let maxTimer = localStorage.getItem("maxTimer") ?? 5 * 60;
let timer = localStorage.getItem("timer");
let counting = localStorage.getItem("timerRunning") === "true" ?? false;

let timeOfLastGuess = Number(localStorage.getItem("lastGuess")) ?? timer;

let password = 3811475;
let allPowerfull = localStorage.getItem("allPowerfull") === "true" ?? false;
let startTimerCode = 192011820;

let code = localStorage.getItem("code") ?? 1234;
let currentInput = [];
let tries = Number(localStorage.getItem("tries")) ?? 0;

let lost = localStorage.getItem("lost") === "true" ?? false;
let won = localStorage.getItem("won") === "true" ?? false;

const backBtn = keys[9];
const submitBtn = keys[11];

const hurryMessages = [
  "Hurry!",
  "You can do it!",
  "Time's running out!",
  "Hurry the clock is ticking!",
  "If you win it will be awesome.",
  "What's the code?",
  "Never give up.",
];

let track = 0;
const trackNames = ["One", "Two", "Three", "Four"];
let music = new Audio(`./playlist/${track}.mp3`);

// initialize after refresh
if (counting) startTimer();
else stopTimer();

if (allPowerfull) onOnPowerfull();
else hideStuff();

if (won) win();
if (lost) {
  timer = 0;
  onTimerZero();
}

/********************** Timer ************************/

function setTimerTitle(message) {
  timerTitleElement.textContent = message.toString();
}

function toggleTimer() {
  if (!counting) {
    startTimer();
  } else {
    stopTimer();
  }
}

let changedMessage;
function timerFunc() {
  if (counting) {
    if (timer <= 0) {
      onTimerZero();
      setCounting(false);
      return;
    }

    timer--;
    localStorage.setItem("timer", timer);

    if (timer < timeOfLastGuess - tries * 5 && !changedMessage) {
      setTimerTitle(
        hurryMessages[Math.floor(Math.random() * hurryMessages.length)]
      );
      changedMessage = true;
    }

    timerTextElement.textContent = timer.toString().toHHMMSS();
  }
}

function startTimer() {
  if (won || allPowerfull || lost) {
    setTimerTitle(
      "Can't start timer if you are in All powerful mode, or if you won or lost."
    );
    clearInterval(timerInterval);
    return;
  }

  tries = 0;
  localStorage.setItem("tries", tries);
  localStorage.setItem("timerRunning", true);

  const percentage = (100 * timer) / maxTimer;

  timerElement.className = "timer animate no-round";
  timerElement.style = `--p: 100;  --c1: rgb(16, 47, 59); --c2: yellow; --time: ${
    maxTimer - (maxTimer - timer)
  }s; --max: ${percentage};`;

  setTimerTitle("Hurry the clock is ticking!");

  setCounting(true);
  timerInterval = setInterval(timerFunc, 1000, [timer]);
}

function stopTimer() {
  localStorage.setItem("timerRunning", false);
  localStorage.setItem("timer", timer);

  const percentage = (100 * timer) / maxTimer;

  timerElement.className = "paused-timer no-round";
  timerElement.style = `--p: ${percentage}; --c1: rgb(50, 200, 80); --c2: yellow;`;

  timerTextElement.textContent = (timer || maxTimer || 100)
    .toString()
    .toHHMMSS();

  setTimerTitle("Let's chill, the timer is paused");

  setCounting(false);
  clearInterval(timerInterval);
}

function win() {
  won = true;
  timeOfLastGuess = timer;

  localStorage.setItem("lastGuess", timeOfLastGuess);
  localStorage.setItem("won", true);
  localStorage.setItem("lost", false);

  stopTimer();

  clearCurrentInput();
  setTimerTitle("You Win Great Job! Have a cookie!");
}

function clearCurrentInput() {
  currentInput = [];
  updateCodeInput();
}

function updateCodeInput() {
  codeInput.value = currentInput.join("");
}

// keys
keys.forEach((key) => {
  key.addEventListener("click", keyListener);
});

function keyListener(e) {
  e.preventDefault();
  const indexOf = keys.indexOf(e.target);

  // don't add to the code if clicked back or enter
  if (indexOf != 9 && indexOf != 11) {
    const number = indexOf === 10 ? 0 : keys.indexOf(e.target) + 1;

    currentInput.push(number);
  }
  updateCodeInput();
}

// back button
backBtn.addEventListener("click", onClickBack);

function onClickBack() {
  currentInput.pop();
  updateCodeInput();
}

// enter button
submitBtn.addEventListener("click", onSubmitForm);

function onSubmitForm() {
  // input is same as password
  if (currentInput.join("").toString() === password.toString()) {
    onOnPowerfull();
    // input is same as startTimerCode
  } else if (currentInput.join("").toString() === startTimerCode.toString()) {
    toggleTimer();
    clearCurrentInput();
  }
  // we are penalized
  else if (timer > timeOfLastGuess - tries * 5 && !lost && !allPowerfull) {
    onGuessBeforePenalty();
  }
  // input is same as code
  else if (
    currentInput.join("").toString() === code.toString() &&
    !lost &&
    !allPowerfull
  ) {
    win();
  }
  // code was wrong
  else if (!lost && !allPowerfull) {
    onGuessWrong();
  }
}

function onGuessBeforePenalty() {
  setTimerTitle(
    `You got to wait ${timer - timeOfLastGuess + tries * 5} seconds man!`
  );
  changedMessage = false;
}

function onGuessWrong() {
  tries++;
  setTimerTitle(`Wrong Code! wait ${tries * 5} seconds before trying again!`);

  clearCurrentInput();

  changedMessage = false;
  timeOfLastGuess = timer;

  localStorage.setItem("lastGuess", timeOfLastGuess);
  localStorage.setItem("tries", localStorage.getItem("tries") ?? 0 + 1);
}

function onTimerZero() {
  localStorage.setItem("lost", true);

  console.log("BOOOOOOM");
  lost = true;
  timerTextElement.textContent = "Time's up!";
  setTimerTitle("");

  if (music) music.pause();

  const beep = new Audio("./timer.mp3");
  beep.play();
}

/******************************* All powerfull stuff ****************************/

function onOnPowerfull() {
  console.log("Now we are all powerful");

  showStuff();
  stopTimer();
  clearCurrentInput();

  allPowerfull = true;
  won = false;
  lost = false;

  localStorage.setItem("won", false);
  localStorage.setItem("lost", false);
  localStorage.setItem("tries", 0);
  localStorage.setItem("allPowerfull", true);

  setTimerTitle("Welcome master.");
}

changeStuffBtn.addEventListener("click", onChangeStuff);
function onChangeStuff(e) {
  e.preventDefault();

  const hours = changeTimerHoursInput.value * 60 * 60;
  const minutes = changeTimerMinutesInput.value * 60;
  //   const seconds = changeTimerSecondsInput.value;
  const time = hours + minutes; // + seconds;
  console.log(time);

  maxTimer = time;
  timer = time;
  timerTextElement.textContent = timer.toString().toHHMMSS();
  code = changeCodeInput.value || code;
  timeOfLastGuess = timer;

  localStorage.setItem("allPowerfull", false);
  localStorage.setItem("code", code);
  localStorage.setItem("timer", timer);
  localStorage.setItem("maxTimer", maxTimer);
  localStorage.setItem("lastGuess", timer);

  setTimerTitle(`Timer set to ${timer.toString().toHHMMSS()}`);

  hideStuff();
}

function hideStuff() {
  changeStuffForm.style = "visibility: hidden; height: 5px;";
  allPowerfull = false;
}
function showStuff() {
  changeStuffForm.style = "visibility: shown;";
}

/******************************* Playlist ****************************/
playlistTitleEelement.textContent = "Hymn " + trackNames[track];

music.addEventListener("ended", () => {
  onTrackEnd();
});

playButtonElement.addEventListener("click", onClickPlayMusic);
function onClickPlayMusic() {
  music.paused ? music.play() : music.pause();

  playButtonElement.children[0].className = music.paused
    ? "fa-regular fa-circle-play"
    : "fa-sharp fa-regular fa-circle-pause";
}

backTrackElement.addEventListener("click", onClickBackTrack);
forwardTrackElement.addEventListener("click", onClickForwardTrack);

function onClickBackTrack() {
  track--;
  if (track < 0) track = trackNames.length - 1;
  onTrackChange();
}
function onClickForwardTrack() {
  track++;
  if (track > trackNames.length - 1) track = 0;
  onTrackChange();
}

function onTrackEnd() {
  console.log("TrackEnded");
  if (!lost && !won) {
    console.log("do the next");
    onClickForwardTrack();
  }
}

function onTrackChange() {
  music.src = `./playlist/${track}.mp3`;
  music.play();

  playlistTitleEelement.textContent = "Hymn " + trackNames[track];
  playButtonElement.children[0].className = music.paused
    ? "fa-regular fa-circle-play"
    : "fa-sharp fa-regular fa-circle-pause";
}
