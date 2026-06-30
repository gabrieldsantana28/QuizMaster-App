import express from 'express';
import * as adminController from './admin.controller.js';
import isAuthenticated from '../../middlewares/auth.js';

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) return next();
  req.flash('error', 'Acesso restrito a administradores.');
  res.redirect('/feed');
};

const router = express.Router();
router.use(isAuthenticated, isAdmin);
router.get('/admin', adminController.dashboard);
router.get('/admin/usuarios', adminController.gerenciarUsuarios);
router.get('/admin/quizzes', adminController.gerenciarQuizzes);
router.post('/admin/quizzes/:id/toggle', adminController.ativarDesativarQuiz);
router.get('/admin/temas', adminController.gerenciarTemas);
router.post('/admin/temas', adminController.criarTema);
export default router;