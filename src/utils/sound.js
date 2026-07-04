// Lightweight sound effects using the Web Audio API.
// No external audio files needed — works fully offline.

let ctx;
function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return ctx;
}

function tone(freq, duration, startDelay = 0, type = "sine", volume = 0.15) {
  const audioCtx = getCtx();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const startTime = audioCtx.currentTime + startDelay;
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

// Short pleasant "success" chime (e.g. goal completed, water logged)
export function playSuccess() {
  try {
    tone(880, 0.15, 0);
    tone(1175, 0.2, 0.12);
  } catch {
    // audio not supported / blocked — fail silently
  }
}

// Subtle tap sound for lightweight actions (quick-add chips, minor toggles)
export function playClick() {
  try {
    tone(600, 0.08, 0, "triangle", 0.08);
  } catch {
    // ignore
  }
}

// Bigger celebratory fanfare for milestones (goal reached, streak achieved)
export function playAchievement() {
  try {
    tone(523, 0.15, 0);
    tone(659, 0.15, 0.12);
    tone(784, 0.25, 0.24);
  } catch {
    // ignore
  }
}

// Gentle bell for meditation/breathing session start & end
export function playChime() {
  try {
    tone(528, 0.6, 0, "sine", 0.12);
    tone(792, 0.8, 0.05, "sine", 0.08);
  } catch {
    // ignore
  }
}

// Soft two-tone reminder ping (e.g. water reminder notification)
export function playReminder() {
  try {
    tone(660, 0.18, 0);
    tone(660, 0.18, 0.25);
  } catch {
    // ignore
  }
}

// Low descending tone for gentle errors/removals
export function playError() {
  try {
    tone(320, 0.18, 0, "sine", 0.1);
    tone(240, 0.22, 0.1, "sine", 0.1);
  } catch {
    // ignore
  }
}
