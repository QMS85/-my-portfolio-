/* Utilities and DOM references */
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const resumeBtn = document.getElementById('download-resume');
const yearEl = document.getElementById('year');
yearEl.textContent = new Date().getFullYear();

/* Theme Toggle with Persistence */
(function initTheme(){
  const saved = localStorage.getItem('site-theme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const defaultTheme = saved || (prefersLight ? 'day' : 'dark');
  if(defaultTheme === 'day') root.setAttribute('data-theme','day');
  else root.removeAttribute('data-theme');

  const on = defaultTheme === 'day';
  themeToggle.setAttribute('data-on', on ? 'true' : 'false');
  themeToggle.setAttribute('aria-checked', on ? 'true' : 'false');
})();

function setTheme(day){
  if(day){
    root.setAttribute('data-theme','day');
    localStorage.setItem('site-theme','day');
    themeToggle.setAttribute('data-on','true');
    themeToggle.setAttribute('aria-checked','true');
  } else {
    root.removeAttribute('data-theme');
    localStorage.setItem('site-theme','dark');
    themeToggle.setAttribute('data-on','false');
    themeToggle.setAttribute('aria-checked','false');
  }
}

themeToggle.addEventListener('click', () => {
  const isOn = themeToggle.getAttribute('data-on') === 'true';
  setTheme(!isOn);
});
themeToggle.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    themeToggle.click();
  }
});

/* Resume Button Placeholder */
resumeBtn.addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = '#';
  a.download = 'Jonathan_Resume.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
});

/* Reveal on scroll for .reveal elements */
(function revealOnScroll(){
  const items = Array.from(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(i => io.observe(i));
  } else {
    items.forEach(i => i.classList.add('visible'));
  }
})();

/* Contact Form Basic Validation */
(function contactForm(){
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = fd.get('name')?.trim();
    const email = fd.get('email')?.trim();
    const message = fd.get('message')?.trim();

    if(!name || !email || !message){
      status.textContent = 'Please fill out all fields.';
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailPattern.test(email)){
      status.textContent = 'Please enter a valid email address.';
      return;
    }

    status.textContent = 'Sending...';
    setTimeout(() => {
      status.textContent = 'Message sent. I will reply soon.';
      form.reset();
    }, 900);
  });
})();

/* Canvas Background: Stars + Tech Lines */
(function canvasBackground(){
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){
    canvas.style.display = 'none';
    return;
  }

  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  let DPR = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(w * DPR);
  canvas.height = Math.floor(h * DPR);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(DPR, DPR);

  const STAR_COUNT = Math.floor(Math.max(60, (w*h) / 9000));
  const stars = [];
  const mouse = { x: w/2, y: h/2, vx:0, vy:0 };

  function rand(min, max){ return Math.random() * (max - min) + min }

  for(let i=0;i<STAR_COUNT;i++){
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      vx: (Math.random()-0.5) * 0.02,
      vy: (Math.random()-0.5) * 0.02,
      hue: Math.random() > 0.85 ? 60 : (Math.random() > 0.6 ? 200 : 260)
    });
  }

  let last = performance.now();
  function draw(now){
    const dt = Math.min(40, now - last);
    last = now;
    ctx.clearRect(0,0,w,h);

    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0, 'rgba(10,12,18,0.6)');
    g.addColorStop(1, 'rgba(2,6,23,0.6)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    for(let s of stars){
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      if(s.x < -10) s.x = w + 10;
      if(s.x > w + 10) s.x = -10;
      if(s.y < -10) s.y = h + 10;
      if(s.y > h + 10) s.y = -10;

      const dx = (s.x - mouse.x) * 0.0006;
      const dy = (s.y - mouse.y) * 0.0006;

      ctx.beginPath();
      const glow = ctx.createRadialGradient(s.x - dx, s.y - dy, 0, s.x - dx, s.y - dy, s.r*6);
      glow.addColorStop(0, `hsla(${s.hue}, 100%, 60%, ${s.alpha*0.9})`);
      glow.addColorStop(0.2, `hsla(${s.hue}, 100%, 60%, ${s.alpha*0.35})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.arc(s.x - dx, s.y - dy, s.r*6, 0, Math.PI*2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.arc(s.x - dx, s.y - dy, s.r, 0, Math.PI*2);
      ctx.fill();
    }

    ctx.beginPath();
    for(let i=0;i<stars.length;i++){
      for(let j=i+1;j<stars.length;j++){
        const a = stars[i], b = stars[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 120){
          const alpha = 0.02 * (1 - dist/120);
          ctx.strokeStyle = `rgba(14,165,255,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
      }
    }
    ctx.stroke();

    requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('resize', () => {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    DPR = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(DPR, DPR);
  });

  requestAnimationFrame(draw);
})();

/* Accessibility: keyboard focus for cards */
(function keyboardCardFocus(){
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Tab'){
      document.body.classList.add('show-focus');
    }
  });
})();

/* Copy email on click */
(function copyEmail(){
  const emailLink = document.querySelector('a[href^="mailto:"]');
  if(!emailLink) return;
  emailLink.addEventListener('click', (e) => {
    if(e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    const email = emailLink.getAttribute('href').replace('mailto:','');
    navigator.clipboard?.writeText(email).then(() => {
      const prev = emailLink.textContent;
      emailLink.textContent = 'Copied!';
      setTimeout(()=> emailLink.textContent = prev, 1200);
    }).catch(()=> {
      window.location.href = emailLink.href;
    });
  });
})();

