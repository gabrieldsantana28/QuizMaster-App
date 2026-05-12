import express from 'express';
import * as userController from './user.controller.js';

const router = express.Router();

// GET /register → formulário
router.get('/register', (req, res) => {
  res.render('register', { title: 'Criar Conta' });
});

// POST /register → cadastro
router.post('/register', userController.register);

export default router;

// [ADICIONAR] novo import
import isAuthenticated from '../../middlewares/auth.js';
// ... outras rotas já existentes ...
// [ADICIONAR] 4 novas rotas
router.get('/login', (req, res) => {
res.render('login', { title: 'Entrar' });
});
router.post('/login', userController.login);
router.get('/logout', userController.logout);
// Rota protegida (exemplo)
router.get('/feed', isAuthenticated, (req, res) => {
res.render('feed', { title: 'Feed | Shortz-App' });
});