🌱 Dashboard de Controle — Projeto Completo

Um sistema completo de Dashboard Administrativo, com login, gráficos dinâmicos, cards estatísticos, tabelas e formulários profissionais.
Ideal para controle de produtos, estoque, validade e métricas diversas.

📌 Índice

Sobre o Projeto

Funcionalidades

Design e Experiência

Arquitetura de Arquivos

Tecnologias Utilizadas

Como Executar

Detalhamento do Dashboard

Detalhamento dos Formulários

Gráficos

Customização

Melhorias Futuras

Autor

📖 Sobre o Projeto

Este projeto é um painel administrativo moderno, criado para facilitar visualização de dados, controle de produtos e acompanhamento de métricas.
Ele integra UI moderna, gráficos animados, navegação intuitiva e um layout responsivo.

Foi projetado para:

Controle de estoque

Cadastro de produtos

Visualização de métricas

Gestão de validade

Painel para negócios, mercados, farmácias, hortifruti, indústria alimentícia

Uso para estudos de front-end

⭐ Funcionalidades
🔐 Sistema de Login

Tela exclusiva

Mascaramento de senha

Validação de campos

Transição suave para o dashboard

🧭 Barra Lateral (Menu)

Ícones modernos

Navegação entre:

Dashboard

Tarefas

Cadastro de produtos

Cadastro de lotes

Notificações

Sair

📊 Dashboard Interativo

Inclui:

Cards com estatísticas

Gráficos animados

Layout responsivo

Dados atualizados dinamicamente

📈 Gráficos (Chart.js)

Gráfico de Linha (LineChart): evolução de dados

Gráfico de Pizza (PieChart): porcentagens

📋 Tabela de Atividades

Lista itens, status e ações

Interface simples e limpa

🔔 Painel de Notificações

Lateral retrátil

Abre e fecha suavemente

Ideal para alertas importantes

📝 Formulários Profissionais

Cadastro de produto

Cadastro de lote

Inputs com labels animados

Dois blocos por linha

Layout visualmente organizado

Totalmente responsivo

🎨 Design e Experiência

O design é inspirado em dashboards modernos:

Tema clean e profissional

Cores suaves

Cards com sombra leve

Bordas arredondadas

Efeitos de hover

Animações suaves

Estrutura bem distribuída:

grid

flexbox

Os elementos foram criados para serem:

✔ Intuitivos
✔ Legíveis
✔ Minimalistas
✔ Consistentes

📁 Arquitetura de Arquivos
project/
│── index.html          # Estrutura principal
│── style.css           # Estilização completa do sistema
│── script.js           # Funcionalidades, gráficos e interação
│── README.md           # Documentação oficial
│
└── /assets
     ├── icons/         # Ícones do menu e da interface
     ├── images/        # Imagens usadas no site

🧪 Tecnologias Utilizadas
Tecnologia	Uso
HTML5	Estrutura das páginas
CSS3	Estilização, animação e responsividade
JavaScript	Lógica, login, formulários, notificações
Chart.js	Gráficos interativos
Flexbox & Grid	Layout geral
🚀 Como Executar

Baixe ou clone o projeto:

git clone https://github.com/SEU_USUARIO/dashboard.git


Abra o arquivo:

index.html


O sistema funciona 100% sem backend, basta abrir no navegador.

📊 Detalhamento do Dashboard
🟩 Cards Informativos

Total de produtos

Produtos vencidos

Produtos próximos a vencer

Média da validade

Cada card usa:

Sombra suave

Cor indicativa (verde, laranja, vermelho)

Ícone ilustrativo

Texto grande para foco visual

📈 Gráficos Dinâmicos

100% responsivos

Atualização automática

Suporte para múltiplas séries

Animações com suavidade

📝 Detalhamento dos Formulários
📌 Cadastro de Produto

Campos:

Nome do produto

Categoria

Código

Quantidade

Data de validade

Valor

Descrição

Design:

Inputs com animação

Labels flutuantes

Organização por etapas

Layout em 2 colunas

📦 Cadastro de Lote

Campos:

Nº do lote

Quantidade

Local de armazenamento

Data de fabricação

Data de validade

Observações

Todos os campos seguem:

Bordas suaves

Espaçamento ótimo

Acessibilidade

Responsividade mobile

🎚 Customização

Você pode modificar facilmente:

🎨 Cores principais

No :root do CSS:

--primary-color: #28a745;
--warning-color: #fd7e14;
--danger-color: #dc3545;

🔢 Gráficos

No script.js, altere:

data: [5, 10, 6, 8]
labels: ["Jan", "Fev", "Mar", "Abr"]

🪪 Cards

Fácil de duplicar e editar:

<div class="card green"> ... </div>

💡 Melhorias Futuras

Integração com banco de dados

Login real com validação de usuário

Exportar dados em Excel/PDF

Tema Dark Mode

Dashboard com filtros avançados

API para recebimento de dados externos

Tela mobile dedicada

👤 Autor

Projeto desenvolvido e organizado por Caio Barreto , Luiz Felipe , Vitor daniel
