document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const counter = document.getElementById('taskCounter');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateCounter() {
        const pending = tasks.filter(t => !t.completed).length;
        const total = tasks.length;
        counter.textContent = `${pending} pendiente${pending !== 1 ? 's' : ''} · ${total} total`;
    }

    function renderTasks() {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        }).sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return Number(b.id) - Number(a.id);
        });

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li class="empty-state">No hay tareas</li>';
            updateCounter();
            return;
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;
            li.innerHTML = `
                <div class="task-checkbox" data-id="${task.id}"></div>
                <span class="task-text" data-id="${task.id}">${escapeHtml(task.text)}</span>
                <button class="delete-btn" data-id="${task.id}">×</button>
            `;
            taskList.appendChild(li);
        });

        updateCounter();
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
            completed: false,
            createdAt: new Date().toISOString()
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

    function editTask(id, newText) {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, text: newText } : task
        );
        saveTasks();
        renderTasks();
    }

    function startEdit(element, id) {
        const currentText = tasks.find(t => t.id === id).text;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = currentText;

        element.innerHTML = '';
        element.appendChild(input);
        input.focus();
        input.select();

        const finishEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                editTask(id, newText);
            } else {
                renderTasks();
            }
        };

        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') finishEdit();
            if (e.key === 'Escape') renderTasks();
        });
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

    taskList.addEventListener('dblclick', (e) => {
        const taskText = e.target.closest('.task-text');
        if (taskText && !taskText.closest('.task-item').classList.contains('completed')) {
            startEdit(taskText, taskText.dataset.id);
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