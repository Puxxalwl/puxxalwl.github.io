import { addFrameTask } from './raf.js';
import { audioState } from './audioState.js';

const LINK_DIST = 130;
const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
const MOUSE_DIST = 160;
const MOUSE_DIST_SQ = MOUSE_DIST * MOUSE_DIST;

export function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const parallaxLayer = document.querySelector('.parallax-layer');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w = 0;
  let h = 0;
  let dpr = 1;
  let snowCount = 0;
  let snow = [];

  const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
  let tPX = 0;
  let tPY = 0;
  let cPX = 0;
  let cPY = 0;
  let intensity = 0;

  class Snow {
    constructor() { this.reset(true); }
    reset(anyY) {
      this.x = Math.random() * w;
      this.y = anyY ? Math.random() * h : -10;
      this.r = Math.random() * 2 + 0.8;
      this.sy = Math.random() * 0.8 + 0.4;
      this.sx = Math.random() * 0.4 - 0.2;
      this.a = Math.random() * 0.5 + 0.4;
      this.bucket = Math.min(5, Math.floor(this.a * 6));
    }
    update(boost) {
      this.y += this.sy * (1 + boost * 0.5);
      this.x += this.sx;
      if (this.y > h) { this.reset(false); }
    }
  }

  function targetCount() { return w > 768 ? 100 : 50; }

  function initSnow() {
    snowCount = targetCount();
    snow = Array.from({ length: snowCount }, () => new Snow());
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (snow.length !== targetCount()) initSnow();
  }

  function drawLinks(boost) {
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = 'rgba(255,255,255,1)';

    ctx.globalAlpha = 0.18 + boost * 0.22;
    ctx.beginPath();
    for (let i = 0; i < snow.length; i++) {
      const a = snow[i];
      for (let j = i + 1; j < snow.length; j++) {
        const b = snow[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        if (dx * dx + dy * dy < LINK_DIST_SQ) {
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
      }
    }
    ctx.stroke();

    if (mouse.x > 0) {
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      for (let i = 0; i < snow.length; i++) {
        const a = snow[i];
        const mdx = a.x - mouse.x;
        const mdy = a.y - mouse.y;
        if (mdx * mdx + mdy * mdy < MOUSE_DIST_SQ) {
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(a.x, a.y);
        }
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  const BUCKETS = 6;
  function drawParticles() {
    for (let bkt = 0; bkt < BUCKETS; bkt++) {
      ctx.beginPath();
      let any = false;
      for (const p of snow) {
        if (p.bucket !== bkt) continue;
        any = true;
        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      }
      if (any) {
        ctx.fillStyle = `rgba(255,255,255,${(bkt + 0.5) / BUCKETS})`;
        ctx.fill();
      }
    }
  }

  function frame() {
    intensity = audioState.intensity;
    ctx.clearRect(0, 0, w, h);
    mouse.x += (mouse.targetX - mouse.x) * 0.25;
    mouse.y += (mouse.targetY - mouse.y) * 0.25;
    cPX += (tPX - cPX) * 0.15;
    cPY += (tPY - cPY) * 0.15;
    if (parallaxLayer) parallaxLayer.style.transform = `translate(${cPX}px, ${cPY}px)`;
    for (const p of snow) p.update(intensity);
    drawParticles();
    drawLinks(intensity);
  }

  const handleMove = (e) => {
    const t = e.touches ? e.touches[0] : e;
    mouse.targetX = t.clientX;
    mouse.targetY = t.clientY;
    tPX = (t.clientX / w) * 20 - 10;
    tPY = (t.clientY / h) * 20 - 10;
  };

  document.addEventListener('mousemove', handleMove, { passive: true });
  document.addEventListener('touchmove', handleMove, { passive: true });
  window.addEventListener('mouseleave', () => { mouse.targetX = -1000; mouse.targetY = -1000; });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();
  initSnow();
  addFrameTask(frame);
}
