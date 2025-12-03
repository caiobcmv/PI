# Configuração do Banco de Dados MySQL

Este documento explica como configurar o banco de dados MySQL para o sistema Semente Track.

## 📋 Pré-requisitos

- MySQL instalado e rodando
- Node.js instalado (para o backend)
- npm ou yarn

## 🗄️ Estrutura do Banco de Dados

### 1. Criar o Banco de Dados

```sql
CREATE DATABASE IF NOT EXISTS semente_track;
USE semente_track;
```

### 2. Criar Tabela de Usuários

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(50) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_usuario (usuario)
);
```

### 3. Criar Tabela de Sementes

```sql
CREATE TABLE IF NOT EXISTS sementes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nome_semente VARCHAR(100) NOT NULL,
  categoria_agricola VARCHAR(50),
  origem_lote VARCHAR(100),
  quantidade_inicial DECIMAL(10, 2) NOT NULL,
  responsavel_lote VARCHAR(100),
  fornecedor VARCHAR(100),
  data_aquisicao DATE,
  validade_lote DATE,
  armazenamento VARCHAR(200),
  observacoes TEXT,
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_id),
  INDEX idx_nome (nome_semente),
  INDEX idx_categoria (categoria_agricola),
  INDEX idx_data_cadastro (data_cadastro)
);
```

## 🔧 Configuração do Backend

### 1. Instalar Dependências

```bash
npm install express mysql2 jsonwebtoken bcryptjs cors
```

### 2. Configurar Conexão

Edite o arquivo `backend-mysql-exemplo.js` e ajuste as configurações:

```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'sua_senha',
  database: 'semente_track',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
```

### 3. Configurar JWT Secret

Altere a chave secreta JWT:

```javascript
const JWT_SECRET = 'sua_chave_secreta_aqui'; // Use uma chave segura
```

### 4. Iniciar o Servidor

```bash
node backend-mysql-exemplo.js
```

O servidor estará rodando em `http://localhost:3000`

## 🔐 Criar Usuário Admin

Para criar um usuário admin, você pode usar o script SQL ou criar via API:

### Via SQL (com hash de senha):

```sql
-- Senha: 123456 (hash gerado com bcrypt)
INSERT INTO usuarios (usuario, senha, nome) VALUES 
('admin', '$2a$10$rK8Z5Y5Y5Y5Y5Y5Y5Y5Y5eK8Z5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'Administrador');
```

### Via API:

```bash
POST http://localhost:3000/api/auth/registrar
Content-Type: application/json

{
  "usuario": "admin",
  "senha": "123456",
  "nome": "Administrador",
  "email": "admin@example.com"
}
```

## 🔌 Configuração do Frontend

No arquivo `js/bd.js`, ajuste a URL da API:

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

## 📡 Endpoints da API

### Autenticação

- `POST /api/auth/login` - Fazer login
- `POST /api/auth/registrar` - Registrar novo usuário
- `GET /api/auth/verificar` - Verificar autenticação
- `GET /api/auth/usuario` - Buscar usuário logado
- `PUT /api/auth/atualizar-senha` - Atualizar senha

### Sementes

- `GET /api/sementes` - Buscar todas as sementes
- `GET /api/sementes/:id` - Buscar semente por ID
- `POST /api/sementes` - Salvar nova semente
- `PUT /api/sementes/:id` - Atualizar semente
- `DELETE /api/sementes/:id` - Deletar semente

## 🔒 Segurança

- Todas as rotas de sementes requerem autenticação (token JWT)
- As senhas são armazenadas com hash bcrypt
- Cada usuário só pode acessar suas próprias sementes

## 🚀 Modo de Desenvolvimento

Se o backend MySQL não estiver disponível, o sistema automaticamente usa IndexedDB (banco de dados local do navegador) como fallback.

## 📝 Notas

- Em produção, use variáveis de ambiente para configurações sensíveis
- Configure HTTPS para comunicação segura
- Use um gerenciador de processos como PM2 para produção
- Configure backup regular do banco de dados MySQL

