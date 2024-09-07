document.addEventListener('DOMContentLoaded', () => {
  const calendarGrid = document.getElementById('calendarGrid');
  const hourlyRateInput = document.getElementById('hourlyRate');
  const saveButton = document.getElementById('saveButton');
  const earningsOverview = document.getElementById('earningsOverview');
  
  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Days in each month
  const weekDays = ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Starting week from Monday
  
  let selectedMonth = 0;  // Default to January
  let workHours = [];  // Array to store work hours for each day
  let monthlyEarnings = Array(12).fill(0); // Array to store earnings for each month
  
  // Function to generate the calendar based on the selected month
  function generateCalendar(month) {
    calendarGrid.innerHTML = '';  // Clear previous calendar
    const daysInMonth = daysInMonths[month];
    workHours = Array(daysInMonth).fill(0);  // Reset work hours array for the new month

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
      dayCell.addEventListener('change', (event) => {
        const dayIndex = event.target.dataset.day - 1;
        workHours[dayIndex] = parseFloat(event.target.value) || 0;
        calculateEarnings();
      });
      dayContainer.appendChild(dayCell);

      calendarGrid.appendChild(dayContainer);
    }
  }

  // Function to calculate total earnings for the month
  function calculateEarnings() {
    const hourlyRate = parseFloat(hourlyRateInput.value) || 0;
    const totalHours = workHours.reduce((total, hours) => total + hours, 0);
    const totalEarnings = totalHours * hourlyRate;

    // Update the earnings for the selected month
    monthlyEarnings[selectedMonth] = totalEarnings;
    updateEarningsOverview();
  }

  // Function to update the earnings overview for all months
  function updateEarningsOverview() {
    earningsOverview.innerHTML = '';
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    for (let i = 0; i < 12; i++) {
      const earningsText = document.createElement('div');
      earningsText.classList.add('text-lg', 'flex', 'justify-between');
      earningsText.innerHTML = `<span>${monthNames[i]}:</span> <span>$${monthlyEarnings[i].toFixed(2)}</span>`;
      earningsOverview.appendChild(earningsText);
    }
  }

  // Event listener to update calendar when a new month is selected
  monthSelect.addEventListener('change', (event) => {
    selectedMonth = parseInt(event.target.value);
    generateCalendar(selectedMonth);
  });

  // Save work hours (could store in local storage or backend in real use)
  saveButton.addEventListener('click', () => {
    alert('Work hours saved successfully!');
  });

  // Initial calendar generation for the default month (January)
  generateCalendar(selectedMonth);
  updateEarningsOverview(); // Initialize earnings overview
});
