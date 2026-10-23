const state = {
  activeView: 'overview',
  chartRange: '30D'
};

let previousFocus = null;

const moduleCopy = {
  finance: {
    label: 'Finance',
    eyebrow: 'Financial operations',
    title: 'Make the numbers usable.',
    description: 'A controlled home for cash, receivables, payables, close work, and treasury decisions.',
    tiles: [
      ['$', 'Cash management', 'Connect accounts, categorize movement, and keep the liquidity picture current.'],
      ['↗', 'Close workspace', 'Manage periods, reconciliations, journals, and supporting schedules.'],
      ['≡', 'Reporting', 'Build board-ready views from a governed source of financial truth.']
    ]
  },
  procurement: {
    label: 'Procurement',
    eyebrow: 'Spend management',
    title: 'Put commitments in order.',
    description: 'Bring vendors, purchase requests, approvals, and contracts into one accountable workflow.',
    tiles: [
      ['⌁', 'Vendor register', 'A single record for vendor ownership, status, terms, and risk checks.'],
      ['✓', 'Purchase requests', 'Route requests through policy-aware approvals before money moves.'],
      ['↗', 'Commitments', 'See what has been promised, when it is due, and who owns the decision.']
    ]
  },
  people: {
    label: 'People',
    eyebrow: 'People operations',
    title: 'Give the organization a memory.',
    description: 'Organize people, access, responsibilities, and recurring certifications without losing the human context.',
    tiles: [
      ['◎', 'Directory', 'The authoritative record for people, roles, teams, and reporting lines.'],
      ['✓', 'Access reviews', 'Keep permissions and attestations visible, assigned, and time-bound.'],
      ['✦', 'Responsibilities', 'Connect people to the work, approvals, and operational controls they own.']
    ]
  },
  operations: {
    label: 'Operations',
    eyebrow: 'Operating system',
    title: 'Move work with less friction.',
    description: 'Turn recurring work into visible queues, owners, deadlines, and evidence of completion.',
    tiles: [
      ['+', 'Work queues', 'Make the next action obvious and keep stalled work from disappearing.'],
      ['◌', 'Controls', 'Define the checks that matter and attach evidence to each completed step.'],
      ['→', 'Service map', 'See how requests move across teams, systems, and decision points.']
    ]
  },
  reports: {
    label: 'Reports',
    eyebrow: 'Decision support',
    title: 'Make the signal hard to miss.',
    description: 'Create repeatable reporting surfaces for leadership, committees, and the people doing the work.',
    tiles: [
      ['▤', 'Executive pack', 'A concise view of performance, risk, cash, and decisions required.'],
      ['◒', 'Management views', 'Drill into trends without rebuilding the same spreadsheet every month.'],
      ['↗', 'Audit trail', 'Trace numbers and decisions back to the record that supports them.']
    ]
  },
  settings: {
    label: 'Settings',
    eyebrow: 'Administration',
    title: 'Set the rules once.',
    description: 'Establish workspace identity, permissions, integrations, and the policies that keep the system coherent.',
    tiles: [
      ['⚙', 'Workspace setup', 'Configure company identity, fiscal periods, currencies, and defaults.'],
      ['◈', 'Roles & access', 'Define who can see, approve, create, and certify each class of work.'],
      ['⌘', 'Integrations', 'Connect the systems that should exchange controlled operational data.']
    ]
  }
};

const chartData = {
  '30D': { total: '$28.4M', caption: 'in net movement over the last 30 days', trend: '↗ 14.2%', bars: [46, 63, 55, 76, 68, 84, 72, 95, 78, 88, 67, 100] },
  '90D': { total: '$74.8M', caption: 'in net movement over the last 90 days', trend: '↗ 9.6%', bars: [35, 44, 40, 58, 49, 65, 61, 72, 66, 79, 74, 91] },
  YTD: { total: '$248.6M', caption: 'in net movement year to date', trend: '↗ 18.4%', bars: [28, 34, 39, 47, 43, 51, 58, 63, 70, 75, 87, 100] }
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function showToast(title, message = '') {
  const region = $('#toast-region');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast__mark">✓</span><span class="toast__copy"><strong>${escapeHtml(title)}</strong>${message ? `<span>${escapeHtml(message)}</span>` : ''}</span>`;
  region.append(toast);
  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'opacity .2s, transform .2s';
    window.setTimeout(() => toast.remove(), 220);
  }, 3400);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[character]);
}

function updateTodayLabel() {
  const label = $('#today-label');
  if (!label) return;
  const today = new Date();
  label.textContent = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(today);
}

function renderModule(view) {
  const config = moduleCopy[view] || moduleCopy.finance;
  const moduleView = $('#module-view');
  moduleView.innerHTML = `
    <div class="module-hero">
      <div>
        <div class="eyebrow">${escapeHtml(config.eyebrow)}</div>
        <h1>${escapeHtml(config.title)}</h1>
        <p>${escapeHtml(config.description)}</p>
      </div>
      <button class="button button--primary" type="button" data-action="module-action"><span class="button-icon">＋</span> Start configuration</button>
    </div>
    <div class="module-placeholder">
      ${config.tiles.map(([icon, title, copy]) => `<article class="module-tile"><div class="module-tile__icon">${escapeHtml(icon)}</div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(copy)}</span></article>`).join('')}
    </div>
    <div class="module-note"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg><div><strong>${escapeHtml(config.label)} is ready for its first vertical slice.</strong>This shell establishes the information architecture. The next step is to connect the underlying records, permissions, and workflows without changing the operator experience.</div></div>
  `;
}

function setActiveView(view) {
  state.activeView = view;
  const isOverview = view === 'overview';
  $('#overview-view').hidden = !isOverview;
  $('#module-view').hidden = isOverview;
  if (!isOverview) renderModule(view);

  $$('.nav-item').forEach((item) => {
    const selected = item.dataset.view === view;
    item.classList.toggle('is-active', selected);
    if (selected) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  $('#breadcrumb-current').textContent = isOverview ? 'Overview' : (moduleCopy[view]?.label || 'Workspace');
  $('#sidebar').classList.remove('is-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateChart(range) {
  const data = chartData[range];
  if (!data) return;
  state.chartRange = range;
  $('#chart-total').textContent = data.total;
  $('#chart-caption').textContent = data.caption;
  $('#chart-total').nextElementSibling.nextElementSibling.textContent = data.trend;
  $$('#bar-chart .chart-bar').forEach((bar, index) => {
    bar.style.setProperty('--bar-height', `${data.bars[index] || 0}%`);
  });
  $$('#range-controls button').forEach((button) => {
    const selected = button.dataset.range === range;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function filterActivity(query) {
  const normalizedQuery = query.trim().toLowerCase();
  let visibleCount = 0;
  $$('#activity-table tr').forEach((row) => {
    const matches = !normalizedQuery || row.dataset.searchable.toLowerCase().includes(normalizedQuery);
    row.hidden = !matches;
    if (matches) visibleCount += 1;
  });
  $('#table-empty').hidden = visibleCount > 0;
}

function openModal(kind = 'new-transaction', context = '') {
  const modal = $('#action-modal');
  const title = $('#modal-title');
  const intro = $('#modal-description');
  const options = $('#modal-options');

  const config = {
    'new-transaction': {
      title: 'Record a transaction',
      intro: 'Choose the transaction type you want to start. These actions are ready for a connected ledger.',
      options: [['＋', 'Payment or receipt', 'Record a movement of cash or funds.'], ['↔', 'Journal entry', 'Capture a controlled accounting adjustment.'], ['▤', 'Upload support', 'Attach a statement, invoice, or transaction file.']]
    },
    'new-vendor': {
      title: 'Add a vendor',
      intro: 'Start a vendor record and route it through the onboarding controls.',
      options: [['⌁', 'New supplier', 'Create a supplier record with ownership and terms.'], ['✓', 'Vendor review', 'Start a due-diligence or renewal review.'], ['↗', 'Import vendors', 'Bring in an existing vendor list for cleanup.']]
    },
    'new-approval': {
      title: 'Request approval',
      intro: 'Choose the type of decision you need to route to an accountable owner.',
      options: [['$', 'Spend approval', 'Request approval for a purchase or commitment.'], ['✦', 'Policy exception', 'Document a decision that falls outside a standard rule.'], ['◈', 'Access approval', 'Route a system or data-access request.']]
    },
    review: {
      title: `Review ${context}`,
      intro: 'This approval record is ready for a connected workflow. Choose an action for this starter slice.',
      options: [['✓', 'Approve request', 'Mark this request as approved for the next step.'], ['↗', 'Open details', 'View the supporting record and decision history.'], ['×', 'Return to owner', 'Send the request back with a note.']]
    }
  }[kind] || null;

  if (!config) return;
  title.textContent = config.title;
  intro.textContent = config.intro;
  options.innerHTML = config.options.map(([icon, optionTitle, copy]) => `<button class="modal-option" type="button" data-modal-option="${escapeHtml(optionTitle)}"><span class="modal-option__icon">${escapeHtml(icon)}</span><span class="modal-option__copy"><strong>${escapeHtml(optionTitle)}</strong><span>${escapeHtml(copy)}</span></span><span class="modal-option__arrow">→</span></button>`).join('');
  previousFocus = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#main-content').inert = true;
  $('#sidebar').inert = true;
  $('.modal-option', modal)?.focus();
}

function closeModal() {
  $('#action-modal').hidden = true;
  document.body.style.overflow = '';
  $('#main-content').inert = false;
  $('#sidebar').inert = false;
  if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  previousFocus = null;
}

function exportSnapshot() {
  const generatedDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
  const snapshot = [
    'BlevinsERP workspace snapshot',
    `Generated: ${generatedDate}`,
    '',
    'Cash & equivalents,$552.4M',
    'Accounts receivable,$211.0M',
    'Committed spend,$3.2M',
    'Open approvals,12',
    '',
    'This file contains illustrative starter data.'
  ].join('\n');
  const blob = new Blob([snapshot], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'blevins-erp-workspace-snapshot.csv';
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Snapshot exported', 'The illustrative workspace summary is ready.');
}

function handleAction(action) {
  switch (action) {
    case 'new-transaction':
    case 'new-vendor':
    case 'new-approval':
      openModal(action);
      break;
    case 'connect-ledger':
      showToast('Ledger connection queued', 'The integration setup belongs in the next build slice.');
      break;
    case 'export':
      exportSnapshot();
      break;
    case 'notifications':
      showToast('You are all caught up', 'Three items are waiting in the approval queue.');
      break;
    case 'profile':
      showToast('Administrator profile', 'Role and access controls will live in Settings.');
      break;
    case 'workspace-switch':
      showToast('Workspace switcher', 'Multi-entity workspaces are ready to be configured.');
      break;
    case 'help':
      showToast('Help center', 'Documentation will be added alongside each module.');
      break;
    case 'view-approvals':
      setActiveView('operations');
      showToast('Approval queue opened', 'Operations is the home for accountable work queues.');
      break;
    case 'view-activity':
      $('#activity-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('Activity log', 'You are viewing the latest four illustrative events.');
      break;
    case 'module-action':
      showToast(`${moduleCopy[state.activeView]?.label || 'Module'} configuration started`, 'The shell is ready for its first connected workflow.');
      break;
    case 'toggle-sidebar':
      $('#sidebar').classList.toggle('is-open');
      break;
    case 'close-modal':
      closeModal();
      break;
    default:
      break;
  }
}

document.addEventListener('click', (event) => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) {
    setActiveView(viewButton.dataset.view);
    return;
  }

  const actionElement = event.target.closest('[data-action]');
  if (actionElement) {
    handleAction(actionElement.dataset.action);
    return;
  }

  const rangeButton = event.target.closest('[data-range]');
  if (rangeButton) {
    updateChart(rangeButton.dataset.range);
    return;
  }

  const approvalAction = event.target.closest('[data-approval-action]');
  if (approvalAction) {
    openModal(approvalAction.dataset.approvalAction, approvalAction.dataset.approvalName);
    return;
  }

  const modalOption = event.target.closest('[data-modal-option]');
  if (modalOption) {
    closeModal();
    showToast(`${modalOption.dataset.modalOption} selected`, 'This action is ready for the connected workflow.');
    return;
  }

  if (event.target === $('#action-modal')) closeModal();
});

$('#global-search').addEventListener('input', (event) => filterActivity(event.target.value));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !$('#action-modal').hidden) closeModal();
  if (event.key === 'Tab' && !$('#action-modal').hidden) {
    const focusable = $$('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])', $('#action-modal'));
    if (focusable.length) {
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    $('#global-search').focus();
  }
});

updateTodayLabel();
updateChart('30D');

