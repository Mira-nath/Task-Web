let tasks = [
  { id: 1, text: "¡Bienvenido a la lista de tareas!", completed: true },
  { id: 2, text: "Empieza a organizar tu dia.", completed: false },
  { id: 3, text: "Añade tus pendientes.", completed: false }
];

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const errorMessage = document.getElementById('errorMessage');
const taskList = document.getElementById('taskList');
const countTotal = document.getElementById('countTotal');
const countCompleted = document.getElementById('countCompleted');
const countIncompleted = document.getElementById('countIncompleted');
const themeToggle = document.getElementById('themeToggle');

function renderTasks() {
  taskList.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-card ${task.completed ? 'completed' : ''}`;

    li.innerHTML = `
      <button type="button" class="btn-action btn-delete" data-id="${task.id}" title="Eliminar">✕</button>
      <div class="task-text-content">
        <span class="task-text">${escapeHTML(task.text)}</span>
      </div>
      <div class="task-actions-right">
        <button type="button" class="btn-action btn-edit" data-id="${task.id}" title="Editar">
          <svg class="pencil-icon" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button type="button" class="btn-action btn-check" data-id="${task.id}" title="Completar">✓</button>
      </div>
    `;

    taskList.appendChild(li);
  });

  updateCounters();
}

function updateCounters() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const incompleted = total - completed;

  countTotal.textContent = total;
  countCompleted.textContent = completed;
  countIncompleted.textContent = incompleted;
}

function addTask() {
  const text = taskInput.value.trim();

  if (text === '') {
    errorMessage.classList.add('visible');
    return;
  }

  errorMessage.classList.remove('visible');
  
  const newTask = {
    id: Date.now(),
    text: text,
    completed: false
  };

  tasks.push(newTask);
  taskInput.value = '';
  renderTasks();
}

taskList.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const id = Number(btn.getAttribute('data-id'));

  if (btn.classList.contains('btn-delete')) {
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
  } else if (btn.classList.contains('btn-edit')) {
    const task = tasks.find(task => task.id === id);
    if (task) {
      const newText = prompt("Edita tu tarea:", task.text);
      if (newText !== null && newText.trim() !== '') {
        task.text = newText.trim();
        renderTasks();
      }
    }
  } else if (btn.classList.contains('btn-check')) {
    tasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    renderTasks();
  }
});

// Seguridad contra inyecciones HTML
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});

taskInput.addEventListener('input', () => {
  if (taskInput.value.trim() !== '') {
    errorMessage.classList.remove('visible');
  }
});

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});

renderTasks();