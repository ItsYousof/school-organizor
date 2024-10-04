let bookSearch = document.getElementById('search-bar');
let bookList = document.getElementById('book-list');
let selectedBook = {}; // This will store the selected book's details

// Initialize localStorage for books if not already present
if (localStorage.getItem('books') === null) {
    localStorage.setItem('books', JSON.stringify([]));
}

// Event listener for the search bar
bookSearch.addEventListener('input', () => {
    let value = bookSearch.value;
    if (value) {
        let url = 'https://www.googleapis.com/books/v1/volumes?q=' + value;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                let books = data.items;
                bookList.innerHTML = ''; // Clear the current list

                books.forEach(book => {
                    let title = book.volumeInfo.title;
                    let img = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : '';
                    let description = book.volumeInfo.description || 'No description available';

                    // Create a new div for each suggestion
                    let bookItem = document.createElement('div');
                    bookItem.className = 'book-item';
                    bookItem.innerHTML = `
                        <strong>${title}</strong>
                        <img src="${img}" alt="${title}" width="50" height="75">
                    `;
                    bookList.appendChild(bookItem);

                    // Add click event to select the book and store its details
                    bookItem.addEventListener('click', () => {
                        selectedBook = {
                            name: title,
                            img: img,
                            description: description,
                            status: 'reading' // Default status is reading
                        };

                        // Store the selected book's details in local storage
                        let books = JSON.parse(localStorage.getItem('books')) || [];
                        books.push(selectedBook);
                        localStorage.setItem('books', JSON.stringify(books));

                        // Clear the book list and search bar
                        bookList.innerHTML = '';
                        bookSearch.value = title; // Set the input to the selected book's title

                        bookSearch.blur(); // Remove focus from the search bar
                        bookSearch.value = ''; // Clear the search bar

                        // Re-render the reading list to include the newly added book
                        renderReadingList();
                    });
                });
            });
    } else {
        bookList.innerHTML = ''; // Clear the list if the search bar is empty
    }
});

// Function to render the reading list
function renderReadingList() {
    let books = JSON.parse(localStorage.getItem('books')) || [];
    let content = '';
    books.forEach((book, index) => {
        let firstPeriodInDescription = book.description.indexOf('.');
        content += `
            <div class="book" data-index="${index}">
                <img src="${book.img}" alt="${book.name}" width="50" height="75">
                <strong><i class="fas fa-book"></i> ${book.name}</strong>
                <p>${firstPeriodInDescription !== -1 ? book.description.substring(0, firstPeriodInDescription) : book.description}</p>

                <div style="margin-top: 10px" class="tags">
                    <span class="tag ${book.status}" onclick="toggleStatus(${index})">
                        <i class="fas fa-circle"></i> ${book.status === 'reading' ? 'Reading' : 'Completed'}
                    </span>
                </div>
            </div>
        `;
    });
    document.getElementById('reading-list').innerHTML = content;
}

// Function to toggle book status between "reading" and "completed"
function toggleStatus(index) {
    let books = JSON.parse(localStorage.getItem('books'));
    let book = books[index];

    // Toggle status
    if (book.status === 'reading') {
        book.status = 'completed';
    } else {
        book.status = 'reading';
    }

    // Update localStorage
    localStorage.setItem('books', JSON.stringify(books));

    // Re-render the reading list to reflect the updated status
    renderReadingList();
}

// Initial render of the reading list
renderReadingList();
function renderCompletedBooks() {
    let books = JSON.parse(localStorage.getItem('books')) || [];
    let content = '';

    books.forEach(book => {
        if (book.status === 'completed') {
            content += `
                <div class="comp-book">
                    <img src="${book.img}" alt="${book.name}" width="50" height="75">
                    <strong><i class="fas fa-book"></i> ${book.name}</strong>
                </div>
            `;
        }
    });

    document.getElementById('completed-books').innerHTML = content;
}

renderCompletedBooks();

// ---------------------------------------------------------------------------------
const monthYear = document.getElementById('monthYear');
const dates = document.getElementById('dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dat = document.getElementById('dat');
const eventsDiv = document.getElementById('events');
const eventInput = document.getElementById('eventInput');
const addEventBtn = document.getElementById('addEventBtn');

let currentDate = new Date();
let selectedDate = null; // Stores the currently selected date

const updateCalendar = () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDay = new Date(currentYear, currentMonth, 0);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = firstDay.getDay();

    const monthYearString = currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    monthYear.textContent = monthYearString;

    let datesHTML = '';

    for (let i = firstDayIndex; i > 0; i--) {
        const prevDate = new Date(currentYear, currentMonth, 0 - i + 1);
        datesHTML += `<div class="date inactive">${prevDate.getDate()}</div>`;
    }

    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const dateKey = date.toISOString().split('T')[0]; // Key for localStorage
        const activeClass = date.toDateString() === new Date().toDateString() ? 'active' : '';
        const eventClass = localStorage.getItem(dateKey) ? 'eventable' : ''; // Add 'eventable' if event exists

        datesHTML += `<div class="date ${activeClass} ${eventClass}" data-date="${dateKey}">${i}</div>`;
    }

    for (let i = 1; i <= 7 - lastDayIndex; i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        datesHTML += `<div class="date inactive">${nextDate.getDate()}</div>`;
    }

    dates.innerHTML = datesHTML;

    // Add click listeners for each date
    document.querySelectorAll('.date').forEach(dateDiv => {
        dateDiv.addEventListener('click', function () {
            const clickedDate = this.getAttribute('data-date');
            if (clickedDate) {
                selectedDate = clickedDate;
                dat.textContent = `Selected Date: ${clickedDate}`;
                showEvents(clickedDate); // Show events for the selected date
            }
        });
    });
};

const showEvents = (dateKey) => {
    const events = localStorage.getItem(dateKey);
    eventsDiv.innerHTML = events ? events.split(',').map(event => `<div class="event" onclick="deleteEvent('${dateKey}', '${event}')">${event}</div>`).join('') : 'No events';
};

function deleteEvent(dateKey, event) {
    let events = localStorage.getItem(dateKey);
    if (events) {
        let eventsArray = events.split(',');
        eventsArray = eventsArray.filter(e => e !== event); // Remove the specific event

        if (eventsArray.length > 0) {
            localStorage.setItem(dateKey, eventsArray.join(',')); // Update localStorage with remaining events
        } else {
            localStorage.removeItem(dateKey); // Remove the key if no events are left
        }

        showEvents(dateKey); // Refresh the event display
        updateCalendar(); // Refresh the calendar to update the 'eventable' class if necessary
    }
}


// Add event to localStorage and mark date as eventable
addEventBtn.addEventListener('click', () => {
    if (selectedDate && eventInput.value.trim()) {
        const existingEvents = localStorage.getItem(selectedDate) || '';
        const newEvents = existingEvents ? `${existingEvents},${eventInput.value.trim()}` : eventInput.value.trim();
        localStorage.setItem(selectedDate, newEvents);

        // Refresh calendar to mark the date as 'eventable'
        updateCalendar();
        showEvents(selectedDate);

        eventInput.value = ''; // Clear input after adding event
    } else {
        alert('Please select a date and enter an event');
    }
});

prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

updateCalendar();
