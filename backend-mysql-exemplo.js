/**
 * EXEMPLO DE BACKEND NODE.JS + EXPRESS + MYSQL
 * 
 * Este é um exemplo de como criar um backend para conectar com MySQL
 * Instale as dependências: npm install express mysql2 jsonwebtoken bcryptjs cors
 * 
 * Execute: node backend-mysql-exemplo.js
 */

const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'sua_chave_secreta_aqui'; // Use uma chave segura em produção

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'sua_senha',
  database: 'semente_track',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// ==================== FUNÇÕES AUXILIARES ====================

// Verificar token JWT
function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.usuario = decoded.usuario;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    
    if (!usuario || !senha) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
    }
    
    // Buscar usuário no banco
    const [rows] = await pool.execute(
      'SELECT id, usuario, senha, nome FROM usuarios WHERE usuario = ?',
      [usuario]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }
    
    const user = rows[0];
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, usuario: user.usuario },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      usuario: user.usuario,
      nome: user.nome,
      userId: user.id
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Registrar novo usuário
app.post('/api/auth/registrar', async (req, res) => {
  try {
    const { usuario, senha, nome, email } = req.body;
    
    if (!usuario || !senha || !nome) {
      return res.status(400).json({ message: 'Usuário, senha e nome são obrigatórios' });
    }
    
    // Verificar se usuário já existe
    const [existing] = await pool.execute(
      'SELECT id FROM usuarios WHERE usuario = ?',
      [usuario]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }
    
    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);
    
    // Inserir usuário
    const [result] = await pool.execute(
      'INSERT INTO usuarios (usuario, senha, nome, email, data_criacao) VALUES (?, ?, ?, ?, NOW())',
      [usuario, senhaHash, nome, email || null]
    );
    
    res.json({
      message: 'Usuário registrado com sucesso',
      userId: result.insertId,
      usuario: usuario
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar autenticação
app.get('/api/auth/verificar', verificarToken, (req, res) => {
  res.json({ autenticado: true, usuario: req.usuario });
});

// Buscar usuário logado
app.get('/api/auth/usuario', verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, usuario, nome, email, data_criacao FROM usuarios WHERE id = ?',
      [req.userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar senha
app.put('/api/auth/atualizar-senha', verificarToken, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
    }
    
    // Buscar senha atual
    const [rows] = await pool.execute(
      'SELECT senha FROM usuarios WHERE id = ?',
      [req.userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, rows[0].senha);
    
    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }
    
    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    
    // Atualizar senha
    await pool.execute(
      'UPDATE usuarios SET senha = ? WHERE id = ?',
      [novaSenhaHash, req.userId]
    );
    
    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ==================== ROTAS DE SEMENTES ====================

// Buscar todas as sementes
app.get('/api/sementes', verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM sementes WHERE usuario_id = ? ORDER BY data_cadastro DESC',
      [req.userId]
    );
    
    res.json({ sementes: rows });
  } catch (error) {
    console.error('Erro ao buscar sementes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar semente por ID
app.get('/api/sementes/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT * FROM sementes WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Semente não encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar semente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Salvar nova semente
app.post('/api/sementes', verificarToken, async (req, res) => {
  try {
    const {
      nomeSemente,
      categoriaAgricola,
      origemLote,
      quantidadeInicial,
      responsavelLote,
      fornecedor,
      dataAquisicao,
      validadeLote,
      armazenamento,
      observacoes
    } = req.body;
    
    // Validação básica
    if (!nomeSemente || !categoriaAgricola || !quantidadeInicial) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO sementes (
        usuario_id, nome_semente, categoria_agricola, origem_lote,
        quantidade_inicial, responsavel_lote, fornecedor, data_aquisicao,
        validade_lote, armazenamento, observacoes, data_cadastro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.userId,
        nomeSemente,
        categoriaAgricola,
        origemLote || null,
        quantidadeInicial,
        responsavelLote || null,
        fornecedor || null,
        dataAquisicao || null,
        validadeLote || null,
        armazenamento || null,
        observacoes || null
      ]
    );
    
    res.json({
      id: result.insertId,
      message: 'Semente cadastrada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao salvar semente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar semente
app.put('/api/sementes/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;
    
    // Verificar se a semente pertence ao usuário
    const [check] = await pool.execute(
      'SELECT id FROM sementes WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    );
    
    if (check.length === 0) {
      return res.status(404).json({ message: 'Semente não encontrada' });
    }
    
    await pool.execute(
      `UPDATE sementes SET
        nome_semente = ?,
        categoria_agricola = ?,
        origem_lote = ?,
        quantidade_inicial = ?,
        responsavel_lote = ?,
        fornecedor = ?,
        data_aquisicao = ?,
        validade_lote = ?,
        armazenamento = ?,
        observacoes = ?,
        data_atualizacao = NOW()
      WHERE id = ? AND usuario_id = ?`,
      [
        dados.nomeSemente,
        dados.categoriaAgricola,
        dados.origemLote,
        dados.quantidadeInicial,
        dados.responsavelLote,
        dados.fornecedor,
        dados.dataAquisicao,
        dados.validadeLote,
        dados.armazenamento,
        dados.observacoes,
        id,
        req.userId
      ]
    );
    
    res.json({ message: 'Semente atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar semente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar semente
app.delete('/api/sementes/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM sementes WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Semente não encontrada' });
    }
    
    res.json({ message: 'Semente deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar semente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api`);
});

/**
 * ==================== SCRIPTS SQL PARA CRIAR AS TABELAS ====================
 * 
 * Execute estes scripts no MySQL para criar as tabelas necessárias:
 * 
 * CREATE DATABASE IF NOT EXISTS semente_track;
 * USE semente_track;
 * 
 * -- Tabela de usuários
 * CREATE TABLE IF NOT EXISTS usuarios (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   usuario VARCHAR(50) UNIQUE NOT NULL,
 *   senha VARCHAR(255) NOT NULL,
 *   nome VARCHAR(100) NOT NULL,
 *   email VARCHAR(100),
 *   data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
 *   INDEX idx_usuario (usuario)
 * );
 * 
 * -- Tabela de sementes
 * CREATE TABLE IF NOT EXISTS sementes (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   usuario_id INT NOT NULL,
 *   nome_semente VARCHAR(100) NOT NULL,
 *   categoria_agricola VARCHAR(50),
 *   origem_lote VARCHAR(100),
 *   quantidade_inicial DECIMAL(10, 2) NOT NULL,
 *   responsavel_lote VARCHAR(100),
 *   fornecedor VARCHAR(100),
 *   data_aquisicao DATE,
 *   validade_lote DATE,
 *   armazenamento VARCHAR(200),
 *   observacoes TEXT,
 *   data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
 *   data_atualizacao DATETIME ON UPDATE CURRENT_TIMESTAMP,
 *   FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
 *   INDEX idx_usuario (usuario_id),
 *   INDEX idx_nome (nome_semente),
 *   INDEX idx_categoria (categoria_agricola),
 *   INDEX idx_data_cadastro (data_cadastro)
 * );
 * 
 * -- Inserir usuário admin padrão (senha: 123456)
 * INSERT INTO usuarios (usuario, senha, nome) VALUES 
 * ('admin', '$2a$10$rK8Z5Y5Y5Y5Y5Y5Y5Y5Y5eK8Z5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'Administrador');
 * 
 * NOTA: A senha acima é um hash de exemplo. Use bcrypt para gerar o hash real da senha '123456'
 */

