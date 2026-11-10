const PHOTOS = {
  p2: 'images/park-2.jpg',   
  p4: 'images/park-4.jpg'
};

Object.values(PHOTOS).forEach(src => { new Image().src = src; });

const svg = document.getElementById('name'); 
const body = document.body;
const groups = [...svg.querySelectorAll('.s')]; 

groups.forEach((g, i) => {
  g.style.setProperty('--i', i);
  const s  = { page: g.dataset.page };
  const id = g.dataset.id || ('s' + i); 

  g.querySelectorAll('path,line,polyline,polygon,rect,circle,ellipse').forEach(el => {
    if (el.tagName === 'path') el.setAttribute('pathLength', 1);

    // hit
    const h = el.cloneNode();
    ['id', 'class', 'style', 'pathLength'].forEach(a => h.removeAttribute(a));
    h.setAttribute('class', 'hit');
    g.appendChild(h);
  });

  g.addEventListener('mouseenter', () => hover(s, i, g));
  g.addEventListener('mouseleave', () => unhover(g));
  g.addEventListener('click', () => {
    if (s.page) { mark(id); openPage(s.page, g); }
    else toast('This stroke’s memories are coming soon.');
  });
});

// need to wait for stroke to finish
setTimeout(() => body.classList.add('ready'), 300 + groups.length * 280 + 800);


// memory
const visited = new Set(); // ids of strokes already opened
const mark = id => visited.add(id);

// Fade out
function applyVisited() {
  visited.forEach(id => {
    const g = svg.querySelector('.s[data-id="' + id + '"]');
    if (g) { g.classList.remove('on'); g.classList.add('gone'); }
  });
}

// hovering over strokes 
let ac; 
const pent = [0, 2, 4, 7, 9]; 

function pluck(i) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const o = ac.createOscillator(), g = ac.createGain();
    const n = pent[i % 5] + 12 * Math.floor(i / 5); 
    o.type = 'sine';
    o.frequency.value = 261.63 * Math.pow(2, n / 12); 
    g.gain.setValueAtTime(0, ac.currentTime);  
    g.gain.linearRampToValueAtTime(.12, ac.currentTime + .02);
    g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + 1.6);
    o.connect(g).connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 1.7);
  } catch {}
}

['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, () => {
  try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); ac.resume(); } catch (e) {}
}, { once: true, passive: true }));

const bg = document.getElementById('bg');
let photoTimer;

function hidePhoto() {  
  clearTimeout(photoTimer);
  body.classList.remove('hov');
}

const PHOTO_HOLD_MS = 450;

function showPhoto(g) {
  clearTimeout(photoTimer);
  bg.style.backgroundImage = `url(${PHOTOS[g.dataset.bg || 'p4']})`;
  body.classList.add('hov');                                
  photoTimer = setTimeout(hidePhoto, PHOTO_HOLD_MS);     
}

function hover(s, i, g) {
  if (body.classList.contains('about')) return;             
  g.classList.add('on');                                    // orange (CSS)
  showPhoto(g);                                             // photo
  pluck(i);                                                 // chime
}
function unhover(g) {
  g.classList.remove('on');
  hidePhoto();
}


/* intro text */
const label = document.getElementById('label');

function toggleAbout(on) {
  body.classList.toggle('about', on);
  label.setAttribute('aria-expanded', on); 
  pluck(0);
}
label.onclick = () => toggleAbout(!body.classList.contains('about'));
document.getElementById('remember').onclick = () => toggleAbout(false); 


// #walk shows walk page

const walk  = document.getElementById('walk');
const track = document.getElementById('track');
const trail = document.getElementById('trail');
const hint  = document.getElementById('hint');
const tip = document.getElementById('tip');

function go(p) { location.hash = p; }                       // open a page

// transition
let busy = false;
function openPage(page, g) {
  if (page !== 'walk' || busy) { go(page); return; } 
  busy = true;
  const ANGLE = 25; 
  const K = 5; 
  // =80, y=1770 inside 1000x1810)
  walk.scrollTop = walk.scrollHeight;
  const tr = track.getBoundingClientRect();
  const T = { x: tr.left + tr.width * 0.08, y: tr.top + tr.height * 1770 / 1810 };

  const path = g.querySelector('path:not(.hit)');
  const end = path.getPointAtLength(path.getTotalLength());
  const P = new DOMPoint(end.x, end.y).matrixTransform(svg.getScreenCTM());
  const r = svg.getBoundingClientRect();
  const SCALE = K * (tr.width / 1000) / (r.height / 200);

  svg.style.transformOrigin = `${P.x - r.left}px ${P.y - r.top}px`;
  hidePhoto();
  g.classList.add('keep');
  body.classList.add('leaving');                 
  requestAnimationFrame(() => {
    g.style.strokeWidth = (14 / K).toFixed(3);
    svg.style.transform = `translate(${T.x - P.x}px, ${T.y - P.y}px) rotate(-${ANGLE}deg) scale(${SCALE})`;
  });

  setTimeout(() => {
    walk.style.transition = 'opacity .3s, visibility .3s';
    trail.style.transition = 'none';
    retracting = true;                          
    drawTrail(F1, 0, false);                   
    go(page);
    }, 750);

  setTimeout(() => body.classList.add('handoff'), 800);

  // The stroke shortens from tail
  setTimeout(() => {
    const t0 = performance.now(), dur = 900;
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; 
      drawTrail(F1, A0 * e, true);
      if (k < 1) requestAnimationFrame(step); else retracting = false;
    })(t0);
  }, 950);

  // reset
  setTimeout(() => {
    svg.style.transition = 'none'; g.style.transition = 'none';
    svg.style.transform = ''; g.style.strokeWidth = '';
    body.classList.remove('leaving', 'handoff'); g.classList.remove('keep');
    walk.style.transition = '';
    svg.getBoundingClientRect();
    svg.style.transition = ''; g.style.transition = '';
    busy = false;
    }, 2000);
}

function route() {
  const on = location.hash === '#walk';              
  if (!on) setTimeout(applyVisited, 900);                 
  body.classList.toggle('walk', on);               
  hint.style.display = on ? '' : 'none';
  if (on) {
    body.classList.remove('hov');
    requestAnimationFrame(() => {
      walk.scrollTop = walk.scrollHeight;  
      update();
    });
  }
}
addEventListener('hashchange', route);  

// Three ways back to the main page
document.getElementById('back').onclick  = () => { location.hash = ''; };   // corner icon
document.getElementById('fback').onclick = () => { location.hash = ''; };   // floating arrow
addEventListener('keydown', e => {                                          // Esc key
  if (e.key === 'Escape' && body.classList.contains('walk')) location.hash = '';
});

// scroll on walk
const L = trail.getTotalLength();                           // total length of the orange trail

function lenAtY(y) {
  let lo = 0, hi = L;
  for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; trail.getPointAtLength(m).y > y ? lo = m : hi = m; }
  return lo;
}

const F1 = lenAtY(1446.5) / L;                              // share = the stroke's shape)
const A0 = F1 * .45;                                        // upper part of first curve
const START_Y = trail.getPointAtLength(F1 * L).y;           
const END_Y = trail.getPointAtLength(L).y;                  
const grad = document.getElementById('tailFade');
let retracting = false;                                     // true while the page transition is shortening the stroke


function drawTrail(f, a = 0, glow = false) {
  trail.style.strokeDasharray = `${f - a} 2`;            
  trail.style.strokeDashoffset = -a;              
  const pa = trail.getPointAtLength(a * L), pf = trail.getPointAtLength(f * L);
  grad.setAttribute('y1', pa.y);           
  grad.setAttribute('y2', pa.y - 120);
  tip.setAttribute('transform', `translate(${pf.x} ${pf.y})`);
  tip.style.opacity = glow ? 1 : 0;
}

function update() {
  const vh = walk.clientHeight;
  const max = Math.max(1, walk.scrollHeight - vh);
  const started = walk.scrollTop < max - 4;              
  const s = walk.scrollTop / max;            

  // The tip stays put until scroll
  const f = started ? Math.max(F1, lenAtY(END_Y + (START_Y - END_Y) * s) / L) : F1;
  if (!retracting) drawTrail(f, A0, !started);      

  // fade in photos
  track.querySelectorAll('.ph,.note').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < vh * .85 && r.bottom > vh * .05) el.classList.add('in');
  });

  hint.classList.toggle('gone', walk.scrollTop < walk.scrollHeight - vh - 120);
}

walk.addEventListener('scroll', update, { passive: true });
addEventListener('resize', update);

let tt;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(tt);
  tt = setTimeout(() => t.classList.remove('show'), 2200); 
}

route();   