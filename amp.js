/* =========================================================================
   ZAMP: a tiny Winamp-style player in the sidebar.
   There are no audio files. The three tunes are written below as note
   lists and synthesized live with the Web Audio API: a square-wave lead,
   a triangle bass and noise drums. Nothing plays until someone presses
   play. Without JavaScript (or Web Audio) the player box stays hidden.
   ========================================================================= */
(function () {
  "use strict";

  const box = document.getElementById("amp");
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!box || !AudioCtx) return;
  box.hidden = false;

  /* ---- THE TUNES ------------------------------------------------------- */
  // One token per eighth note: a note name ("C5", "F#4"), "-" to hold the
  // previous note, "." for a rest. A bar is 8 tokens in 4/4, 6 in 3/4 or
  // 6/8. Each bar has a chord ("C", "Am", "F#m"); the bass line is a
  // pattern of chord degrees played on that chord: 1 root, 3 third, 5 fifth,
  // 6 sixth, 7 flat seventh, 8 octave, with the same "-" and "." as the
  // lead. Drums, per bar: k kick, s snare, h hi-hat, "." nothing.
  // swing delays every off-beat eighth by that fraction of a step.
  // All of these tunes are original. The later four borrow only the
  // general style of some favourite games, never their melodies.
  const OCTAVE_BASS = "1 8 1 8 1 8 1 8";
  const TRACKS = [
    {
      title: "Starfield Shuffle",
      bpm: 140,
      loops: 6,
      chords: ["C", "Am", "F", "G", "C", "Am", "F", "G"],
      lead: [
        "E5 - G5 - C6 - B5 G5", "A5 - - E5 C5 - E5 -",
        "F5 - A5 - C6 - A5 F5", "G5 - - - D5 - B4 -",
        "C6 - B5 - G5 - E5 G5", "A5 - C6 - E6 - - -",
        "F5 A5 C6 A5 G5 F5 E5 D5", "D5 - G5 - B5 - - -",
      ],
      bass: OCTAVE_BASS,
      drums: "k h s h k k s h",
    },
    {
      title: "Dial-Up Dreams",
      bpm: 112,
      loops: 5,
      chords: ["Am", "F", "C", "G", "Am", "F", "C", "G"],
      lead: [
        "A4 - C5 - E5 - D5 C5", "C5 - A4 - F4 - - -",
        "G4 - C5 - E5 - G5 -", "F5 - E5 - D5 - B4 -",
        "A4 - C5 - E5 - A5 -", "G5 F5 E5 - C5 - A4 -",
        "C5 D5 E5 G5 E5 - C5 -", "D5 - B4 - G4 - - -",
      ],
      bass: OCTAVE_BASS,
      drums: "k . h . s . h h",
    },
    {
      title: "Pixel Pals March",
      bpm: 160,
      loops: 7,
      chords: ["G", "Em", "C", "D", "G", "Em", "C", "D"],
      lead: [
        "D5 D5 G5 - B5 - G5 -", "E5 E5 G5 - B5 - E5 -",
        "C5 E5 G5 C6 - - G5 E5", "F#5 - A5 - D6 - - -",
        "B5 A5 G5 A5 B5 - B5 -", "A5 G5 E5 G5 B5 - - -",
        "C6 - B5 - A5 - G5 -", "A5 - - F#5 D5 - - -",
      ],
      bass: OCTAVE_BASS,
      drums: "k h s h k k s h",
    },
    {
      // Persona-style acid jazz: syncopated lead, funky bass, a little swing.
      title: "Velvet Afternoon",
      bpm: 118,
      loops: 5,
      swing: 0.15,
      chords: ["Dm", "G", "C", "Am", "Dm", "G", "A#", "A"],
      lead: [
        ". D5 F5 - A5 G5 F5 -", "E5 - D5 - B4 - . G4",
        ". C5 E5 G5 - B5 - G5", "A5 - - G5 E5 - C5 -",
        ". D5 F5 - C6 - A5 -", "B5 A5 G5 F5 - D5 - .",
        "F5 - A#5 - D6 - C6 A#5", "A5 - - C#6 - - E5 -",
      ],
      bass: "1 . 1 8 . 5 7 .",
      drums: "k h s k h k s h",
    },
    {
      // A bright route-theme march in the Game Boy style.
      title: "Route 26",
      bpm: 150,
      loops: 6,
      chords: ["D", "G", "A", "D", "Bm", "G", "E", "A"],
      lead: [
        "A4 D5 F#5 - A5 - F#5 A5", "B5 - A5 G5 - - D5 -",
        "C#5 - E5 - A5 - G5 F#5", "F#5 - E5 - D5 - - -",
        "D5 - F#5 - B5 - A5 -", "G5 F#5 G5 B5 D6 - B5 -",
        "G#5 - B5 - E6 - D6 -", "C#6 - B5 - A5 - E5 -",
      ],
      bass: "1 3 5 3 1 3 5 3",
      drums: "k h s h k h s s",
    },
    {
      // A minor-key tavern jig in 6/8, for a Baldur's Gate kind of night.
      title: "Torchlit Tavern",
      bpm: 150,
      loops: 8,
      chords: ["Em", "D", "Em", "B", "Em", "D", "C", "B"],
      lead: [
        "E5 F#5 G5 B5 - G5", "A5 - F#5 D5 E5 F#5",
        "G5 - E5 B4 - E5", "D#5 - F#5 B5 - -",
        "E6 D6 B5 G5 A5 B5", "A5 F#5 D5 A5 - F#5",
        "G5 E5 C5 E5 G5 C6", "B5 - - D#5 - -",
      ],
      bass: "1 . 5 8 . 5",
      drums: "k h h s h h",
    },
    {
      // A slow, bittersweet waltz in the spirit of Expedition 33.
      title: "The Painted Shore",
      bpm: 96,
      loops: 5,
      wave: "triangle",
      chords: ["Am", "F", "C", "G", "Am", "F", "Dm", "E"],
      lead: [
        "E5 - - - A5 B5", "C6 - A5 - F5 -",
        "E5 - G5 - C6 -", "B5 - - - D5 -",
        "C6 - B5 - A5 -", "A5 - G5 - F5 E5",
        "D5 - F5 - A5 -", "G#5 - - - - -",
      ],
      bass: "1 - 5 - 8 -",
      drums: "k . h . h .",
    },
  ];

  const SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const DEGREE = { 1: 0, 5: 7, 6: 9, 7: 10, 8: 12 };
  const midiFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
  function freq(name) {
    const m = /^([A-G])(#?)(\d)$/.exec(name);
    return midiFreq(12 * (Number(m[3]) + 1) + SEMITONE[m[1]] + (m[2] ? 1 : 0));
  }
  function bassFreq(chord, degree) {
    const m = /^([A-G])(#?)(m?)$/.exec(chord);
    const root = 36 + SEMITONE[m[1]] + (m[2] ? 1 : 0); // octave 2
    const step = degree === "3" ? (m[3] ? 3 : 4) : DEGREE[degree];
    return midiFreq(root + step);
  }

  // Fold "-" holds into the note they extend, so each note knows its length.
  function holds(notes, tokens) {
    let last = null;
    tokens.forEach((tok, i) => {
      if (notes[i]) last = notes[i];
      else if (tok === "-" && last) last.len++;
      else last = null;
    });
  }

  // Turn a track into a flat list of steps: the lead note and bass note
  // starting there (each with a length in steps), and the drum hit.
  function compile(track) {
    const leadTokens = [], bassTokens = [], lead = [], bass = [], drums = [];
    const bassBar = track.bass.split(" ");
    const drumBar = track.drums.split(" ");
    track.lead.forEach((bar, b) => {
      bar.split(" ").forEach((tok, i) => {
        const deg = bassBar[i];
        leadTokens.push(tok);
        bassTokens.push(deg);
        lead.push(/^[A-G]/.test(tok) ? { f: freq(tok), len: 1 } : null);
        bass.push(/^\d$/.test(deg) ? { f: bassFreq(track.chords[b], deg), len: 1 } : null);
        drums.push(drumBar[i]);
      });
    });
    holds(lead, leadTokens);
    holds(bass, bassTokens);
    const steps = lead.map((l, i) => ({ lead: l, bass: bass[i], drum: drums[i] }));
    const stepSec = 60 / track.bpm / 2;
    return { steps, stepSec, seconds: steps.length * stepSec * track.loops };
  }
  const SONGS = TRACKS.map((t) => Object.assign({ wave: "square", swing: 0 }, t, compile(t)));

  /* ---- AUDIO ----------------------------------------------------------- */
  let ctx, master, analyser, noise, bus;

  function setupAudio() {
    ctx = new AudioCtx();
    master = ctx.createGain();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.6;
    master.connect(analyser);
    analyser.connect(ctx.destination);
    setVolume();

    // One second of white noise, reused by every drum hit.
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  // Each track plays into its own bus. Stopping or skipping just disconnects
  // the bus, which silences any notes already scheduled ahead.
  function newBus() {
    if (bus) bus.disconnect();
    bus = ctx.createGain();
    bus.connect(master);
  }

  function tone(type, f, t, dur, vol) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.setValueAtTime(vol * 0.7, t + Math.min(0.06, dur / 2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(bus);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function hit(kind, t) {
    if (kind === "k") {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      osc.connect(g).connect(bus);
      osc.start(t);
      osc.stop(t + 0.15);
      return;
    }
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const g = ctx.createGain();
    const snare = kind === "s";
    src.buffer = noise;
    filter.type = "highpass";
    filter.frequency.value = snare ? 1200 : 7000;
    g.gain.setValueAtTime(snare ? 0.35 : 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (snare ? 0.12 : 0.04));
    src.connect(filter).connect(g).connect(bus);
    src.start(t);
    src.stop(t + 0.15);
  }

  /* ---- SCHEDULER ------------------------------------------------------- */
  // Notes are queued a little ahead of time so timers never cause gaps.
  // Background tabs only get a timer tick about once a second, so queue
  // further ahead while the page is hidden.
  let current = 0, playing = false, timer = null;
  let step = 0, nextTime = 0, trackStart = 0;

  function schedule() {
    const song = SONGS[current];
    const ahead = document.hidden ? 1.5 : 0.15;
    // If the browser stalled our timer, drop the notes we missed rather than
    // firing them all at once.
    if (nextTime < ctx.currentTime) {
      const missed = Math.ceil((ctx.currentTime - nextTime) / song.stepSec);
      step += missed;
      nextTime += missed * song.stepSec;
    }
    while (nextTime < ctx.currentTime + ahead) {
      const total = song.steps.length * song.loops;
      if (step >= total) {
        // End of the track: roll straight into the next one.
        current = (current + 1) % SONGS.length;
        startTrack(nextTime);
        return;
      }
      const s = song.steps[step % song.steps.length];
      const t = nextTime + (step % 2 ? song.swing * song.stepSec : 0);
      // A triangle lead is much quieter than a square one at the same gain.
      const leadVol = song.wave === "triangle" ? 0.32 : 0.13;
      if (s.lead) tone(song.wave, s.lead.f, t, s.lead.len * song.stepSec * 0.9, leadVol);
      if (s.bass) tone("triangle", s.bass.f, t, s.bass.len * song.stepSec * 0.8, 0.3);
      if (s.drum !== ".") hit(s.drum, t);
      if (s.drum !== "h" && s.drum !== ".") hit("h", t);
      step++;
      nextTime += song.stepSec;
    }
  }

  function startTrack(at) {
    newBus();
    step = 0;
    trackStart = nextTime = at;
    showTrack();
    schedule();
  }

  function play() {
    if (!ctx) setupAudio();
    if (playing) return;
    if (ctx.state === "suspended" && trackStart && step > 0) {
      ctx.resume(); // unpause
    } else {
      ctx.resume();
      startTrack(ctx.currentTime + 0.05);
    }
    playing = true;
    clearInterval(timer);
    timer = setInterval(schedule, 25);
    box.classList.add("is-playing");
    if (!raf) raf = requestAnimationFrame(draw);
  }

  function pause() {
    if (!playing) return;
    playing = false;
    clearInterval(timer);
    ctx.suspend();
    box.classList.remove("is-playing");
  }

  function stop() {
    playing = false;
    clearInterval(timer);
    if (ctx) {
      newBus();
      ctx.resume();
    }
    step = 0;
    trackStart = 0;
    box.classList.remove("is-playing");
    showTime(0);
    clearViz();
  }

  function skip(by) {
    current = (current + by + SONGS.length) % SONGS.length;
    if (playing) startTrack(ctx.currentTime + 0.05);
    else { stop(); showTrack(); }
  }

  /* ---- DISPLAY --------------------------------------------------------- */
  const $ = (sel) => box.querySelector(sel);
  const timeEl = $(".amp-time");
  const titleEl = $(".amp-title span");
  const canvas = $(".amp-viz");
  const g2d = canvas.getContext("2d");
  const volume = $(".amp-volume");
  const list = $(".amp-list");

  const mmss = (sec) => {
    const s = Math.max(0, Math.floor(sec));
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  };
  function showTime(sec) { timeEl.textContent = mmss(sec); }

  function showTrack() {
    const song = SONGS[current];
    titleEl.textContent = `${current + 1}. ${song.title} (${mmss(song.seconds).replace(/^0/, "")})`;
    list.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-current", i === current));
  }

  SONGS.forEach((song, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = `${i + 1}. ${song.title}`;
    b.addEventListener("click", () => {
      current = i;
      if (!ctx) setupAudio();
      if (playing) startTrack(ctx.currentTime + 0.05);
      else { stop(); play(); }
    });
    li.appendChild(b);
    list.appendChild(li);
  });

  // Spectrum bars, Winamp colors: green at the bottom, through yellow, to
  // red at the top. Drawn on a tiny canvas that CSS scales up with hard
  // pixels. Peaks hang for a moment, then fall.
  const BARS = 19, H = canvas.height;
  const peaks = new Array(BARS).fill(0);
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let bins, raf = 0;

  // Bars are spaced evenly in pitch (60 Hz to 12 kHz), the way ears hear,
  // rather than evenly in Hz, which would crowd every note into two bars.
  function binFor(i) {
    const hz = 60 * Math.pow(200, i / (BARS - 1));
    return Math.min(bins.length - 1, Math.round(hz / (ctx.sampleRate / analyser.fftSize)));
  }

  function clearViz() {
    g2d.fillStyle = "#000";
    g2d.fillRect(0, 0, canvas.width, H);
    g2d.fillStyle = "#1a3a1a";
    for (let x = 0; x < canvas.width; x += 2) g2d.fillRect(x, H - 1, 1, 1);
    peaks.fill(0);
  }

  function barColor(y) {
    const t = 1 - y / H;
    return t > 0.8 ? "#ff3030" : t > 0.55 ? "#ffd000" : "#30d030";
  }

  function draw() {
    raf = playing ? requestAnimationFrame(draw) : 0;
    if (!playing) return;
    showTime(ctx.currentTime - trackStart);
    if (!still) {
      bins = bins || new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(bins);
      g2d.fillStyle = "#000";
      g2d.fillRect(0, 0, canvas.width, H);
      for (let i = 0; i < BARS; i++) {
        const v = bins[binFor(i)] / 255;
        const h = Math.round(v * H);
        for (let y = H - h; y < H; y++) {
          g2d.fillStyle = barColor(y);
          g2d.fillRect(i * 4, y, 3, 1);
        }
        peaks[i] = Math.max(h, peaks[i] - 0.4);
        if (peaks[i] > 1) {
          g2d.fillStyle = "#c0c0c0";
          g2d.fillRect(i * 4, H - Math.round(peaks[i]), 3, 1);
        }
      }
    }
  }

  /* ---- CONTROLS -------------------------------------------------------- */
  function setVolume() {
    if (master) master.gain.value = (volume.value / 100) * 0.35;
  }
  volume.addEventListener("input", setVolume);

  box.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    ({ prev: () => skip(-1), play, pause, stop, next: () => skip(1) })[b.dataset.act]();
  });

  showTrack();
  showTime(0);
  clearViz();
})();
