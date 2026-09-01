(() => {
  "use strict";

  const STORAGE_KEY = "todo-app.items.v1";

  const FILTERS = {
    all: () => true,
    active: (todo) => !todo.completed,
    completed: (todo) => todo.completed,
  };

  /** @type {{ id: string, text: string, completed: boolean, createdAt: number }[]} */
  let todos = [];
  let currentFilter = "all";

  // --- DOM refs ---
  const form = document.getElementById("new-todo-form");
  const input = document.getElementById("new-todo-input");
  const list = document.getElementById("todo-list");
  const emptyState = document.getElementById("empty-state");
  const itemCount = document.getElementById("item-count");
  const clearCompletedBtn = document.getElementById("clear-completed");
  const filterButtons = Array.from(document.querySelectorAll(".filters__btn"));
  const template = document.getElementById("todo-item-template");

  // --- Persistence ---
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((t) => t && typeof t.id === "string" && typeof t.text === "string")
        .map((t) => ({
          id: t.id,
          text: t.text,
          completed: Boolean(t.completed),
          createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
        }));
    } catch {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      /* storage unavailable (private mode / quota) — app keeps working in memory */
    }
  }

  // --- Helpers ---
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // --- Mutations ---
  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    todos.push({ id: uid(), text: trimmed, completed: false, createdAt: Date.now() });
    save();
    render();
  }

  function updateTodo(id, patch) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    Object.assign(todo, patch);
    save();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    save();
    render();
  }

  function clearCompleted() {
    todos = todos.filter((t) => !t.completed);
    save();
    render();
  }

  function setFilter(filter) {
    if (!(filter in FILTERS)) return;
    currentFilter = filter;
    filterButtons.forEach((btn) =>
      btn.classList.toggle("is-active", btn.dataset.filter === filter)
    );
    render();
  }

  // --- Rendering ---
  function render() {
    const visible = todos.filter(FILTERS[currentFilter]);
    list.textContent = "";

    for (const todo of visible) {
      const node = template.content.firstElementChild.cloneNode(true);
      node.dataset.id = todo.id;
      node.classList.toggle("is-completed", todo.completed);

      const checkbox = node.querySelector(".todo__checkbox");
      checkbox.checked = todo.completed;
      checkbox.setAttribute("aria-label", todo.completed ? "완료 취소" : "완료로 표시");

      node.querySelector(".todo__text").textContent = todo.text;

      list.appendChild(node);
    }

    const remaining = todos.reduce((n, t) => n + (t.completed ? 0 : 1), 0);
    itemCount.textContent = `${remaining}개 남음`;

    clearCompletedBtn.disabled = !todos.some((t) => t.completed);

    emptyState.hidden = visible.length > 0;
    emptyState.textContent =
      todos.length === 0
        ? "할 일이 없습니다. 위에서 추가해 보세요!"
        : "이 필터에 해당하는 할 일이 없습니다.";
  }

  // --- Inline editing ---
  function startEdit(node) {
    const id = node.dataset.id;
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const textEl = node.querySelector(".todo__text");
    const editEl = node.querySelector(".todo__edit");

    editEl.value = todo.text;
    textEl.hidden = true;
    editEl.hidden = false;
    editEl.focus();
    editEl.setSelectionRange(editEl.value.length, editEl.value.length);

    let done = false;

    function cleanup() {
      done = true;
      editEl.removeEventListener("keydown", onKeydown);
      editEl.removeEventListener("blur", commit);
    }

    function commit() {
      if (done) return;
      cleanup();
      const next = editEl.value.trim();
      if (next && next !== todo.text) {
        updateTodo(id, { text: next });
      } else {
        render();
      }
    }

    function cancel() {
      if (done) return;
      cleanup();
      render();
    }

    function onKeydown(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    }

    editEl.addEventListener("keydown", onKeydown);
    editEl.addEventListener("blur", commit);
  }

  // --- Events ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = "";
    input.focus();
  });

  list.addEventListener("change", (e) => {
    const checkbox = e.target.closest(".todo__checkbox");
    if (!checkbox) return;
    updateTodo(checkbox.closest(".todo").dataset.id, { completed: checkbox.checked });
  });

  list.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".todo__delete");
    if (deleteBtn) deleteTodo(deleteBtn.closest(".todo").dataset.id);
  });

  list.addEventListener("dblclick", (e) => {
    const textEl = e.target.closest(".todo__text");
    if (textEl) startEdit(textEl.closest(".todo"));
  });

  list.addEventListener("keydown", (e) => {
    const textEl = e.target.closest(".todo__text");
    if (textEl && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      startEdit(textEl.closest(".todo"));
    }
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);

  // Keep other tabs in sync
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      todos = load();
      render();
    }
  });

  // --- Init ---
  todos = load();
  render();
})();
