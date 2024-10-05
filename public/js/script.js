// Navigation
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        document.querySelectorAll('.menu-item').forEach(menuItem => menuItem.classList.remove('active'));
        document.getElementById(this.dataset.section).classList.add('active');
        this.classList.add('active');
    });
});

// Modals
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

document.querySelectorAll('.close').forEach(close => {
    close.addEventListener('click', function () {
        this.closest('.modal').style.display = 'none';
    });
});

// Enhanced Notes Functionality
let currentFolder = null;
let currentNote = null;
let autoSaveTimeout = null;

function saveNotes() {
    localStorage.setItem('schoolOrganizerNotes', JSON.stringify({
        folders: folders,
        notes: notes
    }));
}

function loadNotes() {
    const savedData = JSON.parse(localStorage.getItem('schoolOrganizerNotes'));
    if (savedData) {
        folders = savedData.folders || [];
        notes = savedData.notes || [];
    }
}

let folders = [];
let notes = [];

loadNotes();

function renderFolders(parentFolder = null, level = 0) {
    const folderList = parentFolder ? 
        parentFolder.querySelector('.nested-items') : 
        document.getElementById('folderList');
    
    if (!folderList) return;

    folderList.innerHTML = '';
    folders
        .filter(folder => folder.parentId === (parentFolder ? parentFolder.dataset.folderId : null))
        .forEach(folder => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="folder-header">
                    <i class="fas fa-folder"></i>
                    <span class="folder-name">${folder.name}</span>
                </div>
            `;
            li.classList.add('folder-item');
            li.dataset.folderId = folder.id;
            li.style.paddingLeft = `${level * 20}px`;
            
            const folderHeader = li.querySelector('.folder-header');
            folderHeader.addEventListener('click', (e) => {
                e.stopPropagation();
                selectFolder(folder);
                toggleFolder(li);
            });
            folderHeader.addEventListener('contextmenu', (e) => showContextMenu(e, folder));
            
            const nestedItems = document.createElement('ul');
            nestedItems.classList.add('nested-items');
            li.appendChild(nestedItems);
            
            folderList.appendChild(li);
            renderFolders(li, level + 1);
            renderNotes(folder, li);
        });
}

function renderNotes(folder, folderElement) {
    const noteList = document.createElement('ul');
    noteList.classList.add('note-list');
    folderElement.appendChild(noteList);

    notes.filter(note => note.folderId === folder.id).forEach(note => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-file-alt"></i> ${note.title}`;
        li.classList.add('note-item');
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            selectNote(note);
        });
        li.addEventListener('contextmenu', (e) => showContextMenu(e, note));
        noteList.appendChild(li);
    });
}

function toggleFolder(folderElement) {
    folderElement.classList.toggle('open');
    const nestedItems = folderElement.querySelector('.nested-items');
    const noteList = folderElement.querySelector('.note-list');
    if (nestedItems) {
        nestedItems.style.maxHeight = folderElement.classList.contains('open') ? 
            `${nestedItems.scrollHeight}px` : '0';
    }
    if (noteList) {
        noteList.style.maxHeight = folderElement.classList.contains('open') ? 
            `${noteList.scrollHeight}px` : '0';
    }
}

function selectFolder(folder) {
    currentFolder = folder;
    document.querySelectorAll('.folder-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-folder-id="${folder.id}"]`).classList.add('active');
}

function selectNote(note) {
    currentNote = note;
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').innerHTML = note.content;
    
    // Set up auto-save for title
    document.getElementById('noteTitle').addEventListener('input', autoSave);
    
    // Set up auto-save for content
    document.getElementById('noteContent').addEventListener('input', autoSave);
}

function autoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        if (currentNote) {
            currentNote.title = document.getElementById('noteTitle').value;
            currentNote.content = document.getElementById('noteContent').innerHTML;
            saveNotes();
            const folderElement = document.querySelector(`[data-folder-id="${currentNote.folderId}"]`);
            renderNotes(currentFolder, folderElement);
        }
    }, 1000); // Auto-save after 1 second of inactivity
}

function showContextMenu(e, item) {
    e.preventDefault();
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;

    document.getElementById('renameItem').onclick = () => renameItem(item);
    document.getElementById('deleteItem').onclick = () => deleteItem(item);
}

function renameItem(item) {
    const newName = prompt('Enter new name:', item.name || item.title);
    if (newName) {
        if (item.name) {
            item.name = newName;
        } else {
            item.title = newName;
        }
        saveNotes();
        renderFolders();
        if (currentFolder) renderNotes(currentFolder, document.querySelector(`[data-folder-id="${currentFolder.id}"]`));
    }
}

function deleteItem(item) {
    if (confirm('Are you sure you want to delete this item?')) {
        if (item.name) {
            folders = folders.filter(f => f.id !== item.id);
            notes = notes.filter(n => n.folderId !== item.id);
        } else {
            notes = notes.filter(n => n.id !== item.id);
        }
        saveNotes();
        renderFolders();
        if (currentFolder) renderNotes(currentFolder, document.querySelector(`[data-folder-id="${currentFolder.id}"]`));
        if (currentNote && currentNote.id === item.id) {
            currentNote = null;
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteContent').innerHTML = '';
        }
    }
}

// Update addFolder function to support nested folders
function addFolder() {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
        const newFolder = { 
            id: Date.now(), 
            name: folderName, 
            parentId: currentFolder ? currentFolder.id : null 
        };
        folders.push(newFolder);
        saveNotes();
        renderFolders();
    }
}

// Update event listener for adding folders
document.getElementById('addFolderBtn').addEventListener('click', addFolder);

// Update addNote function
function addNote() {
    if (currentFolder) {
        const noteTitle = prompt('Enter note title:');
        if (noteTitle) {
            const newNote = { id: Date.now(), title: noteTitle, content: '', folderId: currentFolder.id };
            notes.push(newNote);
            saveNotes();
            const folderElement = document.querySelector(`[data-folder-id="${currentFolder.id}"]`);
            renderNotes(currentFolder, folderElement);
            selectNote(newNote);
        }
    } else {
        alert('Please select a folder first.');
    }
}

// Update event listener for adding notes
document.getElementById('addNoteBtn').addEventListener('click', addNote);


document.getElementById('boldBtn').addEventListener('click', () => {
    document.execCommand('bold', false, null);
});

document.getElementById('italicBtn').addEventListener('click', () => {
    document.execCommand('italic', false, null);
});

// Close context menu when clicking outside
document.addEventListener('click', () => {
    document.getElementById('contextMenu').style.display = 'none';
});

renderFolders();

// Enhanced Todo List Functionality
let todos = JSON.parse(localStorage.getItem('todos')) || [];

function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item priority-${todo.priority}`;
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${todo.text}</span>
            <select class="todo-priority">
                <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Low</option>
                <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Medium</option>
                <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>High</option>
            </select>
            <span class="todo-delete"><i class="fas fa-trash"></i></span>
        `;
        li.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodo(index));
        li.querySelector('.todo-priority').addEventListener('change', (e) => changePriority(index, e.target.value));
        li.querySelector('.todo-delete').addEventListener('click', () => deleteTodo(index));
        todoList.appendChild(li);
    });
}

function addTodo(text, priority = 'medium') {
    todos.push({ text, completed: false, priority });
    saveTodos();
    renderTodos();
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

function changePriority(index, priority) {
    todos[index].priority = priority;
    saveTodos();
    renderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

document.getElementById('addTaskBtn').addEventListener('click', () => {
    const newTaskInput = document.getElementById('newTask');
    const text = newTaskInput.value.trim();
    const priority = document.getElementById('newTaskPriority').value;
    if (text) {
        addTodo(text, priority);
        newTaskInput.value = '';
    }
});

document.getElementById('newTask').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('addTaskBtn').click();
    }
});

renderTodos();

// Document section code
function initializeDocumentSection() {
    const addDocumentBtn = document.querySelector('.add-document');
    const documentModal = document.getElementById('documentModal');
    const viewDocumentModal = document.getElementById('viewDocumentModal');
    const closeModalBtns = document.querySelectorAll('.modal .close');
    const saveDocumentBtn = document.getElementById('saveDocumentBtn');
    const documentGrid = document.querySelector('.document-grid');

    let documents = []; // Array to store documents

    if (addDocumentBtn) {
        addDocumentBtn.addEventListener('click', () => {
            documentModal.style.display = 'block';
        });
    }

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            documentModal.style.display = 'none';
            viewDocumentModal.style.display = 'none';
        });
    });

    if (saveDocumentBtn) {
        saveDocumentBtn.addEventListener('click', () => {
            const title = document.getElementById('documentTitle').value;
            const body = document.getElementById('documentBody').value;
            if (title && body) {
                const newDocument = { title, body, lastEdited: new Date() };
                documents.push(newDocument);
                addDocumentCard(newDocument);
                
                // Close the modal and reset fields
                documentModal.style.display = 'none';
                document.getElementById('documentTitle').value = '';
                document.getElementById('documentBody').value = '';
            }
        });
    }

    function addDocumentCard(doc) {  // Changed 'document' to 'doc'
        const newCard = document.createElement('div');
        newCard.className = 'document-card';
        newCard.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <h3>${doc.title}</h3>
            <p>Last edited: ${formatDate(doc.lastEdited)}</p>
        `;
        newCard.addEventListener('click', () => viewDocument(doc));
        
        if (documentGrid) {
            documentGrid.insertBefore(newCard, addDocumentBtn.nextSibling);
        }
    }

    function viewDocument(doc) {  // Changed 'document' to 'doc'
        const viewDocumentTitle = document.getElementById('viewDocumentTitle');
        const viewDocumentBody = document.getElementById('viewDocumentBody');
        
        viewDocumentTitle.textContent = doc.title;
        viewDocumentBody.innerHTML = doc.body;
        
        viewDocumentModal.style.display = 'block';
    }

    function formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    }

    // Close the modals if clicking outside of them
    window.addEventListener('click', (event) => {
        if (event.target == documentModal || event.target == viewDocumentModal) {
            documentModal.style.display = 'none';
            viewDocumentModal.style.display = 'none';
        }
    });

}

// Call the function to initialize the document section
document.addEventListener('DOMContentLoaded', initializeDocumentSection);

// Add these functions to your existing script.js file

function updateHomeDashboard() {
    updateUpcomingTasks();
    updateUpcomingEvents();
}

function updateUpcomingTasks() {
    const upcomingTasksList = document.getElementById('upcomingTasks');
    upcomingTasksList.innerHTML = '';

    // Assuming you have a global tasks array
    const tasks = getTasks(); // You'll need to implement this function to get tasks from your storage
    const sortedTasks = tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const upcomingTasks = sortedTasks.slice(0, 5); // Get the 5 most urgent tasks

    upcomingTasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-tasks"></i> ${task.title} - Due: ${formatDate(task.dueDate)}`;
        upcomingTasksList.appendChild(li);
    });

    if (upcomingTasks.length === 0) {
        upcomingTasksList.innerHTML = '<li>No upcoming tasks</li>';
    }
}

function updateUpcomingEvents() {
    const upcomingEventsList = document.getElementById('upcomingEvents');
    upcomingEventsList.innerHTML = '';

    // Assuming you have a global events array
    const events = getEvents(); // You'll need to implement this function to get events from your storage
    const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));
    const upcomingEvents = sortedEvents.filter(event => new Date(event.date) >= new Date()).slice(0, 5);

    upcomingEvents.forEach(event => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-calendar"></i> ${event.title} - ${formatDate(event.date)}`;
        upcomingEventsList.appendChild(li);
    });

    if (upcomingEvents.length === 0) {
        upcomingEventsList.innerHTML = '<li>No upcoming events</li>';
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Call this function when the page loads and whenever tasks or events are updated
document.addEventListener('DOMContentLoaded', updateHomeDashboard);

// You'll need to call updateHomeDashboard() whenever tasks or events are added, edited, or deleted

function getTasks() {
    const tasksJSON = localStorage.getItem('tasks');
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}

function getEvents() {
    const eventsJSON = localStorage.getItem('events');
    return eventsJSON ? JSON.parse(eventsJSON) : [];
}