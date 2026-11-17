/* =========================================================
   TaskFlow — Gerenciador de Tarefas
   Lógica da aplicação (JavaScript puro)
   Autor: Daniel Lisboa
   ========================================================= */

'use strict';

/* ---------- 1. Constantes e estado ---------- */

const STORAGE_KEY = 'taskflow:tasks';
const THEME_KEY = 'taskflow:theme';

// Peso de cada prioridade (usado na ordenação)
const PRIORITY_WEIGHT = { alta: 3, media: 2, baixa: 1 };
const PRIORITY_LABEL = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

const LIST_TITLES = {
  todas: 'Todas as tarefas',
  pendentes: 'Tarefas pendentes',
  concluidas: 'Tarefas concluídas'
};

// Estado da aplicação
const state = {
  tasks: [],
  status: 'todas',      // todas | pendentes | concluidas
  priority: 'todas',    // todas | alta | media | baixa
  search: '',
  sort: 'prioridade',   // prioridade | recentes | antigas | alfabetica
  editingId: null,
  deletingId: null
};

/* ---------- 2. Referências aos elementos ---------- */

const $ = (selector) => document.querySelector(selector);

const els = {
  greeting: $('#greeting'),
  taskForm: $('#taskForm'),
  taskTitle: $('#taskTitle'),
  taskDescription: $('#taskDescription'),
  taskPriority: $('#taskPriority'),
  formError: $('#formError'),
  searchInput: $('#searchInput'),
  sortSelect: $('#sortSelect'),
  taskList: $('#taskList'),
  listTitle: $('#listTitle'),
  emptyState: $('#emptyState'),
  emptyTitle: $('#emptyTitle'),
  emptyText: $('#emptyText'),
  statusFilters: $('#statusFilters'),
  priorityFilters: $('#priorityFilters'),
  countAll: $('#countAll'),
  countPending: $('#countPending'),
  countDone: $('#countDone'),
  statTotal: $('#statTotal'),
  statPending: $('#statPending'),
  statDone: $('#statDone'),
  statPercent: $('#statPercent'),
  progressBar: $('#progressBar'),
  progressFill: $('#progressFill'),
  themeToggle: $('#themeToggle'),
  editDialog: $('#editDialog'),
  editForm: $('#editForm'),
  editTitle: $('#editTitle'),
  editDescription: $('#editDescription'),
  editPriority: $('#editPriority'),
  editError: $('#editError'),
  editCancel: $('#editCancel'),
  deleteDialog: $('#deleteDialog'),
  deleteTaskName: $('#deleteTaskName'),
  deleteCancel: $('#deleteCancel'),
  deleteConfirm: $('#deleteConfirm'),
  toast: $('#toast')
};

/* ---------- 3. Armazenamento (localStorage) ---------- */

function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // Dados corrompidos ou armazenamento indisponível: começa vazio
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  } catch (error) {
    showToast('Não foi possível salvar no navegador.');
  }
}

/* ---------- 4. Utilitários ---------- */

// Gera um identificador único simples
function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Remove acentos e coloca em minúsculas (pesquisa mais tolerante)
function normalize(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

let toastTimer;
function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('is-visible'), 2400);
}

function setGreeting() {
  const hour = new Date().getHours();
  let text = 'Boa noite!';
  if (hour >= 5 && hour < 12) text = 'Bom dia!';
  else if (hour >= 12 && hour < 18) text = 'Boa tarde!';
  els.greeting.textContent = text;
}

/* ---------- 5. Operações com tarefas (CRUD) ---------- */

function addTask(title, description, priority) {
  state.tasks.push({
    id: createId(),
    title,
    description,
    priority,
    completed: false,
    createdAt: Date.now()
  });
  saveTasks();
  render();
}

function updateTask(id, changes) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  Object.assign(task, changes);
  saveTasks();
  render();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  updateTask(id, { completed: !task.completed });
  showToast(task.completed ? 'Tarefa concluída! 🎉' : 'Tarefa marcada como pendente.');
}

/* ---------- 6. Filtros, pesquisa e ordenação ---------- */

function getVisibleTasks() {
  const term = normalize(state.search.trim());

  const filtered = state.tasks.filter((task) => {
    if (state.status === 'pendentes' && task.completed) return false;
    if (state.status === 'concluidas' && !task.completed) return false;
    if (state.priority !== 'todas' && task.priority !== state.priority) return false;
    if (term && !normalize(task.title).includes(term)) return false;
    return true;
  });

  const sorters = {
    prioridade: (a, b) =>
      PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority] || b.createdAt - a.createdAt,
    recentes: (a, b) => b.createdAt - a.createdAt,
    antigas: (a, b) => a.createdAt - b.createdAt,
    alfabetica: (a, b) => a.title.localeCompare(b.title, 'pt-BR')
  };

  // Pendentes primeiro; depois aplica o critério escolhido
  return filtered.sort((a, b) =>
    Number(a.completed) - Number(b.completed) || sorters[state.sort](a, b)
  );
}

/* ---------- 7. Renderização ---------- */

// Cria o título destacando o termo pesquisado (sem usar innerHTML com dados do usuário)
function buildHighlightedTitle(title) {
  const fragment = document.createDocumentFragment();
  const term = normalize(state.search.trim());
  const index = term ? normalize(title).indexOf(term) : -1;

  if (index === -1) {
    fragment.append(title);
    return fragment;
  }

  const mark = document.createElement('mark');
  mark.textContent = title.slice(index, index + term.length);
  fragment.append(title.slice(0, index), mark, title.slice(index + term.length));
  return fragment;
}

// Ícones SVG usados nos itens da lista (conteúdo fixo, sem dados do usuário)
const ICONS = {
  check: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  edit: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
  trash: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>'
};

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task' + (task.completed ? ' is-done' : '');
  li.dataset.id = task.id;
  li.dataset.priority = task.priority;

  li.innerHTML = `
    <button class="task-check" type="button" data-action="toggle">${ICONS.check}</button>
    <div class="task-body">
      <p class="task-title"></p>
      <p class="task-desc"></p>
      <div class="task-meta">
        <span class="badge badge-${task.priority}">${PRIORITY_LABEL[task.priority]}</span>
        <span class="task-date">Criada em ${formatDate(task.createdAt)}</span>
      </div>
    </div>
    <div class="task-actions">
      <button class="action-btn edit" type="button" data-action="edit" title="Editar">${ICONS.edit}</button>
      <button class="action-btn delete" type="button" data-action="delete" title="Excluir">${ICONS.trash}</button>
    </div>`;

  // Textos do usuário são inseridos com textContent (seguro contra injeção de HTML)
  li.querySelector('.task-title').append(buildHighlightedTitle(task.title));
  const desc = li.querySelector('.task-desc');
  if (task.description) desc.textContent = task.description;
  else desc.remove();

  const checkLabel = task.completed ? 'Marcar como pendente' : 'Marcar como concluída';
  li.querySelector('[data-action="toggle"]').setAttribute('aria-label', `${checkLabel}: ${task.title}`);
  li.querySelector('[data-action="edit"]').setAttribute('aria-label', `Editar: ${task.title}`);
  li.querySelector('[data-action="delete"]').setAttribute('aria-label', `Excluir: ${task.title}`);

  return li;
}

function renderStats() {
  const total = state.tasks.length;
  const done = state.tasks.filter((t) => t.completed).length;
  const pending = total - done;
  const percent = total ? Math.round((done / total) * 100) : 0;

  els.statTotal.textContent = total;
  els.statPending.textContent = pending;
  els.statDone.textContent = done;
  els.statPercent.textContent = `${percent}%`;
  els.progressFill.style.width = `${percent}%`;
  els.progressBar.setAttribute('aria-valuenow', percent);

  els.countAll.textContent = total;
  els.countPending.textContent = pending;
  els.countDone.textContent = done;
}

function renderEmptyState(hasTasks) {
  if (!hasTasks) {
    els.emptyTitle.textContent = 'Nenhuma tarefa por aqui';
    els.emptyText.textContent = 'Adicione sua primeira tarefa usando o formulário acima.';
  } else if (state.search.trim()) {
    els.emptyTitle.textContent = 'Nenhum resultado encontrado';
    els.emptyText.textContent = `Não há tarefas com "${state.search.trim()}" neste filtro.`;
  } else {
    els.emptyTitle.textContent = 'Nada neste filtro';
    els.emptyText.textContent = 'Experimente selecionar outra situação ou prioridade.';
  }
}

function render() {
  const visible = getVisibleTasks();

  els.taskList.replaceChildren(...visible.map(createTaskElement));
  els.emptyState.hidden = visible.length > 0;
  if (!visible.length) renderEmptyState(state.tasks.length > 0);

  els.listTitle.textContent = LIST_TITLES[state.status];
  renderStats();
}

/* ---------- 8. Tema claro/escuro ---------- */

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch (error) {
    /* sem armazenamento: o tema vale só nesta visita */
  }
  showToast(next === 'dark' ? 'Tema escuro ativado' : 'Tema claro ativado');
}

/* ---------- 9. Modais de edição e exclusão ---------- */

function openEditDialog(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  state.editingId = id;
  els.editTitle.value = task.title;
  els.editDescription.value = task.description || '';
  els.editPriority.value = task.priority;
  els.editError.textContent = '';
  els.editTitle.classList.remove('is-invalid');
  els.editDialog.showModal();
  els.editTitle.focus();
}

function openDeleteDialog(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  state.deletingId = id;
  els.deleteTaskName.textContent = `"${task.title}"`;
  els.deleteDialog.showModal();
}

// Remove a tarefa com uma pequena animação de saída
function confirmDelete() {
  const id = state.deletingId;
  els.deleteDialog.close();
  if (!id) return;

  const item = els.taskList.querySelector(`[data-id="${id}"]`);
  const finish = () => {
    deleteTask(id);
    showToast('Tarefa excluída.');
  };

  if (item && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    item.classList.add('is-removing');
    item.addEventListener('animationend', finish, { once: true });
  } else {
    finish();
  }
  state.deletingId = null;
}

/* ---------- 10. Validação ---------- */

function validateTitle(input, errorEl) {
  const title = input.value.trim();
  if (!title) {
    errorEl.textContent = 'Informe um título para a tarefa.';
    input.classList.add('is-invalid');
    input.focus();
    return null;
  }
  errorEl.textContent = '';
  input.classList.remove('is-invalid');
  return title;
}

/* ---------- 11. Eventos ---------- */

function bindEvents() {
  // Criar tarefa
  els.taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = validateTitle(els.taskTitle, els.formError);
    if (!title) return;

    addTask(title, els.taskDescription.value.trim(), els.taskPriority.value);
    els.taskForm.reset();
    els.taskPriority.value = 'media';
    els.taskTitle.focus();
    showToast('Tarefa adicionada!');
  });

  els.taskTitle.addEventListener('input', () => {
    if (els.taskTitle.value.trim()) {
      els.formError.textContent = '';
      els.taskTitle.classList.remove('is-invalid');
    }
  });

  // Ações nos itens da lista (delegação de eventos)
  els.taskList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = button.closest('.task').dataset.id;

    if (button.dataset.action === 'toggle') toggleTask(id);
    if (button.dataset.action === 'edit') openEditDialog(id);
    if (button.dataset.action === 'delete') openDeleteDialog(id);
  });

  // Filtro por situação
  els.statusFilters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-status]');
    if (!button) return;
    state.status = button.dataset.status;
    setActive(els.statusFilters, button);
    render();
  });

  // Filtro por prioridade
  els.priorityFilters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-priority]');
    if (!button) return;
    state.priority = button.dataset.priority;
    setActive(els.priorityFilters, button);
    render();
  });

  // Pesquisa e ordenação
  els.searchInput.addEventListener('input', () => {
    state.search = els.searchInput.value;
    render();
  });

  els.sortSelect.addEventListener('change', () => {
    state.sort = els.sortSelect.value;
    render();
  });

  // Tema
  els.themeToggle.addEventListener('click', toggleTheme);

  // Modal de edição
  els.editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = validateTitle(els.editTitle, els.editError);
    if (!title) return;

    updateTask(state.editingId, {
      title,
      description: els.editDescription.value.trim(),
      priority: els.editPriority.value
    });
    els.editDialog.close();
    showToast('Tarefa atualizada!');
  });

  els.editCancel.addEventListener('click', () => els.editDialog.close());
  els.editDialog.addEventListener('close', () => { state.editingId = null; });

  // Modal de exclusão
  els.deleteCancel.addEventListener('click', () => els.deleteDialog.close());
  els.deleteConfirm.addEventListener('click', confirmDelete);

  // Fecha os modais ao clicar fora deles
  [els.editDialog, els.deleteDialog].forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
}

function setActive(group, activeButton) {
  group.querySelectorAll('.filter-btn').forEach((btn) => {
    const isActive = btn === activeButton;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

/* ---------- 12. Inicialização ---------- */

function init() {
  state.tasks = loadTasks();
  setGreeting();
  setActive(els.statusFilters, els.statusFilters.querySelector('.is-active'));
  setActive(els.priorityFilters, els.priorityFilters.querySelector('.is-active'));
  bindEvents();
  render();
}

init();
