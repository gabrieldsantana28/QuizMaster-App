import express from 'express';
import * as questaoController from './questao.controller.js';

const router = express.Router();

// Listar questões de um quiz
router.get('/quizzes/:quizId/questoes', questaoController.listar);

// Formulário de nova questão
router.get('/quizzes/:quizId/questoes/nova', questaoController.novaForm);

// Criar nova questão
router.post('/questoes', questaoController.criar);

// Buscar questão por ID
router.get('/questoes/:id', questaoController.buscarPorId);

// Formulário de edição de questão
router.get('/questoes/:id/editar', questaoController.editarForm);

// Atualizar questão
router.post('/questoes/:id/editar', questaoController.atualizar);

// Excluir questão
router.post('/questoes/:id/excluir', questaoController.excluir);

// Verificar resposta (JSON endpoint)
router.post('/questoes/:id/responder', questaoController.verificarResposta);

export default router;
