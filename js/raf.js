const tasks = new Set();
let running = false;
let rafId = 0;

function tick(now) {
  for (const fn of tasks) fn(now);
  if (tasks.size && !document.hidden) {
    rafId = requestAnimationFrame(tick);
  } else {
    running = false;
  }
}

function start() {
  if (running || !tasks.size || document.hidden) return;
  running = true;
  rafId = requestAnimationFrame(tick);
}

export function addFrameTask(fn) {
  tasks.add(fn);
  start();
  return () => tasks.delete(fn);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (rafId) cancelAnimationFrame(rafId);
    running = false;
  } else {
    start();
  }
});
