import express from 'express';
import * as favoritoController from './favorito.controller.js';
import isAuthenticated from '../../middlewares/auth.js';

const router = express.Router();
router.get('/favoritos', isAuthenticated, favoritoController.listar);
router.post('/quiz/:quizId/favoritar', isAuthenticated, favoritoController.favoritar);
router.post('/quiz/:quizId/desfavoritar', isAuthenticated, favoritoController.desfavoritar);
export default router;