document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const notesSection = document.getElementById('notes-section');
    const notesList = document.getElementById('notes-list');
    const modal = document.getElementById("myModal");
    const noteInput = document.getElementById("note-input");
    const noteBody = document.getElementById("note-body");
    let currentEditingIndex = null;
    renderAllTasks();
    // Centralized event listeners
    document.body.addEventListener('click', handleButtonClick);

    // Show the notes section and hide the home screen
    document.getElementById('notes-button').addEventListener('click', () => {
        showNotes();
        renderNotes(); // Display saved notes
        content.appendChild(notesSection);
    });

    if (localStorage.getItem('low-priorities') === null) {
        localStorage.setItem('low-priorities', JSON.stringify([]));
    }

    if (localStorage.getItem('mid-priorities') === null) {
        localStorage.setItem('mid-priorities', JSON.stringify([]));
    }

    if (localStorage.getItem('high-priorities') === null) {
        localStorage.setItem('high-priorities', JSON.stringify([]));
    }

    // Show home screen
    document.getElementById('home-button').addEventListener('click', showHome);

    // Open modal for adding a new note
    document.getElementById('add-note-button').addEventListener('click', openAddNoteModal);

    // Close modal
    document.getElementById("close-modal").addEventListener('click', () => {
        modal.style.display = "none";
    });

    // Save note
    document.getElementById("submit-note-button").addEventListener('click', saveNote);

    // Centralized button click handler (edit and delete)
    function handleButtonClick(e) {
        const target = e.target;
        if (target.classList.contains('delete-note')) {
            const index = target.dataset.index;
            deleteNoteFromLocalStorage(index);
            renderNotes();
        } else if (target.classList.contains('edit-note')) {
            currentEditingIndex = target.dataset.index;
            openEditNoteModal(currentEditingIndex);
        }
    }

    // Open the modal for editing an existing note
    function openEditNoteModal(index) {
        const notes = getNotesFromLocalStorage();
        noteInput.value = notes[index].title;
        noteBody.value = notes[index].body;
        document.getElementById("modal-title").textContent = "Edit Note";
        modal.style.display = "block";
    }

    // Open the modal for adding a new note
    function openAddNoteModal() {
        currentEditingIndex = null;
        noteInput.value = '';
        noteBody.value = '';
        document.getElementById("modal-title").textContent = "Add a New Note";
        modal.style.display = "block";
    }

    // Save note (either add or edit)
    function saveNote() {
        const titleText = noteInput.value.trim();
        const bodyText = noteBody.value.trim();

        if (titleText && bodyText) {
            if (currentEditingIndex !== null) {
                editNoteInLocalStorage(currentEditingIndex, titleText, bodyText);
            } else {
                addNoteToLocalStorage(titleText, bodyText);
            }
            noteInput.value = '';
            noteBody.value = '';
            modal.style.display = "none";
            renderNotes();
        } else {
            alert("Please fill in both fields.");
        }
    }

    // Fetch notes from localStorage
    function getNotesFromLocalStorage() {
        return JSON.parse(localStorage.getItem('notes')) || [];
    }

    // Add note to localStorage
    function addNoteToLocalStorage(title, body) {
        const notes = getNotesFromLocalStorage();
        notes.push({ title, body });
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // Edit note in localStorage
    function editNoteInLocalStorage(index, title, body) {
        const notes = getNotesFromLocalStorage();
        notes[index] = { title, body };
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // Delete note from localStorage
    function deleteNoteFromLocalStorage(index) {
        const notes = getNotesFromLocalStorage();
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // Render notes from localStorage
    function renderNotes() {
        const notes = getNotesFromLocalStorage();
        const fragment = document.createDocumentFragment(); // Use a fragment for better performance
        notesList.innerHTML = ''; // Clear the current list

        notes.forEach((note, index) => {
            const noteDiv = createNoteElement(note, index);
            fragment.appendChild(noteDiv);
        });

        notesList.appendChild(fragment); // Append all elements at once
    }

    // Create a note DOM element
    function createNoteElement(note, index) {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note');
        noteDiv.innerHTML = `
            <div class="note-title">${note.title}</div>
            <div>${note.body}</div>
            <button class="edit-note" data-index="${index}">Edit</button>
            <button class="delete-note" data-index="${index}">Delete</button>
        `;
        return noteDiv;
    }

    // Section visibility functions
    function showDocuments() {
        setSectionVisibility("documents-section");
    }

    function showNotes() {
        setSectionVisibility("notes-section");
    }

    function showHome() {
        setSectionVisibility("home");
    }

    function showTask() {
        setSectionVisibility("task-section");
    }

    function showReading() {
        setSectionVisibility("reading-section");
    }

    function showCalendar() {
        setSectionVisibility("calendar-section");
    }

    document.getElementById('calendar-button').addEventListener('click', showCalendar);
    document.getElementById('reading-button').addEventListener('click', showReading);
    document.getElementById('task-button').addEventListener('click', showTask);
    document.getElementById('documents-button').addEventListener('click', showDocuments);

    // Helper to set the visibility of sections
    function setSectionVisibility(visibleSectionId) {
        ['documents-section', 'notes-section', 'home', 'task-section', 'reading-section', 'calendar-section'].forEach(sectionId => {
            document.getElementById(sectionId).style.display = sectionId === visibleSectionId ? "block" : "none";
        });
    }
});

function addTask(priority) {
    var taskName = prompt("Enter task name");
    if (taskName) {
        let task = createTaskElement(taskName, priority);

        document.getElementById(`${priority}-priorities-tasks`).appendChild(task);
        updateLocalStorage(priority, taskName);

        renderNumberOfTasks();
    }
}

function createTaskElement(taskName, priority) {
    let task = document.createElement("div");
    task.classList.add("task");
    task.innerHTML = `<p>${taskName}</p>`;

    task.onclick = function () {
        removeTaskFromLocalStorage(priority, taskName);
        document.getElementById(`${priority}-priorities-tasks`).removeChild(task);
        renderNumberOfTasks();
    };

    return task;
}

function updateLocalStorage(priority, taskName) {
    let tasks = getTasksFromLocalStorage(priority);
    tasks.push(taskName);
    localStorage.setItem(`${priority}-priorities`, JSON.stringify(tasks));
}

function removeTaskFromLocalStorage(priority, taskName) {
    let tasks = getTasksFromLocalStorage(priority);
    tasks.splice(tasks.indexOf(taskName), 1);
    localStorage.setItem(`${priority}-priorities`, JSON.stringify(tasks));
}

function getTasksFromLocalStorage(priority) {
    return JSON.parse(localStorage.getItem(`${priority}-priorities`)) || [];
}

function renderAllTasks() {
    ['low', 'mid', 'high'].forEach(priority => {
        let tasks = getTasksFromLocalStorage(priority);
        tasks.forEach(taskName => {
            let taskElement = createTaskElement(taskName, priority);
            document.getElementById(`${priority}-priorities-tasks`).appendChild(taskElement);
        });
    });

    renderNumberOfTasks();
}

function renderNumberOfTasks() {
    ['low', 'mid', 'high'].forEach(priority => {
        let tasks = getTasksFromLocalStorage(priority);
        document.getElementById(`number-of-${priority}-priorities`).innerHTML = tasks.length;
    });
}

// Add functions for each priority type to call the general addTask function
function addLowPriority() {
    addTask('low');
}

function addMidPriority() {
    addTask('mid');
}

function addHighPriority() {
    addTask('high');
}
