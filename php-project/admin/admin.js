(function () {
  'use strict';

  const sidebar = document.getElementById('adminSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const tabButtons = document.querySelectorAll('.nav-tab-btn[data-tab]');
  const tabPanels = document.querySelectorAll('.tab-panel[data-tab-panel]');
  const topbarTitle = document.getElementById('topbarTitle');

  function setSidebarOpen(open) {
    if (!sidebar || !backdrop) return;
    sidebar.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => setSidebarOpen(!sidebar.classList.contains('is-open')));
  }
  if (backdrop) {
    backdrop.addEventListener('click', () => setSidebarOpen(false));
  }

  function activateTab(tabId) {
    tabButtons.forEach((btn) => {
      const match = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('is-active', match);
      if (match && topbarTitle) {
        topbarTitle.textContent = btn.textContent.trim();
      }
    });
    tabPanels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.getAttribute('data-tab-panel') === tabId);
    });
    try {
      sessionStorage.setItem('asif_admin_tab', tabId);
    } catch (e) {}
    setSidebarOpen(false);
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab')));
  });

  // Restore last active tab or query ?tab=
  const params = new URLSearchParams(window.location.search);
  const queryTab = params.get('tab');
  let initialTab = queryTab || 'overview';
  if (!queryTab) {
    try {
      const saved = sessionStorage.getItem('asif_admin_tab');
      if (saved) initialTab = saved;
    } catch (e) {}
  }
  if (document.querySelector(`.nav-tab-btn[data-tab="${initialTab}"]`)) {
    activateTab(initialTab);
  }

  // Confirmation prompts for destructive forms
  document.querySelectorAll('[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const msg = form.getAttribute('data-confirm') || 'Are you sure you want to perform this action?';
      if (!window.confirm(msg)) {
        e.preventDefault();
      }
    });
  });

  // Explicit typed confirmation for destructive DB backup restore
  const restoreForm = document.getElementById('restoreBackupForm');
  if (restoreForm) {
    restoreForm.addEventListener('submit', (e) => {
      const confirmInput = document.getElementById('restore_confirm_text');
      if (!confirmInput || confirmInput.value.trim().toUpperCase() !== 'RESTORE') {
        e.preventDefault();
        const notice = document.getElementById('restoreClientError');
        if (notice) {
          notice.textContent = 'Please type RESTORE in the confirmation box before restoring a backup.';
          notice.classList.remove('hidden');
        }
      }
    });
  }
})();
