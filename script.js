const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const loader = document.querySelector(".loader");
const cursorGlow = document.querySelector(".cursor-glow");
const customCursor = document.querySelector(".custom-cursor");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const canvas = document.querySelector(".hero-canvas");
const ctx = canvas.getContext("2d");
let audioContext;

lockPageZoom();

window.addEventListener("load", () => {
  window.setTimeout(() => loader.classList.add("is-hidden"), 650);
  runEntrance();
});

function lockPageZoom() {
  document.documentElement.style.setProperty("--locked-page-zoom", "0.9");

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const isZoomShortcut =
      (event.ctrlKey || event.metaKey) &&
      (key === "+" || key === "-" || key === "=" || key === "0" || key === "_");

    if (isZoomShortcut) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

menuToggle.addEventListener("click", () => {
  document.body.classList.toggle("menu-open");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => document.body.classList.remove("menu-open"));
});

if (!prefersReduced) {
  window.addEventListener("pointermove", (event) => {
    const pageZoom = Number.parseFloat(getComputedStyle(document.body).zoom) || 1;
    const cursorX = event.clientX / pageZoom;
    const cursorY = event.clientY / pageZoom;

    cursorGlow.style.opacity = "0.38";
    cursorGlow.style.left = `${cursorX}px`;
    cursorGlow.style.top = `${cursorY}px`;
    customCursor.style.opacity = "1";
    customCursor.style.left = `${cursorX}px`;
    customCursor.style.top = `${cursorY}px`;
  });

  window.addEventListener("pointerleave", () => {
    cursorGlow.style.opacity = "0";
    customCursor.style.opacity = "0";
  });

  window.addEventListener("pointerdown", (event) => {
    const pageZoom = Number.parseFloat(getComputedStyle(document.body).zoom) || 1;
    customCursor.classList.add("is-active");
    createCursorRipple(event.clientX / pageZoom, event.clientY / pageZoom);
  });

  window.addEventListener("pointerup", () => {
    customCursor.classList.remove("is-active");
  });

  document.querySelectorAll(".magnetic").forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
    });

    item.addEventListener("pointerleave", () => {
      item.style.transform = "";
    });
  });
}

window.addEventListener("pointerdown", () => {
  playWaterSound();
});

function createCursorRipple(x, y) {
  const splash = document.createElement("span");
  splash.className = "cursor-splash";
  splash.style.left = `${x}px`;
  splash.style.top = `${y}px`;

  const firstRipple = document.createElement("span");
  firstRipple.className = "cursor-ripple";
  const secondRipple = document.createElement("span");
  secondRipple.className = "cursor-ripple ripple-two";
  splash.append(firstRipple, secondRipple);

  for (let i = 0; i < 8; i += 1) {
    const drop = document.createElement("span");
    drop.className = "splash-drop";
    drop.style.setProperty("--angle", `${i * 45 + Math.random() * 18}deg`);
    drop.style.setProperty("--distance", `${18 + Math.random() * 22}px`);
    drop.style.setProperty("--size", `${2 + Math.random() * 3}px`);
    drop.style.animationDelay = `${Math.random() * 0.06}s`;
    splash.appendChild(drop);
  }

  document.body.appendChild(splash);
  splash.addEventListener("animationend", (event) => {
    if (event.target === firstRipple) splash.remove();
  });
}

async function playWaterSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  audioContext ||= new AudioContextClass();
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const now = audioContext.currentTime;
  const master = audioContext.createGain();
  const echo = audioContext.createDelay();
  const echoGain = audioContext.createGain();

  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.34, now + 0.014);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
  echo.delayTime.setValueAtTime(0.09, now);
  echoGain.gain.setValueAtTime(0.12, now);

  master.connect(audioContext.destination);
  master.connect(echo);
  echo.connect(echoGain);
  echoGain.connect(audioContext.destination);

  const dropPing = audioContext.createOscillator();
  const dropBody = audioContext.createOscillator();
  const dropPingGain = audioContext.createGain();
  const dropBodyGain = audioContext.createGain();
  const pingFilter = audioContext.createBiquadFilter();
  const bodyFilter = audioContext.createBiquadFilter();

  dropPing.type = "sine";
  dropPing.frequency.setValueAtTime(1720, now);
  dropPing.frequency.exponentialRampToValueAtTime(640, now + 0.16);
  dropPingGain.gain.setValueAtTime(0.0001, now);
  dropPingGain.gain.exponentialRampToValueAtTime(0.34, now + 0.012);
  dropPingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
  pingFilter.type = "bandpass";
  pingFilter.frequency.setValueAtTime(1380, now);
  pingFilter.frequency.exponentialRampToValueAtTime(720, now + 0.2);
  pingFilter.Q.setValueAtTime(12, now);

  dropBody.type = "sine";
  dropBody.frequency.setValueAtTime(360, now + 0.035);
  dropBody.frequency.exponentialRampToValueAtTime(118, now + 0.38);
  dropBodyGain.gain.setValueAtTime(0.0001, now);
  dropBodyGain.gain.exponentialRampToValueAtTime(0.28, now + 0.055);
  dropBodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
  bodyFilter.type = "lowpass";
  bodyFilter.frequency.setValueAtTime(520, now);
  bodyFilter.Q.setValueAtTime(2.4, now);

  dropPing.connect(pingFilter);
  pingFilter.connect(dropPingGain);
  dropPingGain.connect(master);
  dropBody.connect(bodyFilter);
  bodyFilter.connect(dropBodyGain);
  dropBodyGain.connect(master);

  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.055, audioContext.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    const fade = 1 - i / data.length;
    data[i] = (Math.random() * 2 - 1) * fade * fade;
  }

  const noise = audioContext.createBufferSource();
  const noiseGain = audioContext.createGain();
  const noiseFilter = audioContext.createBiquadFilter();
  noise.buffer = noiseBuffer;
  noiseFilter.type = "highpass";
  noiseFilter.frequency.setValueAtTime(2100, now);
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.1, now + 0.006);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);

  dropPing.start(now);
  dropPing.stop(now + 0.25);
  dropBody.start(now + 0.035);
  dropBody.stop(now + 0.46);
  noise.start(now);
  noise.stop(now + 0.06);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll("[data-animate], .reveal, .skill-card").forEach((element) => {
  observer.observe(element);
});

function runEntrance() {
  document.querySelectorAll(".hero-title span").forEach((span) => {
    span.style.opacity = "1";
  });
}

const particles = [];
let width = 0;
let height = 0;
let animationFrame;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  buildParticles();
}

function buildParticles() {
  particles.length = 0;
  const total = Math.min(96, Math.floor(width / 14));
  for (let i = 0; i < total; i += 1) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      size: Math.random() * 1.8 + 0.3,
      alpha: Math.random() * 0.38 + 0.08,
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > height) particle.vy *= -1;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${particle.alpha})`;
    ctx.fill();

    for (let j = index + 1; j < particles.length; j += 1) {
      const other = particles[j];
      const dx = particle.x - other.x;
      const dy = particle.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 112) {
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.strokeStyle = `rgba(255,255,255,${(1 - distance / 112) * 0.12})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });

  animationFrame = requestAnimationFrame(drawParticles);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

if (!prefersReduced) {
  drawParticles();
} else {
  cancelAnimationFrame(animationFrame);
}
