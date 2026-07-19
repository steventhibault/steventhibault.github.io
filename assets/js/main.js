(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    menu.addEventListener('click', function (event) {
      if (event.target.matches('a')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function ensureContactModal() {
    let modal = document.getElementById('contactModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'contactModal';
    modal.className = 'contact-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    modal.innerHTML = [
      '<div class="contact-dialog" role="dialog" aria-modal="true" aria-labelledby="contactModalTitle">',
      '<button type="button" id="closeContactModal" class="contact-close" aria-label="Close contact form">&times;</button>',
      '<form class="contact-email-form" style="margin:0;">',
      '<div class="contact-header"><span class="contact-avatar">ST</span><h2 id="contactModalTitle" class="contact-title">Contact</h2></div>',
      '<label for="contact-name" class="contact-label">Name</label>',
      '<input id="contact-name" type="text" name="name" placeholder="Your name" required class="contact-input">',
      '<label for="contact-email" class="contact-label">Email</label>',
      '<input id="contact-email" type="email" name="email" placeholder="your@email.com" required class="contact-input">',
      '<label for="contact-phone" class="contact-label">Phone</label>',
      '<input id="contact-phone" type="tel" name="phone" placeholder="Optional" class="contact-input">',
      '<label for="contact-message" class="contact-label">Message</label>',
      '<textarea id="contact-message" name="message" placeholder="Tell me what you are looking for..." required class="contact-textarea"></textarea>',
      '<button type="submit" class="contact-submit">Send Message</button>',
      '</form>',
      '</div>'
    ].join('');

    document.body.appendChild(modal);
    return modal;
  }

  const contactModal = ensureContactModal();
  const closeContactModal = document.getElementById('closeContactModal');
  const contactForm = contactModal.querySelector('.contact-email-form');

  function openContactModal(event) {
    event.preventDefault();
    contactModal.style.display = 'flex';
    contactModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      const firstField = document.getElementById('contact-name');
      if (firstField) firstField.focus();
    }, 50);
  }

  function closeContactForm() {
    contactModal.style.display = 'none';
    contactModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
    const href = link.getAttribute('href') || '';
    if (href.toLowerCase().startsWith('mailto:steve@stevethibault.com')) {
      link.addEventListener('click', openContactModal);
    }
  });

  if (closeContactModal) closeContactModal.addEventListener('click', closeContactForm);

  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const name = (document.getElementById('contact-name') || {}).value || '';
      const email = (document.getElementById('contact-email') || {}).value || '';
      const phone = (document.getElementById('contact-phone') || {}).value || '';
      const message = (document.getElementById('contact-message') || {}).value || '';
      const body = [
        'Name: ' + name,
        'Email: ' + email,
        phone ? 'Phone: ' + phone : '',
        '',
        message
      ].filter(Boolean).join('\n');

      window.location.href = 'mailto:steve@stevethibault.com?subject=' +
        encodeURIComponent('Website inquiry from stevethibault.com') +
        '&body=' + encodeURIComponent(body);

      contactForm.reset();
      closeContactForm();
    });
  }

  contactModal.addEventListener('click', function (event) {
    if (event.target === contactModal) closeContactForm();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && contactModal.style.display === 'flex') {
      closeContactForm();
    }
  });

  const hero = document.querySelector('.hero, .page-hero');
  const glow = document.querySelector('.hero-mouse-glow');
  const opsSystem = document.querySelector('.ops-system');
  let lastX = null;
  let lastY = null;
  let rotation = 0;
  let lastShardTime = 0;
  const activeShards = [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function spawnPixelShards(host, x, y, dx, dy, count) {
    for (let index = 0; index < count; index += 1) {
      const shard = document.createElement('span');
      const size = 5 + Math.round(Math.random() * 11);
      const scatterX = (Math.random() - 0.5) * 66;
      const scatterY = (Math.random() - 0.5) * 66;
      const driftX = dx * 0.85 + scatterX;
      const driftY = dy * 0.85 + scatterY;

      shard.className = 'cursor-pixel-shard';
      shard.style.setProperty('--pixel-x', (x + (Math.random() - 0.5) * 18) + 'px');
      shard.style.setProperty('--pixel-y', (y + (Math.random() - 0.5) * 18) + 'px');
      shard.style.setProperty('--pixel-size', size + 'px');
      shard.style.setProperty('--pixel-mid-x', (driftX * 0.45) + 'px');
      shard.style.setProperty('--pixel-mid-y', (driftY * 0.45) + 'px');
      shard.style.setProperty('--pixel-end-x', driftX + 'px');
      shard.style.setProperty('--pixel-end-y', driftY + 'px');
      shard.style.setProperty('--pixel-fade-x', (driftX * 1.35) + 'px');
      shard.style.setProperty('--pixel-fade-y', (driftY * 1.35) + 'px');

      host.appendChild(shard);
      activeShards.push(shard);
      if (activeShards.length > 180) {
        const oldShard = activeShards.shift();
        if (oldShard) oldShard.remove();
      }
      window.setTimeout(function () {
        shard.remove();
        const shardIndex = activeShards.indexOf(shard);
        if (shardIndex > -1) activeShards.splice(shardIndex, 1);
      }, 620);
    }
  }

  if (hero && glow && !reducedMotion) {
    hero.addEventListener('pointermove', function (event) {
      const rect = hero.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const dx = lastX === null ? 0 : x - lastX;
      const dy = lastY === null ? 0 : y - lastY;

      hero.style.setProperty('--glow-x', x + 'px');
      hero.style.setProperty('--glow-y', y + 'px');

      if (opsSystem) {
        if (lastX !== null) {
          rotation += dx * 0.22;
        }
        opsSystem.style.setProperty('--ops-rotation', rotation + 'deg');
      }

      const now = performance.now();
      if (now - lastShardTime > 16) {
        const speed = Math.abs(dx) + Math.abs(dy);
        spawnPixelShards(hero, x, y, dx, dy, speed > 18 ? 7 : 4);
        lastShardTime = now;
      }

      lastX = x;
      lastY = y;
    }, { passive: true });
  }
}());
