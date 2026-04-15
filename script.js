document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li class="empty-state">No hay tareas</li>';
            return;
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="task-checkbox" data-id="${task.id}"></div>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="delete-btn" data-id="${task.id}">×</button>
            `;
            taskList.appendChild(li);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;

        const task = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };

        tasks.push(task);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        taskInput.focus();
    }

    function toggleTask(id) {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    addBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    taskList.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.task-checkbox');
        const deleteBtn = e.target.closest('.delete-btn');

        if (checkbox) {
            toggleTask(checkbox.dataset.id);
        } else if (deleteBtn) {
            deleteTask(deleteBtn.dataset.id);
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    renderTasks();
});