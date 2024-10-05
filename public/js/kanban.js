let currentTaskId = 1;
let currentEditingTask = null;

document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtns = document.querySelectorAll('.add-task-btn');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const closeBtn = taskModal.querySelector('.close');

    addTaskBtns.forEach(btn => {
        btn.addEventListener('click', () => openTaskModal(btn.dataset.column));
    });

    saveTaskBtn.addEventListener('click', saveTask);
    closeBtn.addEventListener('click', closeTaskModal);

    // Initialize drag and drop
    const columns = document.querySelectorAll('.kanban-column-content');
    columns.forEach(column => {
        new Sortable(column, {
            group: 'shared',
            animation: 150,
            onEnd: updateTaskStatus
        });
    });
});

function openTaskModal(column) {
    const taskModal = document.getElementById('taskModal');
    const taskModalTitle = document.getElementById('taskModalTitle');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');

    currentEditingTask = null;
    taskModalTitle.textContent = 'Add New Task';
    taskTitleInput.value = '';
    taskDescriptionInput.value = '';
    taskModal.dataset.column = column;

    taskModal.style.display = 'block';
}

function closeTaskModal() {
    const taskModal = document.getElementById('taskModal');
    taskModal.style.display = 'none';
}

function saveTask() {
    const taskTitle = document.getElementById('taskTitle').value;
    const taskDescription = document.getElementById('taskDescription').value;
    const column = document.getElementById('taskModal').dataset.column;

    if (taskTitle.trim() === '') {
        alert('Please enter a task title');
        return;
    }

    if (currentEditingTask) {
        // Update existing task
        currentEditingTask.querySelector('h3').textContent = taskTitle;
        currentEditingTask.querySelector('p').textContent = taskDescription;
    } else {
        // Create new task
        const task = createTaskElement(currentTaskId++, taskTitle, taskDescription);
        document.querySelector(`#${column} .kanban-column-content`).appendChild(task);
    }

    closeTaskModal();
}

function createTaskElement(id, title, description) {
    const task = document.createElement('div');
    task.classList.add('kanban-task');
    task.dataset.id = id;
    task.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
        <button class="edit-task-btn">Edit</button>
        <button class="delete-task-btn">Delete</button>
    `;

    task.querySelector('.edit-task-btn').addEventListener('click', () => editTask(task));
    task.querySelector('.delete-task-btn').addEventListener('click', () => deleteTask(task));

    return task;
}

function editTask(task) {
    const taskModal = document.getElementById('taskModal');
    const taskModalTitle = document.getElementById('taskModalTitle');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');

    currentEditingTask = task;
    taskModalTitle.textContent = 'Edit Task';
    taskTitleInput.value = task.querySelector('h3').textContent;
    taskDescriptionInput.value = task.querySelector('p').textContent;
    taskModal.dataset.column = task.closest('.kanban-column').id;

    taskModal.style.display = 'block';
}

function deleteTask(task) {
    if (confirm('Are you sure you want to delete this task?')) {
        task.remove();
    }
}

function updateTaskStatus(evt) {
    const task = evt.item;
    const newStatus = evt.to.closest('.kanban-column').id;
    console.log(`Task ${task.dataset.id} moved to ${newStatus}`);
    // Here you can add code to update the task status in your data storage
}