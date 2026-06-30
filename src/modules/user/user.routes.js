import express from 'express';
import * as userController from './user.controller.js';

const router = express.Router();

router.get('/register', (req, res) => res.render('register', { title: 'Criar Conta' }));
router.post('/register', userController.register);
router.get('/login', (req, res) => res.render('login', { title: 'Entrar' }));
router.post('/login', userController.login);
router.get('/logout', userController.logout);

export default router;