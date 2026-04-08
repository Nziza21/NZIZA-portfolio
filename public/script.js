// NASA APOD BACKGROUND
async function loadBackdrop() {
  try {
    const img = new Image();
    img.onload = () => {
      document.getElementById('apod-bg').style.backgroundImage = `url('/backdrop')`;
      document.getElementById('apod-bg').style.opacity = '0.25';
    };
    img.onerror = () => console.log('Backdrop failed to load');
    img.src = '/backdrop';
  } catch (err) {
    console.log('Backdrop unavailable.');
  }
}
loadBackdrop();

// STARS CANVAS
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');

let stars = [];
const NUM_STARS = 180;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createStars() {
  stars = [];
  for (let i = 0; i < NUM_STARS; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.003 + 0.001,
      drift: (Math.random() - 0.5) * 0.15,
    });
  }
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => {
    s.alpha += s.speed;
    if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
    s.x += s.drift;
    if (s.x > canvas.width) s.x = 0;
    if (s.x < 0) s.x = canvas.width;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(201, 168, 76, ${s.alpha * 0.8})`;
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}

resize();
createStars();
drawStars();
window.addEventListener('resize', () => { resize(); createStars(); });

// NAVBAR SCROLL
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// HAMBURGER MENU
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  navLinks.style.flexDirection = 'column';
  navLinks.style.position = 'absolute';
  navLinks.style.top = '70px';
  navLinks.style.left = '0';
  navLinks.style.right = '0';
  navLinks.style.background = 'rgba(10,10,10,0.98)';
  navLinks.style.padding = '2rem';
  navLinks.style.gap = '1.5rem';
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      navLinks.style.display = 'none';
    }
  });
});

// SCROLL REVEAL
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card, .skill-card, .about-grid, .roles-list li').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// CONTACT FORM
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const sendBtn = document.getElementById('send-btn');
const btnText = document.getElementById('btn-text');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    formStatus.style.color = '#e74c3c';
    formStatus.textContent = 'Please fill in all fields.';
    return;
  }

  btnText.textContent = 'Sending...';
  sendBtn.disabled = true;
  formStatus.textContent = '';

  try {
    const res = await fetch('/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await res.json();

    if (data.success) {
      formStatus.style.color = '#c9a84c';
      formStatus.textContent = "Message sent! I'll get back to you soon.";
      form.reset();
    } else {
      formStatus.style.color = '#e74c3c';
      formStatus.textContent = data.error || 'Something went wrong. Try again.';
    }
  } catch (err) {
    formStatus.style.color = '#e74c3c';
    formStatus.textContent = 'Network error. Please try again.';
  } finally {
    btnText.textContent = 'Send Message';
    sendBtn.disabled = false;
  }
});