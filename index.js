import fetchService from './fetchService.js';

// URL de tu servidor local (la base de datos simulada en db.json)
const URL_API = 'http://localhost:3000/tasks';

// Empezamos con la lista vacía porque ahora los datos vienen del servidor
let tasks = [];

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const errorMessage = document.getElementById('errorMessage');
const taskList = document.getElementById('taskList');
const countTotal = document.getElementById('countTotal');
const countCompleted = document.getElementById('countCompleted');
const countIncompleted = document.getElementById('countIncompleted');
const themeToggle = document.getElementById('themeToggle');

// 1. FUNCIÓN PARA OBTENER LAS TAREAS DE LA BASE DE DATOS (GET)
async function cargarTareas() {
  try {
    const resultado = await fetchService.get(URL_API);
    tasks = resultado.data; // Guardamos las tareas que vienen de db.json
    renderTasks();          // Pintamos en pantalla
  } catch (error) {
    console.error("Error al cargar las tareas:", error);
  }
}

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

// 2. FUNCIÓN PARA AGREGAR TAREA (POST)
async function addTask() {
  const text = taskInput.value.trim();

  if (text === '') {
    errorMessage.classList.add('visible');
    return;
  }

  errorMessage.classList.remove('visible');
  
  const nuevaTarea = {
    text: text,
    completed: false
  };

  try {
    await fetchService.post(URL_API, nuevaTarea);
    taskInput.value = '';
    cargarTareas(); // Recargamos la lista desde el servidor para ver la nueva
  } catch (error) {
    console.error("Error al crear la tarea:", error);
  }
}

// 3. EVENTOS DE LA LISTA (ELIMINAR, EDITAR, COMPLETAR)
taskList.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const id = btn.getAttribute('data-id');

  // ELIMINAR (DELETE)
  if (btn.classList.contains('btn-delete')) {
    try {
      await fetchService.del(`${URL_API}/${id}`);
      cargarTareas();
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
    }
  } 
  // EDITAR (PUT / PATCH)
  else if (btn.classList.contains('btn-edit')) {
    const task = tasks.find(t => String(t.id) === String(id));
    if (task) {
      const newText = prompt("Edita tu tarea:", task.text);
      if (newText !== null && newText.trim() !== '') {
        try {
          await fetchService.patch(`${URL_API}/${id}`, { text: newText.trim() });
          cargarTareas();
        } catch (error) {
          console.error("Error al editar la tarea:", error);
        }
      }
    }
  } 
  // COMPLETAR / DESCOMPLETAR (PATCH)
  else if (btn.classList.contains('btn-check')) {
    const task = tasks.find(t => String(t.id) === String(id));
    if (task) {
      try {
        await fetchService.patch(`${URL_API}/${id}`, { completed: !task.completed });
        cargarTareas();
      } catch (error) {
        console.error("Error al actualizar el estado de la tarea:", error);
      }
    }
  }
});

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

// Al cargar la página, traemos los datos del servidor por primera vez
cargarTareas();