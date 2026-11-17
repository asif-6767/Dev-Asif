/**
 * ASIF ISLAM — Frontend Interaction System (Vanilla JS, Zero Dependencies)
 */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const csrfToken = document.body.getAttribute('data-csrf') || '';

  // 22. Initial Loader Dismiss
  window.addEventListener('load', () => {
    const loader = document.getElementById('siteLoader');
    if (loader) {
      setTimeout(() => loader.classList.add('is-done'), 260);
    }
  });

  // Fallback in case load takes long
  setTimeout(() => {
    const loader = document.getElementById('siteLoader');
    if (loader) loader.classList.add('is-done');
  }, 1500);

  // 23. Scroll Progress Bar & Active Section Highlighting
  const scrollProgress = document.getElementById('scrollProgress');
  const navLinks = Array.from(document.querySelectorAll('.drawer-item[data-section]'));
  const sections = navLinks
    .map((link) => document.getElementById(link.getAttribute('data-section')))
    .filter(Boolean);

  function onScrollUpdate() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    if (scrollProgress) {
      scrollProgress.style.width = Math.min(100, (scrollTop / maxScroll) * 100).toFixed(2) + '%';
    }

    let currentId = 'home';
    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.35) {
        currentId = sec.id;
      }
    }
    navLinks.forEach((item) => {
      item.classList.toggle('is-active', item.getAttribute('data-section') === currentId);
    });
  }

  window.addEventListener('scroll', onScrollUpdate, { passive: true });
  onScrollUpdate();

  // 18 & 19. Slide-In Navigation Drawer
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navDrawer = document.getElementById('navDrawer');
  const navBackdrop = document.getElementById('navBackdrop');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');

  function setDrawerOpen(open) {
    if (!navDrawer || !hamburgerBtn || !navBackdrop) return;
    navDrawer.classList.toggle('is-open', open);
    navBackdrop.classList.toggle('is-open', open);
    hamburgerBtn.classList.toggle('is-open', open);
    hamburgerBtn.setAttribute('aria-expanded', String(open));
    navDrawer.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => setDrawerOpen(!navDrawer.classList.contains('is-open')));
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', () => setDrawerOpen(false));
  if (navBackdrop) navBackdrop.addEventListener('click', () => setDrawerOpen(false));
  document.querySelectorAll('[data-nav-link]').forEach((el) => {
    el.addEventListener('click', () => setDrawerOpen(false));
  });

  // 3. Typing Animation for Hero Tagline
  const typingTarget = document.getElementById('typingTarget');
  if (typingTarget && !prefersReducedMotion) {
    const rawPhrases = typingTarget.getAttribute('data-phrases') || '';
    const phrases = rawPhrases.split('|').map((s) => s.trim()).filter(Boolean);
    if (phrases.length > 1) {
      let phraseIdx = 0;
      let charIdx = phrases[0].length;
      let deleting = true;

      setTimeout(function tick() {
        const current = phrases[phraseIdx];
        if (deleting) {
          charIdx--;
          typingTarget.textContent = current.slice(0, Math.max(0, charIdx));
          if (charIdx <= 0) {
            deleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            setTimeout(tick, 340);
            return;
          }
          setTimeout(tick, 32);
        } else {
          charIdx++;
          typingTarget.textContent = current.slice(0, charIdx);
          if (charIdx >= current.length) {
            deleting = true;
            setTimeout(tick, 1900);
            return;
          }
          setTimeout(tick, 55);
        }
      }, 2100);
    }
  }

  // 13. IntersectionObserver Scroll Reveal
  const revealEls = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // 11. Subtle Desktop 3D Perspective Tilt
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  if (!isTouchDevice && !prefersReducedMotion) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(950px) rotateX(${(-y * 5.5).toFixed(2)}deg) rotateY(${(x * 5.5).toFixed(2)}deg) translateY(-3px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // Animated Banner Slider
  const bannerTrack = document.getElementById('bannerTrack');
  if (bannerTrack) {
    const slides = bannerTrack.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.banner-dot');
    let currentSlide = 0;
    let slideTimer = null;

    function goToSlide(index) {
      if (slides.length <= 1) return;
      currentSlide = (index + slides.length) % slides.length;
      bannerTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
      dots.forEach((d, idx) => d.classList.toggle('is-active', idx === currentSlide));
    }

    function startAutoPlay() {
      if (prefersReducedMotion || slides.length <= 1) return;
      clearInterval(slideTimer);
      slideTimer = setInterval(() => goToSlide(currentSlide + 1), 5200);
    }

    const prevBtn = document.getElementById('bannerPrev');
    const nextBtn = document.getElementById('bannerNext');
    if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); startAutoPlay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); startAutoPlay(); });
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        goToSlide(Number(dot.getAttribute('data-slide-to') || 0));
        startAutoPlay();
      });
    });
    startAutoPlay();
  }

  // 20. Interactive Service Detail Modal
  const serviceModal = document.getElementById('serviceModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalContactCta = document.getElementById('modalContactCta');
  const serviceCategorySelect = document.getElementById('service_category');

  function openServiceModal(serviceId) {
    const catalog = window.ASIF_SERVICES || {};
    const srv = catalog[serviceId];
    if (!srv || !serviceModal) return;

    document.getElementById('modalServiceNum').textContent = srv.number;
    document.getElementById('modalServiceTitle').textContent = srv.title;
    document.getElementById('modalServiceDesc').textContent = srv.fullDesc;
    document.getElementById('modalServiceIcon').innerHTML = srv.iconSvg;
    document.getElementById('modalContactCtaText').textContent = srv.contactText || 'Request This Service';

    const featsList = document.getElementById('modalServiceFeatures');
    featsList.innerHTML = '';
    (srv.features || []).forEach((feat) => {
      const li = document.createElement('li');
      li.textContent = feat;
      featsList.appendChild(li);
    });

    const platsWrap = document.getElementById('modalPlatformsWrap');
    const platsRow = document.getElementById('modalServicePlatforms');
    platsRow.innerHTML = '';
    if (srv.platformIcons && srv.platformIcons.length > 0) {
      platsWrap.classList.remove('hidden');
      srv.platformIcons.forEach((p) => {
        const chip = document.createElement('span');
        chip.className = 'modal-plat-chip';
        chip.innerHTML = `${p.svg}<span>${escapeHtml(p.name)}</span>`;
        platsRow.appendChild(chip);
      });
    } else {
      platsWrap.classList.add('hidden');
    }

    if (modalContactCta) {
      modalContactCta.onclick = () => {
        if (serviceCategorySelect) {
          serviceCategorySelect.value = srv.title;
        }
        closeServiceModal();
      };
    }

    serviceModal.classList.add('is-open');
    serviceModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeServiceModal() {
    if (!serviceModal) return;
    serviceModal.classList.remove('is-open');
    serviceModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-service-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const id = Number(card.getAttribute('data-service-id'));
      openServiceModal(id);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeServiceModal);
  if (serviceModal) {
    serviceModal.addEventListener('click', (e) => {
      if (e.target === serviceModal) closeServiceModal();
    });
  }

  // Global ESC key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeServiceModal();
      setDrawerOpen(false);
      toggleAiChat(false);
    }
  });

  // 8. ASIF'S ASSISTANT Chat Controller
  const aiLauncherBtn = document.getElementById('aiLauncherBtn');
  const aiChatWindow = document.getElementById('aiChatWindow');
  const aiCloseBtn = document.getElementById('aiCloseBtn');
  const aiMinimizeBtn = document.getElementById('aiMinimizeBtn');
  const aiChatForm = document.getElementById('aiChatForm');
  const aiInput = document.getElementById('aiInput');
  const aiMessages = document.getElementById('aiMessages');

  function toggleAiChat(open) {
    if (!aiChatWindow || !aiLauncherBtn) return;
    aiChatWindow.classList.toggle('is-open', open);
    aiChatWindow.setAttribute('aria-hidden', String(!open));
    aiLauncherBtn.setAttribute('aria-expanded', String(open));
    if (open && aiInput) {
      setTimeout(() => aiInput.focus(), 180);
    }
  }

  if (aiLauncherBtn) {
    aiLauncherBtn.addEventListener('click', () => {
      toggleAiChat(!aiChatWindow.classList.contains('is-open'));
    });
  }
  if (aiCloseBtn) aiCloseBtn.addEventListener('click', () => toggleAiChat(false));
  if (aiMinimizeBtn) aiMinimizeBtn.addEventListener('click', () => toggleAiChat(false));

  function formatNowTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function appendChatMessage(role, text) {
    if (!aiMessages) return;
    const msg = document.createElement('div');
    msg.className = `ai-msg ${role === 'user' ? 'ai-msg-user' : 'ai-msg-bot'}`;
    msg.innerHTML = `
      <div class="ai-msg-avatar" aria-hidden="true">${role === 'user' ? 'YOU' : 'AI'}</div>
      <div class="ai-msg-body">
        <div class="ai-bubble">${escapeHtml(text)}</div>
        <span class="ai-time">${formatNowTime()}</span>
      </div>
    `;
    aiMessages.appendChild(msg);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function appendTypingIndicator() {
    if (!aiMessages) return null;
    const node = document.createElement('div');
    node.className = 'ai-msg ai-msg-bot';
    node.innerHTML = `
      <div class="ai-msg-avatar" aria-hidden="true">AI</div>
      <div class="ai-msg-body">
        <div class="ai-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>
      </div>
    `;
    aiMessages.appendChild(node);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return node;
  }

  let aiBusy = false;
  async function sendAiPrompt(promptText) {
    const trimmed = promptText.trim();
    if (!trimmed || aiBusy) return;
    aiBusy = true;

    appendChatMessage('user', trimmed);
    if (aiInput) aiInput.value = '';
    const typingEl = appendTypingIndicator();

    try {
      const res = await fetch('api/chat.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          message: trimmed,
          csrf_token: csrfToken,
        }),
      });
      const json = await res.json();
      if (typingEl) typingEl.remove();
      if (json.ok && json.reply) {
        appendChatMessage('bot', json.reply);
      } else {
        appendChatMessage('bot', json.error || 'I could not process that right now. Please try again.');
      }
    } catch (err) {
      if (typingEl) typingEl.remove();
      appendChatMessage('bot', 'Connection issue detected. Please try again shortly or use the Support section.');
    } finally {
      aiBusy = false;
    }
  }

  if (aiChatForm) {
    aiChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (aiInput) sendAiPrompt(aiInput.value);
    });
  }

  document.querySelectorAll('[data-ai-prompt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-ai-prompt') || '';
      sendAiPrompt(q);
    });
  });

  // 9. Contact Form Validation & Submission
  const contactForm = document.getElementById('contactForm');
  const contactFeedback = document.getElementById('contactFeedback');
  const contactSubmitBtn = document.getElementById('contactSubmitBtn');
  let contactBusy = false;

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (contactBusy) return;

      const formData = new FormData(contactForm);
      const fullName = String(formData.get('full_name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const message = String(formData.get('message') || '').trim();

      if (fullName.length < 2) {
        showContactStatus('error', 'Please enter your full name (at least 2 characters).');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showContactStatus('error', 'Please provide a valid email address.');
        return;
      }
      if (message.length < 10) {
        showContactStatus('error', 'Please write a message of at least 10 characters.');
        return;
      }

      contactBusy = true;
      if (contactSubmitBtn) contactSubmitBtn.disabled = true;
      showContactStatus('info', 'Validating and preparing your request...');

      try {
        const res = await fetch('api/contact.php', {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (!json.ok) {
          showContactStatus('error', json.error || 'Unable to submit inquiry.');
        } else {
          const actions = [];
          if (json.whatsapp_url) {
            actions.push(`<a class="feedback-action-link" href="${escapeAttr(json.whatsapp_url)}" target="_blank" rel="noopener noreferrer">Open WhatsApp Message &rarr;</a>`);
          }
          if (json.mailto_url) {
            actions.push(`<a class="feedback-action-link" href="${escapeAttr(json.mailto_url)}">Open Email Client &rarr;</a>`);
          }
          if (json.telegram_url) {
            actions.push(`<a class="feedback-action-link" href="${escapeAttr(json.telegram_url)}" target="_blank" rel="noopener noreferrer">Open Telegram &rarr;</a>`);
          }
          showContactStatus('success', json.message || 'Inquiry recorded successfully.', actions.join(''));
          contactForm.reset();
        }
      } catch (err) {
        showContactStatus('error', 'Network error while submitting form. Please try again or reach out via the social cards.');
      } finally {
        contactBusy = false;
        if (contactSubmitBtn) contactSubmitBtn.disabled = false;
      }
    });
  }

  function showContactStatus(type, text, extraHtml = '') {
    if (!contactFeedback) return;
    contactFeedback.classList.remove('hidden', 'is-success', 'is-error');
    if (type === 'success') contactFeedback.classList.add('is-success');
    if (type === 'error') contactFeedback.classList.add('is-error');
    contactFeedback.innerHTML = `<div>${escapeHtml(text)}</div>${extraHtml ? `<div class="feedback-links">${extraHtml}</div>` : ''}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }
})();
