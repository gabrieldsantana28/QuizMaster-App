import express from 'express';
import * as quizController from './quiz.controller.js';
import isAuthenticated from '../../middlewares/auth.js';

const router = express.Router();
router.get('/feed', isAuthenticated, quizController.listar);
router.get('/quiz/criar', isAuthenticated, quizController.formCriar);
router.post('/quiz/criar', isAuthenticated, quizController.criar);
router.get('/quiz/:id', isAuthenticated, quizController.detalhe);
router.post('/quiz/:id/avaliar', isAuthenticated, quizController.avaliar);
export default router;