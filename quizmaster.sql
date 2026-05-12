-- QuizMaster Database Dump (template)

CREATE DATABASE IF NOT EXISTS quizmaster;
USE quizmaster;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example seed (optional)
-- INSERT INTO users (username, email, password)
-- VALUES ('testuser', 'test@test.com', '123456');
