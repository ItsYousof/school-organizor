document.addEventListener('DOMContentLoaded', function() {
    const calendarDays = document.getElementById('calendarDays');
    const currentMonthElement = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const addEventBtn = document.getElementById('addEventBtn');
    const eventsList = document.getElementById('eventsList');

    let currentDate = new Date();
    let selectedDate = new Date();
    let events = {};

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        currentMonthElement.textContent = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        calendarDays.innerHTML = '';

        for (let i = 0; i < firstDay; i++) {
            calendarDays.innerHTML += '<div></div>';
        }

        const today = new Date();

        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${month + 1}-${day}`;
            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            dayElement.classList.add('calendar-day');
            
            if (events[dateString]) {
                dayElement.classList.add('has-event');
                dayElement.title = events[dateString].map(e => e.title).join(', ');
            }

            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayElement.classList.add('current-day');
            }

            dayElement.addEventListener('click', () => selectDate(new Date(year, month, day)));
            calendarDays.appendChild(dayElement);
        }
    }

    function selectDate(date) {
        selectedDate = date;
        renderEventsList();
    }

    function addEvent() {
        const eventTitle = prompt('Enter event title:');
        if (eventTitle) {
            const dateString = selectedDate.toISOString().split('T')[0];
            if (!events[dateString]) {
                events[dateString] = [];
            }
            events[dateString].push({ title: eventTitle });
            renderCalendar();
            renderEventsList();
        }
    }

    function renderEventsList() {
        eventsList.innerHTML = '';
        const dateString = selectedDate.toISOString().split('T')[0];
        const dateEvents = events[dateString] || [];
        
        const dateHeader = document.createElement('h3');
        dateHeader.textContent = selectedDate.toLocaleDateString();
        eventsList.appendChild(dateHeader);

        if (dateEvents.length === 0) {
            const noEvents = document.createElement('p');
            noEvents.textContent = 'No events for this day.';
            eventsList.appendChild(noEvents);
        } else {
            dateEvents.forEach((event, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="event-title"><i class="fas fa-calendar-day"></i> ${event.title}</span>
                    <div class="event-actions">
                        <button class="rename-event" data-index="${index}"><i class="fas fa-edit"></i></button>
                        <button class="delete-event" data-index="${index}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                eventsList.appendChild(li);
            });
        }

        // Add event listeners for rename and delete buttons
        document.querySelectorAll('.rename-event').forEach(button => {
            button.addEventListener('click', renameEvent);
        });
        document.querySelectorAll('.delete-event').forEach(button => {
            button.addEventListener('click', deleteEvent);
        });
    }

    function renameEvent(e) {
        const index = e.currentTarget.dataset.index;
        const dateString = selectedDate.toISOString().split('T')[0];
        const newTitle = prompt('Enter new event title:', events[dateString][index].title);
        if (newTitle) {
            events[dateString][index].title = newTitle;
            renderCalendar();
            renderEventsList();
        }
    }

    function deleteEvent(e) {
        const index = e.currentTarget.dataset.index;
        const dateString = selectedDate.toISOString().split('T')[0];
        if (confirm('Are you sure you want to delete this event?')) {
            events[dateString].splice(index, 1);
            if (events[dateString].length === 0) {
                delete events[dateString];
            }
            renderCalendar();
            renderEventsList();
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    addEventBtn.addEventListener('click', addEvent);

    renderCalendar();
    renderEventsList();
});

function saveEvent() {
    // Your existing code to save the event

    // After saving the event, update the home dashboard
    updateHomeDashboard();
}
