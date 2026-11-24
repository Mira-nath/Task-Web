const STORAGE_KEY = 'task_web_tasks_v1';

async function ensureStorageInitialized() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing !== null) {
    return JSON.parse(existing);
  }

  let initialTasks = [];
  try {
    const res = await fetch('./db.json');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json)) {
        initialTasks = json;
      } else if (json && Array.isArray(json.tasks)) {
        initialTasks = json.tasks;
      }
    }
  } catch (_) {
    initialTasks = [];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));
  return initialTasks;
}

function saveStorageTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function parseTaskEndpoint(url) {
  // Reconoce URLs tipo ".../tasks" o ".../tasks/123" (con o sin localhost:3000)
  const match = String(url).match(/\/tasks(?:\/([^/?#]+))?$/);
  if (!match) return null;
  return {
    id: match[1] ? decodeURIComponent(match[1]) : null
  };
}

const get = async (url) => {
  const endpoint = parseTaskEndpoint(url);
  if (endpoint && !endpoint.id) {
    const tasks = await ensureStorageInitialized();
    return { response: { ok: true, status: 200 }, data: tasks };
  }

  const response = await fetch(url, { method: 'GET' });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error: ${data.message}`);
  return { response, data };
};

const post = async (url, payload) => {
  const endpoint = parseTaskEndpoint(url);
  if (endpoint && !endpoint.id) {
    const tasks = await ensureStorageInitialized();
    const newId =
      payload && payload.id !== undefined && payload.id !== null
        ? payload.id
        : String(Date.now());
    const createdTask = {
      ...payload,
      id: String(newId)
    };
    tasks.push(createdTask);
    saveStorageTasks(tasks);
    return { response: { ok: true, status: 201 }, data: createdTask };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error: ${data.message}`);
  return { response, data };
};

const put = async (url, payload) => {
  const endpoint = parseTaskEndpoint(url);
  if (endpoint && endpoint.id) {
    const tasks = await ensureStorageInitialized();
    let updatedTask = null;
    const nextTasks = tasks.map((t) => {
      if (String(t.id) === String(endpoint.id)) {
        updatedTask = { ...payload, id: t.id };
        return updatedTask;
      }
      return t;
    });
    saveStorageTasks(nextTasks);
    return { response: { ok: true, status: 200 }, data: updatedTask };
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error: ${data.message}`);
  return { response, data };
};

const patch = async (url, payload) => {
  const endpoint = parseTaskEndpoint(url);
  if (endpoint && endpoint.id) {
    const tasks = await ensureStorageInitialized();
    let updatedTask = null;
    const nextTasks = tasks.map((t) => {
      if (String(t.id) === String(endpoint.id)) {
        updatedTask = { ...t, ...payload };
        return updatedTask;
      }
      return t;
    });
    saveStorageTasks(nextTasks);
    return { response: { ok: true, status: 200 }, data: updatedTask };
  }

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error: ${data.message}`);
  return { response, data };
};

const del = async (url) => {
  const endpoint = parseTaskEndpoint(url);
  if (endpoint && endpoint.id) {
    const tasks = await ensureStorageInitialized();
    const nextTasks = tasks.filter((t) => String(t.id) !== String(endpoint.id));
    saveStorageTasks(nextTasks);
    return { response: { ok: true, status: 200 }, data: { deleted: true, id: endpoint.id } };
  }

  const response = await fetch(url, { method: 'DELETE' });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error: ${data.message}`);
  return { response, data };
};

const fetchService = { post, get, put, patch, del };
export default fetchService;