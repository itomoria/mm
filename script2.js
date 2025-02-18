const scriptURL = 'https://script.google.com/macros/s/AKfycbxocEYaBGwUsUMSqxj_URtvl50y-Wlq1bJ-xS92HR18BmgVs9GP22Wdvq8Z8MfofxmI/exec';
const form = document.forms['contact-form'];
let dishes = [];

// Admin Login System
const ADMIN_CREDS = { username: "mmbadmin!", password: "250218mmbadmin!" };
const adminButton = document.getElementById('adminButton');
const loginModal = document.getElementById('loginModal');
const adminSection = document.getElementById('adminSection');
const closeBtn = document.querySelector('.close');

// Login Functions
adminButton.addEventListener('click', () => loginModal.style.display = "block");
closeBtn.addEventListener('click', () => loginModal.style.display = "none");

window.onclick = function(event) {
  if (event.target == loginModal) loginModal.style.display = "none";
}

function checkLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
    loginModal.style.display = "none";
    adminSection.style.display = "block";
    adminButton.style.display = "none";
  } else {
    alert("Invalid credentials!");
  }
}

// Load Dishes
fetch(scriptURL + '?action=getDishes')
  .then(response => response.json())
  .then(data => {
    dishes = data;
  })
  .catch(error => {
    console.error('Error loading data:', error);
    document.getElementById('resultsDiv').innerHTML = '<div class="not-found">Error loading data</div>';
  });

// Search Functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const resultsDiv = document.getElementById('resultsDiv');
  resultsDiv.innerHTML = '';

  if (searchTerm.length < 2) return;

  // Search by English OR ProductID
  const filteredDishes = dishes.filter(dish => 
    dish.English.toLowerCase().includes(searchTerm) ||
    dish.ProductID.toLowerCase().includes(searchTerm)
  );

  if (filteredDishes.length === 0) {
    resultsDiv.innerHTML = '<div class="not-found">No matches found</div>';
    return;
  }

  filteredDishes.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'allergy-card';
    card.innerHTML = `
      <h3>${dish.English}</h3>
      <div class="category">Category: ${dish.Category}</div>
      <!-- Optionally show Product ID here -->
      <div class="category">Product ID: ${dish.ProductID}</div>
      ${Object.entries(dish)
        .filter(([key]) => !['Category','English','ProductID'].includes(key))
        .map(([key, value]) => `
          <div class="allergy-item">
            <span>${key}:</span>
            <span class="${
              value === 'Yes' ? 'warning' : 
              value === 'N/A' ? 'amber' : 
              'safe'
            }">${value}</span>
          </div>
        `).join('')}
    `;
    resultsDiv.appendChild(card);
  });
});

// Form Submission
form.addEventListener('submit', e => {
  e.preventDefault();
  fetch(scriptURL, { method: 'POST', body: new FormData(form)})
    .then(response => alert("Thank you! Form is submitted"))
    .then(() => { window.location.reload(); })
    .catch(error => console.error('Error!', error.message));
});
