// ==================== CONFIGURAÇÃO DO BANCO DE DADOS ====================
// Configuração da API para MySQL (ajuste a URL conforme seu backend)
const API_BASE_URL = 'http://localhost:3000/api'; // Altere para a URL do seu backend

// ==================== INDEXEDDB - BANCO DE DADOS DE SEMENTES ====================
let db = null;
const DB_NAME = 'SementeTrackDB';
const DB_VERSION = 3; // Incrementado para adicionar store de notificações
const STORE_NAME = 'sementes';
const USUARIOS_STORE_NAME = 'usuarios';
const NOTIFICACOES_STORE_NAME = 'notificacoes';

// Inicializar banco de dados IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Erro ao abrir banco de dados:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('Banco de dados IndexedDB aberto com sucesso');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Criar object store de sementes se não existir
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        
        // Criar índices para busca
        objectStore.createIndex('nomeSemente', 'nomeSemente', { unique: false });
        objectStore.createIndex('dataCadastro', 'dataCadastro', { unique: false });
        objectStore.createIndex('categoriaAgricola', 'categoriaAgricola', { unique: false });
        
        console.log('Object store de sementes criado com sucesso');
      }
      
      // Criar object store de usuários se não existir
      if (!db.objectStoreNames.contains(USUARIOS_STORE_NAME)) {
        const usuariosStore = db.createObjectStore(USUARIOS_STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        
        // Criar índices para busca
        usuariosStore.createIndex('usuario', 'usuario', { unique: true });
        usuariosStore.createIndex('email', 'email', { unique: false });
        usuariosStore.createIndex('dataCriacao', 'dataCriacao', { unique: false });
        
        console.log('Object store de usuários criado com sucesso');
      }
      
      // Criar object store de notificações se não existir
      if (!db.objectStoreNames.contains(NOTIFICACOES_STORE_NAME)) {
        const notificacoesStore = db.createObjectStore(NOTIFICACOES_STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        
        // Criar índices para busca
        notificacoesStore.createIndex('tipo', 'tipo', { unique: false });
        notificacoesStore.createIndex('lida', 'lida', { unique: false });
        notificacoesStore.createIndex('dataCriacao', 'dataCriacao', { unique: false });
        
        console.log('Object store de notificações criado com sucesso');
      }
    };
  });
}

// Salvar semente no banco de dados IndexedDB
async function salvarSemente(dadosSemente) {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    // Adicionar data de cadastro
    dadosSemente.dataCadastro = new Date().toISOString();
    dadosSemente.dataCadastroFormatada = new Date().toLocaleDateString('pt-BR');
    
    const request = objectStore.add(dadosSemente);

    request.onsuccess = () => {
      console.log('Semente salva com sucesso. ID:', request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Erro ao salvar semente:', request.error);
      reject(request.error);
    };
  });
}

// Buscar todas as sementes do IndexedDB
async function buscarTodasSementes() {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Erro ao buscar sementes:', request.error);
      reject(request.error);
    };
  });
}

// Buscar semente por ID no IndexedDB
async function buscarSementePorId(id) {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Erro ao buscar semente:', request.error);
      reject(request.error);
    };
  });
}

// Deletar semente do IndexedDB
async function deletarSemente(id) {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error('Erro ao deletar semente:', request.error);
      reject(request.error);
    };
  });
}

// Atualizar semente no IndexedDB
async function atualizarSemente(id, dadosSemente) {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    dadosSemente.id = id;
    dadosSemente.dataAtualizacao = new Date().toISOString();
    
    const request = objectStore.put(dadosSemente);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Erro ao atualizar semente:', request.error);
      reject(request.error);
    };
  });
}

// ==================== MYSQL - BANCO DE DADOS DE LOGIN ====================

// Função auxiliar para fazer requisições à API com timeout
async function fazerRequisicao(endpoint, metodo = 'GET', dados = null, timeout = 3000) {
  const opcoes = {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  // Adicionar token de autenticação se existir
  const token = localStorage.getItem('sementeTrackToken');
  if (token) {
    opcoes.headers['Authorization'] = `Bearer ${token}`;
  }

  if (dados && (metodo === 'POST' || metodo === 'PUT')) {
    opcoes.body = JSON.stringify(dados);
  }

  try {
    // Criar promise com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const resposta = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...opcoes,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const dadosResposta = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dadosResposta.message || 'Erro na requisição');
    }

    return dadosResposta;
  } catch (error) {
    // Se for erro de timeout ou conexão, lançar erro específico
    if (error.name === 'AbortError') {
      throw new Error('Timeout: Servidor não respondeu a tempo');
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Servidor não disponível');
    }
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// Verificar se usuário está autenticado
async function verificarAutenticacao() {
  try {
    const resposta = await fazerRequisicao('/auth/verificar', 'GET');
    return resposta.autenticado;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
}

// Fazer login (MySQL via API ou IndexedDB)
async function fazerLoginMySQL(usuario, senha) {
  try {
    // Tentar login com MySQL primeiro (com timeout curto)
    try {
      const resposta = await fazerRequisicao('/auth/login', 'POST', {
        usuario: usuario,
        senha: senha
      }, 2000); // Timeout de 2 segundos

      if (resposta.token) {
        // Salvar token no localStorage
        localStorage.setItem('sementeTrackToken', resposta.token);
        localStorage.setItem('sementeTrackLoggedIn', 'true');
        localStorage.setItem('sementeTrackUser', resposta.usuario || usuario);
        localStorage.setItem('sementeTrackUserId', resposta.userId || '');
        
        return {
          sucesso: true,
          usuario: resposta.usuario || usuario,
          token: resposta.token
        };
      } else {
        return {
          sucesso: false,
          mensagem: resposta.message || 'Erro ao fazer login'
        };
      }
    } catch (mysqlError) {
      // Se MySQL falhar (timeout ou erro de conexão), tentar IndexedDB imediatamente
      console.warn('MySQL não disponível, tentando IndexedDB:', mysqlError.message);
      
      try {
        const usuarioDB = await buscarUsuarioIndexedDB(usuario);
        
        if (!usuarioDB) {
          return {
            sucesso: false,
            mensagem: 'Usuário não encontrado'
          };
        }
        
        // Verificar senha (em produção, usar hash)
        if (usuarioDB.senha === senha) {
          localStorage.setItem('sementeTrackLoggedIn', 'true');
          localStorage.setItem('sementeTrackUser', usuarioDB.usuario);
          localStorage.setItem('sementeTrackUserId', usuarioDB.id);
          
          return {
            sucesso: true,
            usuario: usuarioDB.usuario,
            nome: usuarioDB.nome
          };
        } else {
          return {
            sucesso: false,
            mensagem: 'Senha incorreta'
          };
        }
      } catch (dbError) {
        console.error('Erro ao buscar no IndexedDB:', dbError);
        return {
          sucesso: false,
          mensagem: 'Erro ao acessar banco de dados local'
        };
      }
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return {
      sucesso: false,
      mensagem: error.message || 'Erro ao conectar com o servidor'
    };
  }
}

// Registrar novo usuário (MySQL via API ou IndexedDB)
async function registrarUsuarioMySQL(dadosUsuario) {
  try {
    // Tentar registrar no MySQL primeiro
    try {
      const resposta = await fazerRequisicao('/auth/registrar', 'POST', {
        usuario: dadosUsuario.usuario,
        senha: dadosUsuario.senha,
        nome: dadosUsuario.nome,
        email: dadosUsuario.email || null
      });

      return {
        sucesso: true,
        mensagem: resposta.message || 'Usuário registrado com sucesso',
        usuario: resposta.usuario
      };
    } catch (mysqlError) {
      // Se MySQL falhar, salvar no IndexedDB
      console.warn('MySQL não disponível, salvando no IndexedDB:', mysqlError);
      
      try {
        const id = await salvarUsuarioIndexedDB({
          usuario: dadosUsuario.usuario,
          senha: dadosUsuario.senha, // Em produção, fazer hash antes
          nome: dadosUsuario.nome,
          email: dadosUsuario.email || null
        });
        
        return {
          sucesso: true,
          mensagem: 'Usuário registrado com sucesso no banco local',
          usuario: dadosUsuario.usuario,
          id: id
        };
      } catch (dbError) {
        if (dbError.message === 'Usuário já existe') {
          return {
            sucesso: false,
            mensagem: 'Este usuário já existe. Escolha outro nome de usuário.'
          };
        }
        throw dbError;
      }
    }
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return {
      sucesso: false,
      mensagem: error.message || 'Erro ao registrar usuário'
    };
  }
}

// ==================== INDEXEDDB - BANCO DE DADOS DE USUÁRIOS ====================

// Salvar usuário no IndexedDB
async function salvarUsuarioIndexedDB(dadosUsuario) {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USUARIOS_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(USUARIOS_STORE_NAME);
    
    // Verificar se usuário já existe
    const index = objectStore.index('usuario');
    const request = index.get(dadosUsuario.usuario);
    
    request.onsuccess = () => {
      if (request.result) {
        reject(new Error('Usuário já existe'));
        return;
      }
      
      // Adicionar data de cadastro
      dadosUsuario.dataCriacao = new Date().toISOString();
      
      // Salvar novo usuário
      const addRequest = objectStore.add(dadosUsuario);
      
      addRequest.onsuccess = () => {
        console.log('Usuário salvo no IndexedDB. ID:', addRequest.result);
        resolve(addRequest.result);
      };
      
      addRequest.onerror = () => {
        console.error('Erro ao salvar usuário:', addRequest.error);
        reject(addRequest.error);
      };
    };
    
    request.onerror = () => {
      console.error('Erro ao verificar usuário:', request.error);
      reject(request.error);
    };
  });
}

// Buscar usuário por nome de usuário no IndexedDB
async function buscarUsuarioIndexedDB(usuario) {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USUARIOS_STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(USUARIOS_STORE_NAME);
    const index = objectStore.index('usuario');
    const request = index.get(usuario);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      console.error('Erro ao buscar usuário:', request.error);
      reject(request.error);
    };
  });
}

// Buscar todos os usuários do IndexedDB
async function buscarTodosUsuariosIndexedDB() {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USUARIOS_STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(USUARIOS_STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Erro ao buscar usuários:', request.error);
      reject(request.error);
    };
  });
}

// Fazer logout
function fazerLogoutMySQL() {
  localStorage.removeItem('sementeTrackToken');
  localStorage.removeItem('sementeTrackLoggedIn');
  localStorage.removeItem('sementeTrackUser');
  localStorage.removeItem('sementeTrackUserId');
}

// Buscar informações do usuário logado (MySQL via API)
async function buscarUsuarioLogado() {
  try {
    const resposta = await fazerRequisicao('/auth/usuario', 'GET');
    return resposta;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

// Atualizar senha do usuário (MySQL via API)
async function atualizarSenhaMySQL(senhaAtual, novaSenha) {
  try {
    const resposta = await fazerRequisicao('/auth/atualizar-senha', 'PUT', {
      senhaAtual: senhaAtual,
      novaSenha: novaSenha
    });

    return {
      sucesso: true,
      mensagem: resposta.message || 'Senha atualizada com sucesso'
    };
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return {
      sucesso: false,
      mensagem: error.message || 'Erro ao atualizar senha'
    };
  }
}

// ==================== FUNÇÕES HÍBRIDAS (IndexedDB + MySQL) ====================

// Salvar semente (tenta MySQL primeiro, fallback para IndexedDB)
async function salvarSementeHibrido(dadosSemente) {
  try {
    // Tentar salvar no MySQL via API
    const resposta = await fazerRequisicao('/sementes', 'POST', dadosSemente);
    return {
      id: resposta.id,
      origem: 'MySQL'
    };
  } catch (error) {
    console.warn('Erro ao salvar no MySQL, usando IndexedDB:', error);
    // Fallback para IndexedDB
    const id = await salvarSemente(dadosSemente);
    return {
      id: id,
      origem: 'IndexedDB'
    };
  }
}

// Buscar todas as sementes (tenta MySQL primeiro, fallback para IndexedDB)
async function buscarTodasSementesHibrido() {
  try {
    // Tentar buscar no MySQL via API
    const resposta = await fazerRequisicao('/sementes', 'GET');
    return resposta.sementes || resposta;
  } catch (error) {
    console.warn('Erro ao buscar no MySQL, usando IndexedDB:', error);
    // Fallback para IndexedDB
    return await buscarTodasSementes();
  }
}

// Inicializar ambos os bancos de dados
async function inicializarBancos() {
  try {
    // Inicializar IndexedDB
    await initDB();
    console.log('IndexedDB inicializado');
    
    // Verificar se MySQL está disponível
    try {
      await verificarAutenticacao();
      console.log('Conexão MySQL disponível');
    } catch (error) {
      console.warn('MySQL não disponível, usando apenas IndexedDB:', error);
    }
  } catch (error) {
    console.error('Erro ao inicializar bancos de dados:', error);
  }
}

// ==================== INDEXEDDB - BANCO DE DADOS DE NOTIFICAÇÕES ====================

// Criar notificação
async function criarNotificacao(dadosNotificacao) {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTIFICACOES_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(NOTIFICACOES_STORE_NAME);
    
    // Adicionar data de criação apenas se não foi fornecida
    if (!dadosNotificacao.dataCriacao) {
      dadosNotificacao.dataCriacao = new Date().toISOString();
    }
    
    // Garantir que lida seja false se não foi definido
    if (dadosNotificacao.lida === undefined) {
      dadosNotificacao.lida = false;
    }
    
    const request = objectStore.add(dadosNotificacao);

    request.onsuccess = () => {
      console.log('Notificação criada. ID:', request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Erro ao criar notificação:', request.error);
      reject(request.error);
    };
  });
}

// Buscar todas as notificações
async function buscarTodasNotificacoes() {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTIFICACOES_STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(NOTIFICACOES_STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      // Ordenar por data (mais recentes primeiro)
      const notificacoes = request.result.sort((a, b) => 
        new Date(b.dataCriacao) - new Date(a.dataCriacao)
      );
      resolve(notificacoes);
    };

    request.onerror = () => {
      console.error('Erro ao buscar notificações:', request.error);
      reject(request.error);
    };
  });
}

// Marcar notificação como lida
async function marcarNotificacaoComoLida(id) {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTIFICACOES_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(NOTIFICACOES_STORE_NAME);
    const getRequest = objectStore.get(id);

    getRequest.onsuccess = () => {
      const notificacao = getRequest.result;
      if (notificacao) {
        notificacao.lida = true;
        const putRequest = objectStore.put(notificacao);
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        reject(new Error('Notificação não encontrada'));
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Marcar todas as notificações como lidas
async function marcarTodasNotificacoesComoLidas() {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTIFICACOES_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(NOTIFICACOES_STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      const notificacoes = request.result;
      let atualizadas = 0;
      
      notificacoes.forEach(notificacao => {
        if (!notificacao.lida) {
          notificacao.lida = true;
          objectStore.put(notificacao);
          atualizadas++;
        }
      });
      
      resolve(atualizadas);
    };

    request.onerror = () => reject(request.error);
  });
}

// Deletar notificação
async function deletarNotificacao(id) {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTIFICACOES_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(NOTIFICACOES_STORE_NAME);
    const request = objectStore.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Deletar todas as notificações
async function deletarTodasNotificacoes() {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTIFICACOES_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(NOTIFICACOES_STORE_NAME);
    const request = objectStore.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Contar notificações não lidas
async function contarNotificacoesNaoLidas() {
  if (!db) {
    await initDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTIFICACOES_STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(NOTIFICACOES_STORE_NAME);
    const index = objectStore.index('lida');
    const request = index.getAll(false); // false = não lidas

    request.onsuccess = () => {
      resolve(request.result.length);
    };

    request.onerror = () => reject(request.error);
  });
}

// Exportar funções para uso global
window.bd = {
  // IndexedDB - Sementes
  initDB,
  salvarSemente,
  buscarTodasSementes,
  buscarSementePorId,
  deletarSemente,
  atualizarSemente,
  
  // IndexedDB - Usuários
  salvarUsuarioIndexedDB,
  buscarUsuarioIndexedDB,
  buscarTodosUsuariosIndexedDB,
  
  // IndexedDB - Notificações
  criarNotificacao,
  buscarTodasNotificacoes,
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
  deletarNotificacao,
  deletarTodasNotificacoes,
  contarNotificacoesNaoLidas,
  
  // MySQL - Login
  fazerLoginMySQL,
  registrarUsuarioMySQL,
  fazerLogoutMySQL,
  buscarUsuarioLogado,
  atualizarSenhaMySQL,
  verificarAutenticacao,
  
  // Híbrido
  salvarSementeHibrido,
  buscarTodasSementesHibrido,
  inicializarBancos,
  
  // Configuração
  API_BASE_URL
};

