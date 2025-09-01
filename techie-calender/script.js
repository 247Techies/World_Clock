document.addEventListener('DOMContentLoaded', function() {

    // DOM Elements
    const monthYearHeader = document.getElementById('month-year-header');
    const calendarBody = document.getElementById('calendar-body');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const printBtn = document.getElementById('print-btn');
    const resetMonthBtn = document.getElementById('reset-month-btn');
    const resetYearBtn = document.getElementById('reset-year-btn');

    // State
    let currentDate = new Date();
    let calendarData = {};

    // --- DATA FUNCTIONS ---

    const loadData = () => {
        const data = localStorage.getItem('calendarTrackerData');
        calendarData = data ? JSON.parse(data) : {};
    };

    const saveData = () => {
        localStorage.setItem('calendarTrackerData', JSON.stringify(calendarData));
    };

    // --- RENDER FUNCTION (Unchanged) ---

    const renderCalendar = () => {
        calendarBody.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthYearHeader.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const lastDateOfMonth = lastDayOfMonth.getDate();
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();

        for (let i = 0; i < firstDayOfWeek; i++) {
            calendarBody.innerHTML += `<div class="date-card other-month"></div>`;
        }

        for (let day = 1; day <= lastDateOfMonth; day++) {
            const dateForKey = new Date(Date.UTC(year, month, day));
            const dateString = dateForKey.toISOString().split('T')[0];
            const isToday = (year === todayYear && month === todayMonth && day === todayDate);
            const defaultDayData = { pending: 0, resolved: 0, calls: 0 };
            const storedDayData = calendarData[dateString] || {};
            const dayData = { ...defaultDayData, ...storedDayData };
            const totalSessions = dayData.pending + dayData.resolved;
            const card = document.createElement('div');
            card.className = `date-card ${isToday ? 'today' : ''}`;
            card.dataset.date = dateString;
            card.innerHTML = `
                <a class="copy-btn" title="Copy Day Summary"><i class="fas fa-copy"></i></a>
                <div class="copy-feedback">Copied!</div><div class="date-number">${day}</div>
                <div class="card-section"><label>Total Sessions: <strong class="total-sessions-display">${totalSessions}</strong></label><div class="ticket-inputs"><div class="flex-fill"><label>Pending</label><input type="number" min="0" class="form-control form-control-sm pending-input" value="${dayData.pending}"></div><div class="flex-fill"><label>Resolved</label><input type="number" min="0" class="form-control form-control-sm resolved-input" value="${dayData.resolved}"></div></div></div>
                <div class="card-section mt-2"><label>Calls</label><div class="call-counter"><button class="btn btn-sm btn-outline-danger minus-call-btn" title="Decrease Calls"><i class="fas fa-minus"></i></button><span class="call-count">${dayData.calls}</span><button class="btn btn-sm btn-outline-primary plus-call-btn" title="Increase Calls"><i class="fas fa-plus"></i></button></div></div>
            `;
            calendarBody.appendChild(card);
        }
    };

    // --- EVENT LISTENERS ---

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // --- UPDATED: Reset Button Listeners with SweetAlert2 ---
    
    resetMonthBtn.addEventListener('click', () => {
        const year = currentDate.getFullYear();
        const monthName = currentDate.toLocaleString('default', { month: 'long' });

        Swal.fire({
            title: 'Are you sure?',
            text: `This will erase all data for ${monthName} ${year}. This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, reset it!'
        }).then((result) => {
            if (result.isConfirmed) {
                // User confirmed. Proceed with deletion.
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const prefix = `${year}-${month}-`;

                for (const key in calendarData) {
                    if (key.startsWith(prefix)) {
                        delete calendarData[key];
                    }
                }

                saveData();
                renderCalendar();

                Swal.fire(
                    'Reset!',
                    `All data for ${monthName} ${year} has been cleared.`,
                    'success'
                );
            }
        });
    });

    resetYearBtn.addEventListener('click', () => {
        const year = currentDate.getFullYear();
        
        Swal.fire({
            title: 'Are you absolutely sure?',
            text: `This will erase all data for the ENTIRE year of ${year}. This is irreversible.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete the year!'
        }).then((result) => {
            if (result.isConfirmed) {
                // User confirmed. Proceed with deletion.
                const prefix = `${year}-`;

                for (const key in calendarData) {
                    if (key.startsWith(prefix)) {
                        delete calendarData[key];
                    }
                }
                
                saveData();
                renderCalendar();

                 Swal.fire(
                    'Reset!',
                    `All data for ${year} has been cleared.`,
                    'success'
                );
            }
        });
    });

    // --- END UPDATED ---

    // (The rest of the event listeners are unchanged)
    calendarBody.addEventListener('input', (e) => {
        if (e.target.classList.contains('pending-input') || e.target.classList.contains('resolved-input')) {
            const card = e.target.closest('.date-card');
            const dateString = card.dataset.date;
            const pendingInput = card.querySelector('.pending-input');
            const resolvedInput = card.querySelector('.resolved-input');
            const totalDisplay = card.querySelector('.total-sessions-display');
            const pendingCount = parseInt(pendingInput.value) || 0;
            const resolvedCount = parseInt(resolvedInput.value) || 0;
            totalDisplay.textContent = pendingCount + resolvedCount;
            pendingInput.value = pendingCount; 
            resolvedInput.value = resolvedCount;
            if (!calendarData[dateString]) calendarData[dateString] = { pending: 0, resolved: 0, calls: 0 };
            calendarData[dateString].pending = pendingCount;
            calendarData[dateString].resolved = resolvedCount;
            saveData();
        }
    });
    
    calendarBody.addEventListener('click', (e) => {
        const card = e.target.closest('.date-card');
        if (!card) return;
        const dateString = card.dataset.date;
        if (!calendarData[dateString]) { calendarData[dateString] = { pending: 0, resolved: 0, calls: 0 }; }
        if (e.target.closest('.plus-call-btn')) {
            const callCountEl = card.querySelector('.call-count');
            let newCount = calendarData[dateString].calls + 1;
            callCountEl.textContent = newCount;
            calendarData[dateString].calls = newCount;
            saveData();
        }
        if (e.target.closest('.minus-call-btn')) {
            const callCountEl = card.querySelector('.call-count');
            let currentCount = calendarData[dateString].calls;
            if (currentCount > 0) {
                 let newCount = currentCount - 1;
                 callCountEl.textContent = newCount;
                 calendarData[dateString].calls = newCount;
                 saveData();
            }
        }
        if (e.target.closest('.copy-btn')) {
            const dayData = { pending: 0, resolved: 0, calls: 0, ...(calendarData[dateString] || {}) };
            const totalSessions = dayData.pending + dayData.resolved;
            const [year, month, day] = dateString.split('-');
            const formattedDate = `${day}-${month}-${year}`;
            const copyText = `Date - ${formattedDate}\nTodays Summary\nTotal Sessions - ${totalSessions} | (Pending ${dayData.pending} / Resolved ${dayData.resolved})\nTotal Calls Handled - ${dayData.calls}`;
            navigator.clipboard.writeText(copyText).then(() => {
                const feedback = card.querySelector('.copy-feedback');
                feedback.classList.add('show');
                setTimeout(() => feedback.classList.remove('show'), 1500);
            }).catch(err => { console.error('Failed to copy text: ', err); });
        }
    });

    // --- INITIALIZATION ---
    loadData();
    renderCalendar();
});