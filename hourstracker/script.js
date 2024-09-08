document.addEventListener('DOMContentLoaded', () => {
  const calendarGrid = document.getElementById('calendarGrid');
  const hourlyRateInput = document.getElementById('hourlyRate');
  const earningsOverview = document.getElementById('earningsOverview');
  const monthSelect = document.getElementById('monthSelect');
  const deleteButton = document.getElementById('deleteButton');


  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Days in each month
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Starting week from Sunday

  let selectedMonth = 0;  // Default to January
  let workHours = {};  // Object to store work hours for each month
  let monthlyEarnings = {}; // Object to store total earnings for each month

  // Function to save data to localStorage
  function saveToLocalStorage() {
    const data = {
      hourlyRate: parseFloat(hourlyRateInput.value) || 0,
      workHours,
      monthlyEarnings
    };
    localStorage.setItem('workHoursData', JSON.stringify(data));
  }

  // Function to load data from localStorage
  function loadFromLocalStorage() {
    const savedData = localStorage.getItem('workHoursData');
    if (savedData) {
      const data = JSON.parse(savedData);
      hourlyRateInput.value = data.hourlyRate || 35; // Load saved hourly rate or set default to 30
      workHours = data.workHours || {};
      monthlyEarnings = data.monthlyEarnings || Array.from({ length: 12 }, () => ({ totalMoney: 0, unpaidMoney: 0 }));

      // Initialize each month properly
      for (let month = 0; month < 12; month++) {
        if (!workHours[month]) {
          workHours[month] = Array.from({ length: daysInMonths[month] }, () => ({ hours: 0, paid: false }));
        }
        if (!monthlyEarnings[month]) {
          monthlyEarnings[month] = { totalMoney: 0, unpaidMoney: 0 };
        }
      }

      updateEarningsOverview();
      generateCalendar(selectedMonth);
    } else {
      // If no saved data, set default hourly rate
      hourlyRateInput.value = 35;
      for (let month = 0; month < 12; month++) {
        workHours[month] = Array.from({ length: daysInMonths[month] }, () => ({ hours: 0, paid: false }));
        monthlyEarnings[month] = { totalMoney: 0, unpaidMoney: 0 };
      }
    }
  }

  // Function to generate the calendar based on the selected month
  function generateCalendar(month) {
    calendarGrid.innerHTML = '';  // Clear previous calendar
    const daysInMonth = daysInMonths[month];

    // If no work hours data exists for the selected month, initialize it
    if (!workHours[month]) {
      workHours[month] = Array.from({ length: daysInMonth }, () => ({ hours: 0, paid: false }));
    }

    // Get the first day of the month to align the weekdays (adjusted to make Monday the first day)
    const firstDay = (new Date(2024, month, 1).getDay() + 6) % 7; // Shift Sunday (0) to the last position

    // Add empty spaces if the month doesn't start on Monday
    for (let i = 0; i < firstDay; i++) {
      const blankCell = document.createElement('div');
      blankCell.classList.add('p-2', 'border', 'border-gray-300', 'rounded-lg', 'shadow-sm', 'bg-gray-200');
      calendarGrid.appendChild(blankCell);
    }

    // Generate input fields for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(2024, month, day);
      const weekDay = weekDays[date.getDay()];

      // Create a container for the day cell
      const dayContainer = document.createElement('div');
      dayContainer.classList.add('flex', 'flex-col', 'items-center', 'p-2', 'border', 'border-gray-300', 'rounded-lg', 'shadow-sm');


      // Create a label to show day of the week and date
      const dayLabel = document.createElement('span');
      dayLabel.classList.add('text-xs', 'text-gray-500');
      dayLabel.innerText = `${weekDay}, ${day}`;
      dayContainer.appendChild(dayLabel);

      // Create input field for entering work hours
      const dayCell = document.createElement('input');
      dayCell.type = 'number';
      dayCell.classList.add('w-full', 'border-gray-300', 'rounded-lg', 'shadow-sm', 'text-center', 'mt-1');
      dayCell.placeholder = '0';
      dayCell.dataset.day = day;
      dayCell.value = workHours[month][day - 1].hours !== 0 ? workHours[month][day - 1].hours : '';

      // highlight unpaid cells in light red if its not zero
      dayContainer.style.backgroundColor = workHours[month][day - 1].paid || workHours[month][day-1].hours === 0 ? '' : '#ffe6e6'; // Highlight unpaid in light red

      dayCell.addEventListener('change', (event) => {
        const dayIndex = event.target.dataset.day - 1;
        workHours[month][dayIndex].hours = parseFloat(event.target.value) || 0;
        if (workHours[month][dayIndex].hours === 0) {
          workHours[month][dayIndex].paid = false; // Reset paid status if hours are zero
          event.target.nextSibling.checked = false;
          event.target.nextSibling.disabled = true;
        }
        dayContainer.style.backgroundColor = workHours[month][dayIndex].paid || workHours[month][dayIndex].hours === 0 ? '' : '#ffe6e6'; // Highlight unpaid in light red
        calculateEarnings();
        saveToLocalStorage(); // Save changes to localStorage whenever work hours change
      });
      dayContainer.appendChild(dayCell);

      // Create checkbox to mark as paid
      const paidCheckbox = document.createElement('input');
      paidCheckbox.type = 'checkbox';
      paidCheckbox.disabled = workHours[month][day - 1].hours === 0;
      paidCheckbox.classList.add('mt-1');
      paidCheckbox.checked = workHours[month][day - 1].paid;
      paidCheckbox.addEventListener('change', (event) => {
        const dayIndex = event.target.previousSibling.dataset.day - 1;
        workHours[month][dayIndex].paid = event.target.checked;
        dayContainer.style.backgroundColor = event.target.checked || workHours[month][dayIndex].hours === 0 ? '' : '#ffe6e6'; // Highlight unpaid in light red
        calculateEarnings();
        saveToLocalStorage(); // Save changes to localStorage whenever work hours change
      });
      dayContainer.appendChild(paidCheckbox);

      calendarGrid.appendChild(dayContainer);
    }
  }

  // Function to calculate total earnings for the month
  function calculateEarnings() {
    const hourlyRate = parseFloat(hourlyRateInput.value) || 0;
    let totalHours = 0;
    let unpaidHours = 0;

    workHours[selectedMonth].forEach((day) => {
      totalHours += day.hours;
      if (!day.paid) {
        unpaidHours += day.hours;
      }
    });

    if (!monthlyEarnings[selectedMonth]) {
      monthlyEarnings[selectedMonth] = { totalMoney: 0, unpaidMoney: 0 };
    }

    const totalEarnings = totalHours * hourlyRate;
    monthlyEarnings[selectedMonth].totalMoney = totalEarnings;
    monthlyEarnings[selectedMonth].unpaidMoney = unpaidHours * hourlyRate;

    updateEarningsOverview();
    saveToLocalStorage(); // Save changes to localStorage whenever earnings change
  }

  // Function to update the earnings overview for all months
  function updateEarningsOverview() {
    earningsOverview.innerHTML = '';
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    for (let i = 0; i < 12; i++) {
      const earningsText = document.createElement('div');
      earningsText.classList.add('text-lg', 'flex', 'justify-between');
      earningsText.innerHTML = `<span>${monthNames[i]}:</span> <span>$${monthlyEarnings[i].totalMoney.toFixed(2)}</span> <span>Unpaid: $${monthlyEarnings[i].unpaidMoney.toFixed(2)}</span>`;
      earningsOverview.appendChild(earningsText);
    }
  }

  // Event listener to update calendar when a new month is selected
  monthSelect.addEventListener('change', (event) => {
    selectedMonth = parseInt(event.target.value);
    generateCalendar(selectedMonth);
    saveToLocalStorage(); // Save changes to localStorage when month is changed
  });

  // Event listener to update hourly rate and save to localStorage
  hourlyRateInput.addEventListener('change', () => {
    calculateEarnings();
    saveToLocalStorage(); // Save changes to localStorage when hourly rate changes
  });

  // Event listener to delete all data from localStorage
  deleteButton.addEventListener('click', () => {
    localStorage.removeItem('workHoursData'); // Remove work hours data from local storage
    alert('All work hours data has been deleted.');
    location.reload(); // Reload the page to reset the form
  });

  // Load data from localStorage on page load
  loadFromLocalStorage();
});
