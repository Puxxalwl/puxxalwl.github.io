import { addFrameTask } from './raf.js';
import { audioState } from './audioState.js';

const MUSIC_DIR = 'music/';
const FALLBACK = { default: 'Juicy_Dark_Horse.mp3', tracks: [{ file: 'Juicy_Dark_Horse.mp3', title: 'Dark House' }] };

function fmt(t) {
  if (isNaN(t)) return '00:00';
  const m = String(Math.floor(t / 60)).padStart(2, '0');
  const s = String(Math.floor(t % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

function loadManifest(cb) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', MUSIC_DIR + 'playlist.json?v=' + Date.now(), true);
    xhr.timeout = 8000;
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data && Array.isArray(data.tracks) && data.tracks.length) return cb(data);
        } catch (e) {}
      }
      cb(FALLBACK);
    };
    xhr.onerror = () => cb(FALLBACK);
    xhr.ontimeout = () => cb(FALLBACK);
    xhr.send();
  } catch (e) {
    cb(FALLBACK);
  }
}

export function initPlayer() {
  const audio = document.getElementById('bg-music');
  const playBtn = document.getElementById('bioPlayBtn');
  const progress = document.getElementById('bioProgress');
  const bar = document.getElementById('bioProgressBar');
  const cur = document.getElementById('bioCurrent');
  const dur = document.getElementById('bioDuration');
  const player = document.getElementById('bioPlayer');
  const trackName = document.getElementById('bioTrackName');
  const listEl = document.getElementById('bioPlaylist');
  const prevBtn = document.getElementById('bioPrevBtn');
  const nextBtn = document.getElementById('bioNextBtn');
  const toggleBtn = document.getElementById('bioPlaylistToggle');
  const trackCount = document.getElementById('bioTrackCount');
  if (!audio || !playBtn) return;

  let isPlaying = false;
  let audioContext = null;
  let analyser = null;
  let dataArray = null;
  let stopFrame = null;

  let tracks = [];
  let current = 0;

  function analyseFrame() {
    if (!analyser || !isPlaying) return;
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < 32; i++) sum += dataArray[i];
    const level = sum / (32 * 256);
    audioState.intensity = level;
    if (level > 0.2) {
      player.classList.add('audio-active');
      bar.classList.add('audio-active');
    } else {
      player.classList.remove('audio-active');
      bar.classList.remove('audio-active');
    }
  }

  function initAudioGraph() {
    if (audioContext) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioContext = new Ctx();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    } catch (e) {
      audioContext = null;
      analyser = null;
    }
  }

  function play() {
    initAudioGraph();
    if (audioContext && audioContext.state === 'suspended') audioContext.resume();
    audio.play().then(() => {
      isPlaying = true;
      playBtn.innerHTML = '<i class="fas fa-pause"></i>';
      playBtn.setAttribute('aria-label', 'Pause');
      if (analyser && !stopFrame) stopFrame = addFrameTask(analyseFrame);
    }).catch(() => {});
  }

  function pause() {
    audio.pause();
    isPlaying = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    playBtn.setAttribute('aria-label', 'Play');
    player.classList.remove('audio-active');
    bar.classList.remove('audio-active');
    audioState.intensity = 0;
    if (stopFrame) { stopFrame(); stopFrame = null; }
    if (audioContext && audioContext.state === 'running') audioContext.suspend();
  }

  function select(i, autoplay) {
    if (!tracks.length) return;
    current = (i + tracks.length) % tracks.length;
    const t = tracks[current];
    audio.src = MUSIC_DIR + t.file;
    audio.load();
    if (trackName) trackName.textContent = t.title;
    if (listEl) {
      const items = listEl.children;
      for (let k = 0; k < items.length; k++) {
        items[k].classList.toggle('active', k === current);
      }
    }
    bar.style.width = '0%';
    cur.textContent = '00:00';
    dur.textContent = '00:00';
    if (autoplay) play();
  }

  function renderList() {
    if (!listEl) return;
    listEl.textContent = '';
    tracks.forEach((t, i) => {
      const li = document.createElement('button');
      li.type = 'button';
      li.className = 'playlist-item' + (i === current ? ' active' : '');
      li.innerHTML = '<i class="fas fa-music"></i><span>' + t.title + '</span>';
      li.addEventListener('click', () => select(i, true));
      listEl.appendChild(li);
    });
  }

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      bar.style.width = (audio.currentTime / audio.duration) * 100 + '%';
      cur.textContent = fmt(audio.currentTime);
    }
  });
  audio.addEventListener('loadedmetadata', () => { dur.textContent = fmt(audio.duration); });
  audio.addEventListener('ended', () => select(current + 1, true));

  playBtn.addEventListener('click', () => { isPlaying ? pause() : play(); });
  if (prevBtn) prevBtn.addEventListener('click', () => select(current - 1, true));
  if (nextBtn) nextBtn.addEventListener('click', () => select(current + 1, true));

  if (toggleBtn && listEl) {
    toggleBtn.addEventListener('click', () => {
      const collapsed = listEl.classList.toggle('collapsed');
      toggleBtn.setAttribute('aria-expanded', String(!collapsed));
    });
  }

  progress.addEventListener('click', (e) => {
    if (audio.duration) audio.currentTime = (e.offsetX / progress.clientWidth) * audio.duration;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isPlaying && stopFrame) { stopFrame(); stopFrame = null; }
    else if (!document.hidden && isPlaying && analyser && !stopFrame) stopFrame = addFrameTask(analyseFrame);
  });

  loadManifest((data) => {
    tracks = data.tracks;
    let start = 0;
    if (data.default) {
      const idx = tracks.findIndex((t) => t.file === data.default);
      if (idx >= 0) start = idx;
    }
    current = start;
    renderList();
    if (trackCount) trackCount.textContent = '(' + tracks.length + ')';
    select(start, false);
  });
}
