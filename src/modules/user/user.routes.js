import express from 'express';
import * as userController from './user.controller.js';
import isAuthenticated from '../../middlewares/auth.js';

const router = express.Router();

// GET /register → formulário
router.get('/register', (req, res) => {
  res.render('register', { title: 'Criar Conta' });
});

// POST /register → cadastro
router.post('/register', userController.register);

// GET /login → formulário
router.get('/login', (req, res) => {
  res.render('login', { title: 'Entrar' });
});

// POST /login → autenticação
router.post('/login', userController.login);

// GET /logout → sair
router.get('/logout', userController.logout);

// GET /feed → feed protegido
router.get('/feed', isAuthenticated, (req, res) => {
  res.render('feed', { title: 'Feed | QuizMaster' });
});

export default router;