// Global variables for charts
let lineChart = null;
let pieChart = null;

// Login functionality
function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboardScreen').classList.add('dashboard-hidden');
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboardScreen').classList.remove('dashboard-hidden');
}

// Check if user is logged in
function checkLogin() {
  const isLoggedIn = localStorage.getItem('sementeTrackLoggedIn');
  if (isLoggedIn === 'true') {
    showDashboard();
  } else {
    showLogin();
  }
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const usuario = document.getElementById('usuario').value;
  const senha = document.getElementById('senha').value;
  const errorMessage = document.getElementById('errorMessage');
  const buttonText = document.getElementById('buttonText');
  const loading = document.getElementById('loading');
  const loginButton = document.getElementById('loginButton');
  
  // Simular validação (substitua por validação real)
  if (usuario === 'admin' && senha === '123456') {
    // Mostrar loading
    buttonText.style.display = 'none';
    loading.style.display = 'flex';
    loginButton.disabled = true;
    
    // Simular delay de login
    setTimeout(() => {
      // Salvar login no localStorage
      localStorage.setItem('sementeTrackLoggedIn', 'true');
      localStorage.setItem('sementeTrackUser', usuario);
      
      // Mostrar dashboard
      showDashboard();
      
      // Resetar formulário
      buttonText.style.display = 'inline';
      loading.style.display = 'none';
      loginButton.disabled = false;
      document.getElementById('loginForm').reset();
    }, 1500);
  } else {
    // Mostrar erro
    errorMessage.style.display = 'block';
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 3000);
  }
});

// Limpar erro quando usuário começar a digitar
document.getElementById('usuario').addEventListener('input', function() {
  document.getElementById('errorMessage').style.display = 'none';
});

document.getElementById('senha').addEventListener('input', function() {
  document.getElementById('errorMessage').style.display = 'none';
});

// Logout functionality
function logout() {
  localStorage.removeItem('sementeTrackLoggedIn');
  localStorage.removeItem('sementeTrackUser');
  showLogin();
}

// Tab Navigation Function
function showTab(tabName) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tab => tab.classList.remove('active'));
  
  // Remove active class from all tab buttons
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => btn.classList.remove('active'));
  
  // Remove active class from all nav items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  
  // Show selected tab content
  document.getElementById(tabName + '-tab').classList.add('active');
  
  // Add active class to clicked tab button
  event.target.classList.add('active');
  
  // Add active class to corresponding nav item
  const navItem = document.querySelector(`[onclick="showTab('${tabName}')"]`);
  if (navItem) {
    navItem.classList.add('active');
  }
  
  // Update page title
  const pageTitle = document.getElementById('page-title');
  if (tabName === 'dashboard') {
    pageTitle.textContent = 'Dashboard';
    // Initialize charts when switching to dashboard
    setTimeout(() => {
      initializeCharts();
    }, 200);
  } else if (tabName === 'relatorios') {
    pageTitle.textContent = 'Relatórios';
  } else if (tabName === 'problemas') {
    pageTitle.textContent = 'Problemas';
  }
}

// Chart initialization
function initializeCharts() {
  const ctxLine = document.getElementById('lineChart');
  const ctxPie = document.getElementById('pieChart');
  
  if (ctxLine && ctxPie) {
    // Destroy existing charts if they exist
    if (lineChart) {
      lineChart.destroy();
      lineChart = null;
    }
    if (pieChart) {
      pieChart.destroy();
      pieChart = null;
    }
    
    // Create new line chart
    lineChart = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['Jan 2023', 'Fev 2023', 'Mar 2023', 'Abr 2023', 'Mai 2023', 'Jun 2023'],
        datasets: [
          { 
            label: 'Petrolina', 
            data: [180, 320, 140, 260, 300, 280], 
            tension: 0.4, 
            fill: false, 
            borderColor: '#95a97a', 
            backgroundColor: '#95a97a',
            borderWidth: 2
          },
          { 
            label: 'Feira Nova', 
            data: [220, 360, 120, 180, 260, 240], 
            tension: 0.4, 
            fill: false, 
            borderColor: '#c2c8bf', 
            backgroundColor: '#c2c8bf',
            borderWidth: 2
          },
          { 
            label: 'Araripina', 
            data: [300, 340, 310, 370, 280, 330], 
            tension: 0.4, 
            fill: false, 
            borderColor: '#ff8c7a', 
            backgroundColor: '#ff8c7a',
            borderWidth: 2
          },
          { 
            label: 'Serra Talhada', 
            data: [500, 540, 520, 560, 590, 560], 
            tension: 0.4, 
            fill: false, 
            borderColor: '#6b8f4e', 
            backgroundColor: '#6b8f4e',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        scales: { 
          y: { 
            grid: { color: 'rgba(0,0,0,.05)' },
            beginAtZero: true
          },
          x: {
            grid: { color: 'rgba(0,0,0,.05)' }
          }
        },
        plugins: { 
          legend: { 
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              boxWidth: 12
            }
          }
        }
      }
    });

    // Create new pie chart
    pieChart = new Chart(ctxPie, {
      type: 'pie',
      data: {
        labels: ['Milho', 'Feijão', 'Sorgo'],
        datasets: [{ 
          data: [680, 220, 90], 
          backgroundColor: ['#8aa06d', '#b6c59a', '#d7dfc7'], 
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: { 
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1,
        plugins: { 
          legend: { 
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              boxWidth: 12
            }
          }
        }
      }
    });
  }
}

// Initialize charts on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check login status first
  checkLogin();
  
  // Wait a bit for the DOM to be fully ready
  setTimeout(() => {
    initializeCharts();
  }, 100);
});

