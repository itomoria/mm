const scriptURL = 'https://script.google.com/macros/s/AKfycbzb1ZH1MV9VV7pwifJc9iAO2NQQ_KPCbv_j78gBp1OJQhtbw3756uRENQF-WmjFR7TC/exec';
const form = document.forms['contact-form'];
let dishes = [];

// ======================================
// Admin Login System
// ======================================

// 1) We no longer store credentials here. We'll fetch from the sheet:
let adminCreds = { username: "", password: "" };

// On page load, fetch the current admin creds from the sheet
fetch(scriptURL + '?action=getAdminCreds')
  .then(response => response.json())
  .then(data => {
    adminCreds = data; // e.g. { username: "MingMoon2025", password: "MMTest20" }
  })
  .catch(err => console.error('Error fetching admin creds', err));

// Elements
const adminButton = document.getElementById('adminButton');
const loginModal = document.getElementById('loginModal');
const adminSection = document.getElementById('adminSection');
const closeBtn = document.querySelector('.close');

// Show login modal
adminButton.addEventListener('click', () => loginModal.style.display = "block");
// Close login modal
closeBtn.addEventListener('click', () => loginModal.style.display = "none");
// Close modal if user clicks outside it
window.onclick = function(event) {
  if (event.target == loginModal) loginModal.style.display = "none";
};

// Check login using the fetched adminCreds
function checkLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Compare with the fetched adminCreds
  if (username === adminCreds.username && password === adminCreds.password) {
    // success
    loginModal.style.display = "none";
    adminSection.style.display = "block";
    adminButton.style.display = "none";
  } else {
    alert("Invalid credentials!");
  }
}

// ======================================
// Change Credentials Logic
// ======================================

const changeCredsBtn = document.getElementById('changeCredsBtn');
const changeCredsModal = document.getElementById('changeCredsModal');
const closeChangeCreds = document.getElementById('closeChangeCreds');

// Show "Change Credentials" modal
changeCredsBtn.addEventListener('click', () => {
  changeCredsModal.style.display = 'block';
});

// Close that modal
closeChangeCreds.addEventListener('click', () => {
  changeCredsModal.style.display = 'none';
});

// Update the admin creds on the server
function updateAdminCreds() {
  const oldPassword = document.getElementById('oldPassword').value;
  const newUsername = document.getElementById('newUsername').value;
  const newPassword = document.getElementById('newPassword').value;
  
  fetch(scriptURL, {
    method: 'POST',
    body: new URLSearchParams({
      action: 'updateAdminCreds',
      oldPassword,
      newUsername,
      newPassword
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.result === 'success') {
      alert("Credentials updated successfully!");
      // Re-fetch the new credentials
      return fetch(scriptURL + '?action=getAdminCreds')
        .then(r => r.json())
        .then(newData => {
          adminCreds = newData;
          changeCredsModal.style.display = 'none';
        });
    } else {
      alert(data.message || "Error updating credentials");
    }
  })
  .catch(err => console.error(err));
}

// ======================================
// Load Dishes (Existing Code)
// ======================================
fetch(scriptURL + '?action=getDishes')
  .then(response => response.json())
  .then(data => {
    dishes = data;
  })
  .catch(error => {
    console.error('Error loading data:', error);
    document.getElementById('resultsDiv').innerHTML = '<div class="not-found">Error loading data</div>';
  });

// ======================================
// Search Functionality (Existing Code)
// ======================================
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

// ======================================
// Form Submission (Existing Code)
// ======================================
form.addEventListener('submit', e => {
  e.preventDefault();
  fetch(scriptURL, { method: 'POST', body: new FormData(form)})
    .then(response => alert("Thank you! Form is submitted"))
    .then(() => { window.location.reload(); })
    .catch(error => console.error('Error!', error.message));
});
