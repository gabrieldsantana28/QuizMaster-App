CREATE DATABASE IF NOT EXISTS quizmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quizmaster;

-- Temas
CREATE TABLE IF NOT EXISTS temas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao VARCHAR(255),
  icone VARCHAR(10) DEFAULT '📚',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(150),
  bio VARCHAR(255),
  profile_picture VARCHAR(255) DEFAULT 'default-profile.png',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  tema_id INT NOT NULL,
  autor_id INT NOT NULL,
  dificuldade ENUM('facil','medio','dificil') DEFAULT 'medio',
  ativo BOOLEAN DEFAULT TRUE,
  total_participantes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tema_id) REFERENCES temas(id),
  FOREIGN KEY (autor_id) REFERENCES users(id)
);

-- Questões
CREATE TABLE IF NOT EXISTS questoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  enunciado TEXT NOT NULL,
  opcao_a VARCHAR(255) NOT NULL,
  opcao_b VARCHAR(255) NOT NULL,
  opcao_c VARCHAR(255),
  opcao_d VARCHAR(255),
  resposta_correta ENUM('a','b','c','d') NOT NULL,
  ordem INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Favoritos
CREATE TABLE IF NOT EXISTS favoritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quiz_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorito (user_id, quiz_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quiz_id INT NOT NULL,
  nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_avaliacao (user_id, quiz_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Seeds: Temas padrão
INSERT IGNORE INTO temas (nome, descricao, icone) VALUES
('Programação',    'Lógica, algoritmos e linguagens', '💻'),
('JavaScript',     'Conceitos e frameworks JavaScript', '🟨'),
('Banco de Dados', 'SQL, NoSQL e modelagem de dados', '🗄️'),
('Redes',          'Protocolos, segurança e infraestrutura', '🌐'),
('React',          'Biblioteca front-end da Meta', '⚛️'),
('Node.js',        'Runtime JavaScript servidor', '🟢'),
('Geral',          'Conhecimentos gerais e cultura tech', '📖');