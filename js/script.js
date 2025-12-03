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

// Login form handler com MySQL
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const usuario = document.getElementById('usuario').value;
  const senha = document.getElementById('senha').value;
  const errorMessage = document.getElementById('errorMessage');
  const buttonText = document.getElementById('buttonText');
  const loading = document.getElementById('loading');
  const loginButton = document.getElementById('loginButton');
  
      // Validar campos
      if (!usuario || !senha) {
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, preencha todos os campos.';
    errorMessage.style.display = 'block';
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 3000);
        }
        return;
      }
      
    // Mostrar loading
      if (buttonText) buttonText.style.display = 'none';
      if (loading) loading.style.display = 'flex';
      if (loginButton) loginButton.disabled = true;
      
      try {
        // Aguardar um pouco para garantir que bd.js foi carregado
        let tentativas = 0;
        while (!window.bd && tentativas < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          tentativas++;
        }
        
        // Tentar login com MySQL (via API) ou IndexedDB
        if (window.bd && window.bd.fazerLoginMySQL) {
          const resultado = await window.bd.fazerLoginMySQL(usuario, senha);
          
          if (resultado.sucesso) {
            // Login bem-sucedido
            showDashboard();
            loginForm.reset();
            // Atualizar dashboard após login
            setTimeout(() => {
              atualizarDashboard();
            }, 500);
            return; // Sair antes do finally resetar o loading
          } else {
            // Erro no login
            if (errorMessage) {
              errorMessage.textContent = resultado.mensagem || 'Usuário ou senha incorretos. Tente novamente.';
              errorMessage.style.display = 'block';
    setTimeout(() => {
                if (errorMessage) errorMessage.style.display = 'none';
              }, 3000);
            }
          }
        } else {
          // Fallback: validação local (para desenvolvimento)
          if (usuario === 'admin' && senha === '123456') {
            localStorage.setItem('sementeTrackLoggedIn', 'true');
            localStorage.setItem('sementeTrackUser', usuario);
            showDashboard();
            loginForm.reset();
            // Atualizar dashboard após login
            setTimeout(() => {
              atualizarDashboard();
            }, 500);
            return; // Sair antes do finally resetar o loading
          } else {
            if (errorMessage) {
              errorMessage.textContent = 'Usuário ou senha incorretos. Tente novamente.';
              errorMessage.style.display = 'block';
              setTimeout(() => {
                if (errorMessage) errorMessage.style.display = 'none';
              }, 3000);
            }
          }
        }
      } catch (error) {
        console.error('Erro no login:', error);
        if (errorMessage) {
          errorMessage.textContent = 'Erro ao conectar com o servidor. Tente novamente.';
          errorMessage.style.display = 'block';
          setTimeout(() => {
            if (errorMessage) errorMessage.style.display = 'none';
          }, 3000);
        }
      } finally {
        // Sempre resetar loading, mesmo em caso de sucesso
        setTimeout(() => {
          if (buttonText) buttonText.style.display = 'inline';
          if (loading) loading.style.display = 'none';
          if (loginButton) loginButton.disabled = false;
        }, 100);
      }
    });
  }

  // Cadastro form handler
  const cadastroForm = document.getElementById('cadastroForm');
  
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const nome = document.getElementById('cadastroNome').value.trim();
      const usuario = document.getElementById('cadastroUsuario').value.trim();
      const email = document.getElementById('cadastroEmail').value.trim();
      const senha = document.getElementById('cadastroSenha').value;
      const senhaConfirmar = document.getElementById('cadastroSenhaConfirmar').value;
      
      const errorMessage = document.getElementById('cadastroErrorMessage');
      const successMessage = document.getElementById('cadastroSuccessMessage');
      const buttonText = document.getElementById('cadastroButtonText');
      const loading = document.getElementById('loadingCadastroUsuario');
      const cadastroButton = document.getElementById('cadastroButton');
      
      // Esconder mensagens anteriores
      if (errorMessage) errorMessage.style.display = 'none';
      if (successMessage) successMessage.style.display = 'none';
      
      // Validações
      if (!nome || !usuario || !senha) {
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, preencha todos os campos obrigatórios.';
          errorMessage.style.display = 'block';
        }
        return;
      }
      
      if (senha.length < 6) {
        if (errorMessage) {
          errorMessage.textContent = 'A senha deve ter pelo menos 6 caracteres.';
          errorMessage.style.display = 'block';
        }
        return;
      }
      
      if (senha !== senhaConfirmar) {
        if (errorMessage) {
          errorMessage.textContent = 'As senhas não coincidem.';
          errorMessage.style.display = 'block';
        }
        return;
      }
      
      // Mostrar loading
      if (buttonText) buttonText.style.display = 'none';
      if (loading) loading.style.display = 'flex';
      if (cadastroButton) cadastroButton.disabled = true;
      
      try {
        // Tentar cadastrar com MySQL (via API)
        if (window.bd && window.bd.registrarUsuarioMySQL) {
          const resultado = await window.bd.registrarUsuarioMySQL({
            nome: nome,
            usuario: usuario,
            senha: senha,
            email: email || null
          });
          
          if (resultado.sucesso) {
            // Cadastro bem-sucedido
            if (successMessage) {
              successMessage.textContent = resultado.mensagem || 'Usuário cadastrado com sucesso! Você pode fazer login agora.';
              successMessage.style.display = 'block';
            }
            
            // Limpar formulário
            cadastroForm.reset();
            
            // Após 2 segundos, mudar para aba de login
            setTimeout(() => {
              if (successMessage) successMessage.style.display = 'none';
              // Simular clique no botão de login
              const loginTabBtn = document.querySelector('.login-tab-btn');
              if (loginTabBtn) {
                showLoginTab('login');
                loginTabBtn.classList.add('active');
              }
            }, 2000);
  } else {
            // Erro no cadastro
            if (errorMessage) {
              errorMessage.textContent = resultado.mensagem || 'Erro ao cadastrar usuário. Tente novamente.';
    errorMessage.style.display = 'block';
            }
          }
        } else {
          // Tentar salvar no IndexedDB
          try {
            if (window.bd && window.bd.salvarUsuarioIndexedDB) {
              const id = await window.bd.salvarUsuarioIndexedDB({
                nome: nome,
                usuario: usuario,
                senha: senha, // Em produção, fazer hash antes
                email: email || null
              });
              
              if (successMessage) {
                successMessage.textContent = 'Usuário cadastrado com sucesso! Você pode fazer login agora.';
                successMessage.style.display = 'block';
              }
              
              cadastroForm.reset();
              
    setTimeout(() => {
                if (successMessage) successMessage.style.display = 'none';
                const loginTabBtn = document.querySelector('.login-tab-btn');
                if (loginTabBtn) {
                  showLoginTab('login');
                  loginTabBtn.classList.add('active');
                }
              }, 2000);
            } else {
              throw new Error('Banco de dados não inicializado');
            }
          } catch (dbError) {
            console.error('Erro ao salvar no IndexedDB:', dbError);
            if (errorMessage) {
              if (dbError.message.includes('já existe')) {
                errorMessage.textContent = 'Este usuário já existe. Escolha outro nome de usuário.';
              } else {
                errorMessage.textContent = 'Erro ao salvar usuário. Tente novamente.';
              }
              errorMessage.style.display = 'block';
            }
          }
        }
      } catch (error) {
        console.error('Erro no cadastro:', error);
        if (errorMessage) {
          errorMessage.textContent = 'Erro ao conectar com o servidor. Tente novamente.';
          errorMessage.style.display = 'block';
        }
      } finally {
        // Resetar loading
        if (buttonText) buttonText.style.display = 'inline';
        if (loading) loading.style.display = 'none';
        if (cadastroButton) cadastroButton.disabled = false;
      }
    });
    
    // Limpar mensagens quando usuário começar a digitar
    const cadastroInputs = cadastroForm.querySelectorAll('input');
    cadastroInputs.forEach(input => {
      input.addEventListener('input', function() {
        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';
      });
    });
  }
});

// Função para alternar entre abas de login e cadastro
function showLoginTab(tabName) {
  // Esconder todas as abas
  const tabContents = document.querySelectorAll('.login-tab-content');
  tabContents.forEach(tab => tab.classList.remove('active'));
  
  // Remover active de todos os botões
  const tabBtns = document.querySelectorAll('.login-tab-btn');
  tabBtns.forEach(btn => btn.classList.remove('active'));
  
  // Mostrar aba selecionada
  const targetTab = document.getElementById(tabName + '-tab-content');
  if (targetTab) {
    targetTab.classList.add('active');
  }
  
  // Adicionar active ao botão correspondente
  tabBtns.forEach(btn => {
    const btnText = btn.textContent.trim().toLowerCase();
    if ((tabName === 'login' && btnText === 'login') ||
        (tabName === 'cadastro' && btnText === 'cadastrar')) {
      btn.classList.add('active');
    }
  });
  
  // Limpar mensagens
  const errorMsg = document.getElementById('errorMessage');
  const cadastroErrorMsg = document.getElementById('cadastroErrorMessage');
  const cadastroSuccessMsg = document.getElementById('cadastroSuccessMessage');
  
  if (errorMsg) errorMsg.style.display = 'none';
  if (cadastroErrorMsg) cadastroErrorMsg.style.display = 'none';
  if (cadastroSuccessMsg) cadastroSuccessMsg.style.display = 'none';
}

// Limpar erro quando usuário começar a digitar
document.addEventListener('DOMContentLoaded', function() {
  const usuarioInput = document.getElementById('usuario');
  const senhaInput = document.getElementById('senha');
  
  if (usuarioInput) {
    usuarioInput.addEventListener('input', function() {
      const errorMessage = document.getElementById('errorMessage');
      if (errorMessage) errorMessage.style.display = 'none';
    });
  }
  
  if (senhaInput) {
    senhaInput.addEventListener('input', function() {
      const errorMessage = document.getElementById('errorMessage');
      if (errorMessage) errorMessage.style.display = 'none';
    });
  }
});

// Logout functionality com MySQL
function logout() {
  // Fazer logout no MySQL se disponível
  if (window.bd && window.bd.fazerLogoutMySQL) {
    window.bd.fazerLogoutMySQL();
  } else {
    // Fallback: limpar localStorage
  localStorage.removeItem('sementeTrackLoggedIn');
  localStorage.removeItem('sementeTrackUser');
    localStorage.removeItem('sementeTrackToken');
    localStorage.removeItem('sementeTrackUserId');
  }
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
      atualizarDashboard(); // Atualizar dados ao abrir dashboard
    }, 200);
  } else if (tabName === 'relatorios') {
    pageTitle.textContent = 'Relatórios';
  } else if (tabName === 'problemas') {
    pageTitle.textContent = 'Problemas';
  } else if (tabName === 'cadastro-sementes') {
    pageTitle.textContent = 'Cadastro de Sementes';
  } else if (tabName === 'notificacoes') {
    pageTitle.textContent = 'Notificações';
    // Carregar notificações quando abrir a aba
    setTimeout(() => {
      carregarNotificacoes();
    }, 200);
  } else if (tabName === 'configuracoes') {
    pageTitle.textContent = 'Configurações';
    // Carregar dados do perfil
    setTimeout(() => {
      carregarDadosPerfil();
    }, 200);
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

// Banco de dados está em bd.js - usar window.bd para acessar as funções

// ==================== FUNCIONALIDADE DE CADASTRO ====================

// Navegação entre abas do cadastro
function showCadastroTab(tabName) {
  // Esconder todas as abas
  const tabContents = document.querySelectorAll('.cadastro-tab-content');
  tabContents.forEach(tab => tab.classList.remove('active'));
  
  // Remover active de todos os botões
  const tabBtns = document.querySelectorAll('.cadastro-tab-btn');
  tabBtns.forEach(btn => btn.classList.remove('active'));
  
  // Mostrar aba selecionada
  document.getElementById(tabName).classList.add('active');
  
  // Adicionar active ao botão clicado
  event.target.classList.add('active');
}

// Mostrar mensagem de sucesso/erro
function mostrarMensagem(mensagem, tipo = 'success') {
  const messageDiv = document.getElementById('cadastroMessage');
  messageDiv.textContent = mensagem;
  messageDiv.className = `cadastro-message ${tipo}`;
  messageDiv.style.display = 'block';
  
  // Esconder mensagem após 5 segundos
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

// Handler do formulário de cadastro
document.addEventListener('DOMContentLoaded', function() {
  const formCadastro = document.getElementById('formCadastroSemente');
  
  if (formCadastro) {
    formCadastro.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const btnCadastrar = document.getElementById('btnCadastrar');
      const btnCadastrarText = document.getElementById('btnCadastrarText');
      const loadingCadastro = document.getElementById('loadingCadastro');
      
      // Coletar dados do formulário
      const dadosSemente = {
        nomeSemente: document.getElementById('nomeSemente').value.trim(),
        categoriaAgricola: document.getElementById('categoriaAgricola').value.trim(),
        origemLote: document.getElementById('origemLote').value.trim(),
        quantidadeInicial: parseFloat(document.getElementById('quantidadeInicial').value),
        responsavelLote: document.getElementById('responsavelLote').value.trim(),
        fornecedor: document.getElementById('fornecedor').value.trim(),
        dataAquisicao: document.getElementById('dataAquisicao').value,
        validadeLote: document.getElementById('validadeLote').value,
        armazenamento: document.getElementById('armazenamento').value.trim(),
        observacoes: document.getElementById('observacoes').value.trim() || null
      };
      
      // Validação básica
      if (!dadosSemente.nomeSemente || !dadosSemente.categoriaAgricola || 
          !dadosSemente.origemLote || !dadosSemente.quantidadeInicial ||
          !dadosSemente.responsavelLote || !dadosSemente.fornecedor ||
          !dadosSemente.dataAquisicao || !dadosSemente.validadeLote ||
          !dadosSemente.armazenamento) {
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
      }
      
      if (dadosSemente.quantidadeInicial <= 0) {
        mostrarMensagem('A quantidade inicial deve ser maior que zero.', 'error');
        return;
      }
      
      // Validar datas
      const dataAquisicao = new Date(dadosSemente.dataAquisicao);
      const validadeLote = new Date(dadosSemente.validadeLote);
      
      if (validadeLote <= dataAquisicao) {
        mostrarMensagem('A validade do lote deve ser posterior à data de aquisição.', 'error');
        return;
      }
      
      // Mostrar loading
      btnCadastrarText.style.display = 'none';
      loadingCadastro.style.display = 'flex';
      btnCadastrar.disabled = true;
      
      try {
        // Usar função do bd.js
        let id;
        if (window.bd && window.bd.salvarSemente) {
          id = await window.bd.salvarSemente(dadosSemente);
        } else {
          throw new Error('Banco de dados não inicializado');
        }
        
        // Sucesso
        mostrarMensagem(`Semente cadastrada com sucesso! ID: ${id}`, 'success');
        
        // Criar notificação automática
        await criarNotificacaoSementeCadastrada(dadosSemente.nomeSemente, dadosSemente.quantidadeInicial);
        
        // Limpar formulário
        formCadastro.reset();
        
        // Atualizar dashboard (se necessário)
        atualizarDashboard();
        
      } catch (error) {
        console.error('Erro ao cadastrar semente:', error);
        mostrarMensagem('Erro ao cadastrar semente. Tente novamente.', 'error');
      } finally {
        // Esconder loading
        btnCadastrarText.style.display = 'inline';
        loadingCadastro.style.display = 'none';
        btnCadastrar.disabled = false;
      }
    });
  }
});

// Flag para evitar múltiplas execuções simultâneas
let atualizandoDashboard = false;

// Atualizar dashboard com dados reais
async function atualizarDashboard() {
  // Evitar execuções simultâneas
  if (atualizandoDashboard) {
    console.log('Dashboard já está sendo atualizado, aguardando...');
    return;
  }
  
  atualizandoDashboard = true;
  
  try {
    // Aguardar banco de dados estar pronto
    let tentativas = 0;
    while (!window.bd && tentativas < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      tentativas++;
    }
    
    if (!window.bd) {
      console.warn('Banco de dados não disponível para atualizar dashboard');
      return;
    }
    
    let sementes = [];
    try {
      if (window.bd.buscarTodasSementes) {
        sementes = await window.bd.buscarTodasSementes();
        
        // Validar e filtrar sementes inválidas
        sementes = sementes.filter(s => {
          if (!s || !s.id) return false;
          const qtd = parseFloat(s.quantidadeInicial);
          // Remover sementes com valores inválidos ou muito altos
          if (isNaN(qtd) || qtd < 0 || qtd > 1000000) {
            console.warn('Semente com quantidade inválida removida:', s);
            return false;
          }
          return true;
        });
        
        // Remover duplicatas baseado no ID
        const idsVistos = new Set();
        sementes = sementes.filter(s => {
          if (idsVistos.has(s.id)) {
            console.warn('Semente duplicada removida:', s);
            return false;
          }
          idsVistos.add(s.id);
          return true;
        });
      }
    } catch (dbError) {
      console.error('Erro ao buscar sementes:', dbError);
      sementes = [];
    }
    
    // Calcular totais com validação rigorosa
    let totalEstoque = 0;
    let sementesValidas = 0;
    
    sementes.forEach(s => {
      // Validar e converter quantidade
      let qtd = 0;
      if (s && s.quantidadeInicial !== undefined && s.quantidadeInicial !== null) {
        qtd = parseFloat(s.quantidadeInicial);
        // Validar se é um número válido e positivo
        if (isNaN(qtd) || qtd < 0 || qtd > 1000000) {
          console.warn('Quantidade inválida encontrada:', s);
          qtd = 0;
        } else {
          sementesValidas++;
        }
      }
      totalEstoque += qtd;
    });
    
    // Limitar a 2 casas decimais e garantir que não seja negativo
    totalEstoque = Math.max(0, Math.round(totalEstoque * 100) / 100);
    
    // Atualizar valores no dashboard
    const vEstoque = document.getElementById('v-estoque');
    if (vEstoque) {
      if (totalEstoque > 0) {
        // Formatar número sem decimais desnecessários
        const totalFormatado = totalEstoque % 1 === 0 
          ? totalEstoque.toString() 
          : totalEstoque.toFixed(2);
        vEstoque.textContent = `${totalFormatado} kg`;
      } else {
        vEstoque.textContent = '0 kg';
      }
    }
    
    const vLotes = document.getElementById('v-lotes');
    if (vLotes) {
      vLotes.textContent = sementesValidas || 0;
    }
    
    // Log detalhado para debug
    if (sementes.length > 0) {
      console.log('Dashboard atualizado:', {
        totalSementes: sementes.length,
        sementesValidas: sementesValidas,
        totalEstoque: totalEstoque + ' kg',
        detalhes: sementes.map(s => ({
          id: s.id,
          nome: s.nomeSemente,
          quantidade: parseFloat(s.quantidadeInicial) || 0
        }))
      });
    } else {
      console.log('Dashboard atualizado: Nenhuma semente cadastrada');
    }
  } catch (error) {
    console.error('Erro ao atualizar dashboard:', error);
    // Manter valores padrão em caso de erro
    const vEstoque = document.getElementById('v-estoque');
    if (vEstoque) {
      vEstoque.textContent = '0 kg';
    }
    const vLotes = document.getElementById('v-lotes');
    if (vLotes) {
      vLotes.textContent = '0';
    }
  } finally {
    atualizandoDashboard = false;
  }
}

// Initialize charts on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check login status first
  checkLogin();
  
  // Inicializar bancos de dados (IndexedDB e MySQL)
  if (window.bd && window.bd.inicializarBancos) {
    window.bd.inicializarBancos().then(() => {
      console.log('Bancos de dados inicializados');
      // Atualizar dashboard com dados reais
      atualizarDashboard();
    }).catch(error => {
      console.error('Erro ao inicializar bancos de dados:', error);
    });
  } else {
    // Fallback: apenas atualizar dashboard
    setTimeout(() => {
      atualizarDashboard();
    }, 500);
  }
  
  // Wait a bit for the DOM to be fully ready
  setTimeout(() => {
    initializeCharts();
  }, 100);
  
  // Criar notificações iniciais se não existirem
  criarNotificacoesIniciais();
});

// ==================== FUNCIONALIDADES DE NOTIFICAÇÕES ====================

let filtroAtualNotificacoes = 'todas';

// Carregar e exibir notificações
async function carregarNotificacoes(filtro = 'todas') {
  try {
    if (!window.bd || !window.bd.buscarTodasNotificacoes) {
      console.error('Banco de dados não disponível');
      return;
    }
    
    let notificacoes = await window.bd.buscarTodasNotificacoes();
    
    // Aplicar filtro
    if (filtro !== 'todas') {
      notificacoes = notificacoes.filter(n => n.tipo === filtro);
    }
    
    // Atualizar contador
    const totalNaoLidas = await window.bd.contarNotificacoesNaoLidas();
    const countElement = document.getElementById('notificacoesCount');
    if (countElement) {
      countElement.textContent = `${notificacoes.length} notificação${notificacoes.length !== 1 ? 'ões' : ''}${totalNaoLidas > 0 ? ` (${totalNaoLidas} não lidas)` : ''}`;
    }
    
    // Renderizar notificações
    renderizarNotificacoes(notificacoes);
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
  }
}

// Renderizar lista de notificações
function renderizarNotificacoes(notificacoes) {
  const lista = document.getElementById('notificacoesList');
  if (!lista) return;
  
  if (notificacoes.length === 0) {
    lista.innerHTML = '<div class="notificacao-empty"><p>Nenhuma notificação no momento</p></div>';
    return;
  }
  
  lista.innerHTML = notificacoes.map(notificacao => {
    const data = new Date(notificacao.dataCriacao);
    const tempoAtras = calcularTempoAtras(data);
    const classeLida = notificacao.lida ? '' : 'nao-lida';
    const iconClass = getIconClass(notificacao.tipo);
    const icon = getIcon(notificacao.tipo);
    
    return `
      <div class="notificacao-item ${classeLida}" data-id="${notificacao.id}">
        <div class="notificacao-icon ${iconClass}">${icon}</div>
        <div class="notificacao-content">
          <div class="notificacao-title">${notificacao.titulo}</div>
          <div class="notificacao-desc">${notificacao.descricao}</div>
          <div class="notificacao-time">${tempoAtras}</div>
        </div>
        <div class="notificacao-actions">
          ${!notificacao.lida ? `
            <button class="notificacao-action-btn" onclick="marcarNotificacaoComoLida(${notificacao.id})" title="Marcar como lida">
              ✓
            </button>
          ` : ''}
          <button class="notificacao-action-btn" onclick="deletarNotificacao(${notificacao.id})" title="Deletar">
            🗑️
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Calcular tempo atrás
function calcularTempoAtras(data) {
  const agora = new Date();
  const diffMs = agora - data;
  const diffSegundos = Math.floor(diffMs / 1000);
  const diffMinutos = Math.floor(diffSegundos / 60);
  const diffHoras = Math.floor(diffMinutos / 60);
  const diffDias = Math.floor(diffHoras / 24);
  
  if (diffDias > 0) {
    return `${diffDias} dia${diffDias !== 1 ? 's' : ''} atrás`;
  } else if (diffHoras > 0) {
    return `${diffHoras} hora${diffHoras !== 1 ? 's' : ''} atrás`;
  } else if (diffMinutos > 0) {
    return `${diffMinutos} minuto${diffMinutos !== 1 ? 's' : ''} atrás`;
  } else {
    return 'Agora';
  }
}

// Obter classe do ícone baseado no tipo
function getIconClass(tipo) {
  const classes = {
    'sementes': 'sementes',
    'lotes': 'lotes',
    'problemas': 'problemas',
    'sistema': 'sistema',
    'sucesso': 'sucesso'
  };
  return classes[tipo] || 'sistema';
}

// Obter ícone baseado no tipo
function getIcon(tipo) {
  const icons = {
    'sementes': '🌱',
    'lotes': '📦',
    'problemas': '⚠️',
    'sistema': '🔔',
    'sucesso': '✓'
  };
  return icons[tipo] || '🔔';
}

// Filtrar notificações
function filtrarNotificacoes(filtro) {
  filtroAtualNotificacoes = filtro;
  
  // Atualizar botões de filtro
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase().includes(filtro)) {
      btn.classList.add('active');
    }
  });
  
  carregarNotificacoes(filtro);
}

// Marcar notificação como lida
async function marcarNotificacaoComoLida(id) {
  try {
    if (window.bd && window.bd.marcarNotificacaoComoLida) {
      await window.bd.marcarNotificacaoComoLida(id);
      carregarNotificacoes(filtroAtualNotificacoes);
    }
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
  }
}

// Marcar todas como lidas
async function marcarTodasComoLidas() {
  try {
    if (window.bd && window.bd.marcarTodasNotificacoesComoLidas) {
      await window.bd.marcarTodasNotificacoesComoLidas();
      carregarNotificacoes(filtroAtualNotificacoes);
    }
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
  }
}

// Deletar notificação
async function deletarNotificacao(id) {
  if (!confirm('Tem certeza que deseja deletar esta notificação?')) {
    return;
  }
  
  try {
    if (window.bd && window.bd.deletarNotificacao) {
      await window.bd.deletarNotificacao(id);
      carregarNotificacoes(filtroAtualNotificacoes);
    }
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
  }
}

// Limpar todas as notificações
async function limparNotificacoes() {
  if (!confirm('Tem certeza que deseja limpar todas as notificações?')) {
    return;
  }
  
  try {
    if (window.bd && window.bd.deletarTodasNotificacoes) {
      await window.bd.deletarTodasNotificacoes();
      carregarNotificacoes(filtroAtualNotificacoes);
    }
  } catch (error) {
    console.error('Erro ao limpar notificações:', error);
  }
}

// Criar notificações iniciais (apenas se não existirem)
async function criarNotificacoesIniciais() {
  try {
    if (!window.bd || !window.bd.buscarTodasNotificacoes || !window.bd.criarNotificacao) {
      return;
    }
    
    const notificacoes = await window.bd.buscarTodasNotificacoes();
    
    // Se já existem notificações, não criar iniciais
    if (notificacoes.length > 0) {
      return;
    }
    
    // Criar notificações iniciais de exemplo variadas
    const notificacoesIniciais = [
      {
        tipo: 'sistema',
        titulo: 'Bem-vindo ao Semente Track!',
        descricao: 'Sistema de rastreamento e gestão de sementes iniciado com sucesso. Você pode começar a cadastrar sementes e gerenciar seus lotes.',
        dataCriacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 dia atrás
      },
      {
        tipo: 'sementes',
        titulo: 'Novo lote recebido',
        descricao: 'Chegou um novo lote de sementes de milho — aguardando conferência e cadastro no sistema.',
        dataCriacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 dias atrás
      },
      {
        tipo: 'sucesso',
        titulo: 'Atualização concluída',
        descricao: 'O relatório mensal de distribuição foi atualizado com sucesso. Total de 520 kg distribuídos este mês.',
        dataCriacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 dia atrás
      },
      {
        tipo: 'lotes',
        titulo: 'Entrega confirmada',
        descricao: 'O lote #224 foi entregue com sucesso na região oeste. Quantidade: 150 kg de sementes de soja.',
        dataCriacao: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 dias atrás
      },
      {
        tipo: 'problemas',
        titulo: 'Problema registrado',
        descricao: 'Foi aberta uma ocorrência na região norte: divergência no peso do lote #198. Verificação em andamento.',
        dataCriacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias atrás
      },
      {
        tipo: 'sementes',
        titulo: 'Estoque baixo',
        descricao: 'Atenção: O estoque de sementes de feijão está abaixo do mínimo recomendado (50 kg restantes).',
        dataCriacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 dias atrás
      },
      {
        tipo: 'lotes',
        titulo: 'Lote próximo do vencimento',
        descricao: 'O lote #187 de sementes de arroz está próximo do vencimento. Data de validade: 15 dias.',
        dataCriacao: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 dias atrás
      },
      {
        tipo: 'sucesso',
        titulo: 'Distribuição mensal concluída',
        descricao: 'Meta mensal de distribuição atingida! Total de 1.100 kg distribuídos em todas as regiões.',
        dataCriacao: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias atrás
      },
      {
        tipo: 'sistema',
        titulo: 'Backup realizado',
        descricao: 'Backup automático dos dados realizado com sucesso. Todos os registros foram salvos.',
        dataCriacao: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 dias atrás
      },
      {
        tipo: 'lotes',
        titulo: 'Nova remessa programada',
        descricao: 'Remessa de 300 kg de sementes de sorgo programada para chegada na próxima semana.',
        dataCriacao: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() // 9 dias atrás
      }
    ];
    
    // Criar notificações com algumas marcadas como lidas para exemplo
    for (let i = 0; i < notificacoesIniciais.length; i++) {
      const notif = notificacoesIniciais[i];
      const id = await window.bd.criarNotificacao(notif);
      
      // Marcar as 3 mais antigas como lidas
      if (i >= 7) {
        await window.bd.marcarNotificacaoComoLida(id);
      }
    }
    
    console.log('Notificações de exemplo criadas com sucesso');
  } catch (error) {
    console.error('Erro ao criar notificações iniciais:', error);
  }
}

// Criar notificação quando semente é cadastrada
async function criarNotificacaoSementeCadastrada(nomeSemente, quantidade) {
  try {
    if (window.bd && window.bd.criarNotificacao) {
      await window.bd.criarNotificacao({
        tipo: 'sementes',
        titulo: 'Nova semente cadastrada',
        descricao: `Semente "${nomeSemente}" cadastrada com sucesso. Quantidade: ${quantidade} kg.`
      });
    }
  } catch (error) {
    console.error('Erro ao criar notificação de semente:', error);
  }
}

// Função para criar notificações de exemplo (pode ser chamada manualmente)
async function criarNotificacoesExemplo() {
  try {
    if (!window.bd || !window.bd.criarNotificacao) {
      console.error('Banco de dados não disponível');
      return;
    }
    
    const agora = new Date();
    const notificacoesExemplo = [
      {
        tipo: 'sementes',
        titulo: 'Novo lote de milho recebido',
        descricao: 'Chegou um novo lote de sementes de milho — 200 kg aguardando conferência e cadastro no sistema.',
        dataCriacao: new Date(agora.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2 horas atrás
      },
      {
        tipo: 'lotes',
        titulo: 'Lote #225 em trânsito',
        descricao: 'O lote #225 de sementes de soja está em trânsito para a região sul. Previsão de chegada: 2 dias.',
        dataCriacao: new Date(agora.getTime() - 5 * 60 * 60 * 1000).toISOString() // 5 horas atrás
      },
      {
        tipo: 'sucesso',
        titulo: 'Relatório gerado com sucesso',
        descricao: 'Relatório mensal de distribuição gerado e exportado. Total de 850 kg processados.',
        dataCriacao: new Date(agora.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 dia atrás
      },
      {
        tipo: 'problemas',
        titulo: 'Atenção: Divergência de peso',
        descricao: 'Foi detectada uma divergência no peso do lote #203. Peso registrado: 150 kg. Peso real: 145 kg.',
        dataCriacao: new Date(agora.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias atrás
      },
      {
        tipo: 'sistema',
        titulo: 'Atualização do sistema disponível',
        descricao: 'Nova versão do sistema disponível. Recomendamos atualizar para melhorar a performance.',
        dataCriacao: new Date(agora.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 dias atrás
      },
      {
        tipo: 'sementes',
        titulo: 'Estoque crítico de feijão',
        descricao: 'ALERTA: Estoque de sementes de feijão está crítico. Apenas 25 kg restantes. Solicitar reposição urgente.',
        dataCriacao: new Date(agora.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 dias atrás
      },
      {
        tipo: 'lotes',
        titulo: 'Entrega confirmada - Região Leste',
        descricao: 'Lote #198 entregue com sucesso na região leste. 180 kg de sementes de arroz foram distribuídos.',
        dataCriacao: new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias atrás
      },
      {
        tipo: 'sucesso',
        titulo: 'Meta mensal superada',
        descricao: 'Parabéns! A meta mensal de distribuição foi superada em 15%. Total: 1.265 kg distribuídos.',
        dataCriacao: new Date(agora.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 dias atrás
      },
      {
        tipo: 'problemas',
        titulo: 'Qualidade do lote em análise',
        descricao: 'Lote #191 está em análise de qualidade. Amostras coletadas para teste de germinação.',
        dataCriacao: new Date(agora.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString() // 9 dias atrás
      },
      {
        tipo: 'lotes',
        titulo: 'Vencimento próximo - Lote #175',
        descricao: 'ATENÇÃO: Lote #175 de sementes de sorgo vence em 10 dias. Priorizar distribuição.',
        dataCriacao: new Date(agora.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 dias atrás
      }
    ];
    
    for (const notif of notificacoesExemplo) {
      await window.bd.criarNotificacao(notif);
    }
    
    console.log('Notificações de exemplo criadas:', notificacoesExemplo.length);
    
    // Recarregar notificações se estiver na aba de notificações
    if (document.getElementById('notificacoes-tab')?.classList.contains('active')) {
      carregarNotificacoes(filtroAtualNotificacoes);
    }
    
    return notificacoesExemplo.length;
  } catch (error) {
    console.error('Erro ao criar notificações de exemplo:', error);
    throw error;
  }
}

// Expor função globalmente para uso no console
window.criarNotificacoesExemplo = criarNotificacoesExemplo;

// ==================== FUNCIONALIDADES DE CONFIGURAÇÕES ====================

// Abrir configuração específica
function abrirConfiguracao(tipo) {
  switch(tipo) {
    case 'dados-pessoais':
      abrirModal('dados-pessoais');
      break;
    case 'itens-salvos':
      alert('Funcionalidade "Itens Salvos" em desenvolvimento.');
      break;
    case 'historico':
      alert('Funcionalidade "Histórico de Atividades" em desenvolvimento.');
      break;
    case 'transacoes':
      alert('Funcionalidade "Registro de Transações" em desenvolvimento.');
      break;
    case 'ajuda':
      alert('Central de Ajuda\n\nPara suporte, entre em contato:\nEmail: suporte@sementetrack.com\nTelefone: (87) 99999-9999');
      break;
    case 'privacidade':
      alert('Política de Privacidade\n\nSeus dados são protegidos e utilizados apenas para fins de gestão de sementes. Não compartilhamos suas informações com terceiros.');
      break;
    default:
      console.log('Configuração não implementada:', tipo);
  }
}

// Abrir modal
function abrirModal(tipo) {
  const modal = document.getElementById(`modal-${tipo}`);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Fechar modal
function fecharModal(tipo) {
  const modal = document.getElementById(`modal-${tipo}`);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Fechar modal ao clicar fora
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.config-modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Formulário de dados pessoais
  const formDadosPessoais = document.getElementById('formDadosPessoais');
  if (formDadosPessoais) {
    formDadosPessoais.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const dados = {
        nomeCompleto: document.getElementById('nomeCompleto').value,
        email: document.getElementById('emailPerfil').value,
        telefone: document.getElementById('telefonePerfil').value
      };
      
      // Salvar no localStorage
      localStorage.setItem('sementeTrackPerfil', JSON.stringify(dados));
      
      // Atualizar nome no header se necessário
      const helloElement = document.querySelector('.hello');
      if (helloElement && dados.nomeCompleto) {
        const primeiroNome = dados.nomeCompleto.split(' ')[0];
        helloElement.textContent = `Olá, ${primeiroNome}!`;
      }
      
      alert('Dados pessoais salvos com sucesso!');
      fecharModal('dados-pessoais');
    });
  }

  // Formulário de alterar senha
  const formAlterarSenha = document.getElementById('formAlterarSenha');
  if (formAlterarSenha) {
    formAlterarSenha.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const senhaAtual = document.getElementById('senhaAtual').value;
      const novaSenha = document.getElementById('novaSenha').value;
      const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value;
      
      if (novaSenha !== confirmarNovaSenha) {
        alert('As senhas não coincidem!');
        return;
      }
      
      if (novaSenha.length < 6) {
        alert('A nova senha deve ter pelo menos 6 caracteres!');
        return;
      }
      
      try {
        // Tentar alterar senha via MySQL
        if (window.bd && window.bd.atualizarSenhaMySQL) {
          const resultado = await window.bd.atualizarSenhaMySQL(senhaAtual, novaSenha);
          
          if (resultado.sucesso) {
            alert('Senha alterada com sucesso!');
            formAlterarSenha.reset();
            fecharModal('alterar-senha');
          } else {
            alert(resultado.mensagem || 'Erro ao alterar senha. Verifique a senha atual.');
          }
        } else {
          // Fallback: salvar no IndexedDB ou localStorage
          alert('Funcionalidade de alteração de senha em desenvolvimento offline.');
          formAlterarSenha.reset();
          fecharModal('alterar-senha');
        }
      } catch (error) {
        console.error('Erro ao alterar senha:', error);
        alert('Erro ao alterar senha. Tente novamente.');
      }
    });
  }
});

// Carregar dados do perfil
function carregarDadosPerfil() {
  try {
    // Carregar nome do usuário do localStorage
    const usuario = localStorage.getItem('sementeTrackUser') || 'admin';
    const usuarioPerfil = document.getElementById('usuarioPerfil');
    if (usuarioPerfil) {
      usuarioPerfil.value = usuario;
    }
    
    const dadosSalvos = localStorage.getItem('sementeTrackPerfil');
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      
      const nomeCompleto = document.getElementById('nomeCompleto');
      const emailPerfil = document.getElementById('emailPerfil');
      const telefonePerfil = document.getElementById('telefonePerfil');
      
      if (nomeCompleto) nomeCompleto.value = dados.nomeCompleto || '';
      if (emailPerfil) emailPerfil.value = dados.email || '';
      if (telefonePerfil) telefonePerfil.value = dados.telefone || '';
    } else {
      // Valores padrão se não houver dados salvos
      const nomeCompleto = document.getElementById('nomeCompleto');
      if (nomeCompleto && !nomeCompleto.value) {
        nomeCompleto.value = 'Fernando Guilherme';
      }
    }
    
    // Carregar foto de perfil salva
    const fotoSalva = localStorage.getItem('sementeTrackFotoPerfil');
    if (fotoSalva) {
      const img = document.getElementById('profilePictureImg');
      if (img) {
        img.src = fotoSalva;
      }
      // Atualizar também no sidebar
      const sidebarImg = document.querySelector('.user img');
      if (sidebarImg) {
        sidebarImg.src = fotoSalva;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar dados do perfil:', error);
  }
}

// Atualizar foto de perfil
function atualizarFotoPerfil(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Por favor, selecione uma imagem válida.');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    alert('A imagem deve ter no máximo 5MB.');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.getElementById('profilePictureImg');
    if (img) {
      img.src = e.target.result;
      // Salvar no localStorage
      localStorage.setItem('sementeTrackFotoPerfil', e.target.result);
      
      // Atualizar foto no sidebar também
      const sidebarImg = document.querySelector('.user img');
      if (sidebarImg) {
        sidebarImg.src = e.target.result;
      }
    }
  };
  reader.readAsDataURL(file);
}

// Confirmar logout
function confirmarLogout() {
  if (confirm('Tem certeza que deseja sair?')) {
    logout();
  }
}



