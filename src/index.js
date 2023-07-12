function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function changeVolumebar() {
  const volumebar = document.getElementById("volume");
  const volume = parseInt(volumebar.value);
  volumebar.dataset.value = volume;
  player.changeVolume(volume);
}

function typeEvent(event) {
  if (event.keyCode === 13) tts();
}

function initMoras() {
  fetch("mora.lst")
    .then((response) => response.text())
    .then((text) => {
      text.trimEnd().split("\n").forEach((line) => {
        moraSet.add(line);
      });
    });
}

function getNotes(moraSet, text) {
  const defaultPitch = parseInt(document.getElementById("pitch").value);
  const defaultVelocity = parseInt(document.getElementById("volume").value);
  const maxLength = 2;
  const result = [];
  let pitch = defaultPitch;
  let velocity = defaultVelocity;
  let wait = null;
  while (text.length > 0) {
    let found = false;
    for (let i = maxLength; 0 < i; i--) {
      const word = text.slice(0, i);
      if (moraSet.has(word)) {
        const info = {
          instrument: word,
          duration: "4n",
          pitch: pitch,
          velocity: velocity,
          wait: wait,
        };
        result.push(structuredClone(info));
        pitch = defaultPitch;
        velocity = defaultVelocity;
        wait = null;
        text = text.substring(word.length);
        found = true;
        break;
      }
    }
    if (!found) {
      switch (text[0]) {
        case " ":
          wait = "16n";
          break;
        case "　":
          wait = "8n";
          break;
        case "っ":
          wait = "4n";
          break;
        case "…":
        case "･･･":
        case "、":
        case "､":
        case "，":
        case ",":
          wait = "2n";
          break;
        case "。":
        case "｡":
        case "．":
        case ".":
          wait = "1n";
          break;
        case "↑":
        case "↗":
        case "⤴":
        case "⇑":
        case "⇡":
          result.at(-1).pitch += 1;
          break;
        case "⬆":
          result.at(-1).pitch += 4;
          break;
        case "↓":
        case "↘":
        case "⤵":
        case "⇓":
        case "⇣":
          result.at(-1).pitch -= 1;
          break;
        case "⬇":
          result.at(-1).pitch -= 4;
          break;
        case "!":
          result.at(-1).velocity += 8;
          break;
        case "‼":
        case "!!":
          result.at(-1).velocity += 16;
          break;
        case "！":
          result.at(-1).velocity += 32;
          break;
        case "❗":
        case "❕":
          result.at(-1).velocity += 64;
          break;
        case "?": {
          const newInfo = structuredClone(result.at(-1));
          newInfo.duration = "32n";
          newInfo.pitch += 1;
          result.push(newInfo);
          break;
        }
        case "??":
        case "?!":
        case "!?":
        case "？":
        case "❓":
        case "❔": {
          const newInfo = structuredClone(result.at(-1));
          newInfo.duration = "16n";
          newInfo.pitch += 1;
          result.push(newInfo);
          break;
        }
        case "ー":
          result.at(-1).duration = "2n";
          break;
      }
      text = text.substring(1);
    }
  }
  return result;
}

function pitchToNoteName(pitch) {
  const octave = Math.floor(pitch / 12) - 1;
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const noteName = noteNames[pitch % 12];
  return `${noteName}${octave}`;
}

function kanaToHira(str) {
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

function tts() {
  const tempo = parseInt(document.getElementById("rate").value);
  Tone.Transport.bpm.value = tempo;

  const text = document.getElementById("searchText").value;
  const hira = kanaToHira(text);
  const notes = getNotes(moraSet, hira);
  const map = new Map();
  const set = new Set(notes.map((note) => note.instrument));
  set.forEach((instrument) => {
    const sampler = new Tone.Sampler({
      urls: {
        "C4": `${instrument}.opus`,
      },
      baseUrl: "voices/波音リツ/",
    }).toDestination();
    map.set(instrument, sampler);
  });
  Tone.loaded().then(() => {
    let now = Tone.now();
    notes.forEach((note) => {
      if (note.wait) {
        now += Tone.Time(note.wait).toSeconds();
      }
      const sampler = map.get(note.instrument);
      sampler.triggerAttackRelease(
        pitchToNoteName(note.pitch),
        note.duration,
        now,
        note.velocity,
      );
      now += Tone.Time(note.duration).toSeconds();
    });
  });
}

function resetPitch() {
  document.getElementById("pitch").value = 60;
}

function resetRate() {
  document.getElementById("rate").value = 480;
}

function resetVolume() {
  document.getElementById("volume").value = 500;
}

const moraSet = new Set();
let player;
loadConfig();
initMoras();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("search").onclick = tts;
document.getElementById("volume").onchange = changeVolumebar;
document.addEventListener("keydown", typeEvent);
document.getElementById("resetPitch").onclick = resetPitch;
document.getElementById("resetRate").onclick = resetRate;
document.getElementById("resetVolume").onclick = resetVolume;
