import * as questaoService from './questao.service.js';
import Questao from './questao.model.js';
import Quiz from '../quiz/quiz.model.js';

// Exibe o formulário de criação de uma nova questão para um quiz
export const novaForm = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      req.flash('error', 'Quiz não encontrado.');
      return res.redirect('/feed');
    }
    res.render('questoes/form', {
      title: 'Nova Questão',
      quiz,
      questao: null,
      alternativasAtuais: ['', ''],
      errors: []
    });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/feed');
  }
};

// Exibe o formulário de edição de uma questão existente
export const editarForm = async (req, res) => {
  try {
    const questao = await questaoService.buscarQuestaoPorId(req.params.id, Questao);

    if (req.session?.user?.id !== questao.autorId) {
      req.flash('error', 'Você não tem permissão para editar esta questão.');
      return res.redirect(`/quizzes/${questao.quizId}/questoes`);
    }

    const quiz = await Quiz.findByPk(questao.quizId);
    res.render('questoes/form', {
      title: 'Editar Questão',
      quiz,
      questao,
      alternativasAtuais: JSON.parse(questao.alternativas),
      errors: []
    });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/feed');
  }
};

export const criar = async (req, res) => {
  try {
    const autorId = req.session?.user?.id;
    const result = await questaoService.criarQuestao(
      { ...req.body, autorId },
      Questao
    );
    req.flash('success', result.message);
    res.redirect(`/quizzes/${req.body.quizId}/questoes`);
  } catch (error) {
    req.flash('error', error.message);
    res.redirect(`/quizzes/${req.body.quizId}/questoes/nova`);
  }
};

export const listar = async (req, res) => {
  try {
    const { quizId } = req.params;
    const questoes = await questaoService.listarQuestoesPorQuiz(quizId, Questao);
    res.render('questoes/lista', { title: 'Questões do Quiz', questoes, quizId });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/feed');
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const questao = await questaoService.buscarQuestaoPorId(req.params.id, Questao);
    res.render('questoes/detalhe', { title: 'Questão', questao });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/feed');
  }
};

export const atualizar = async (req, res) => {
  try {
    const autorId = req.session?.user?.id;
    const result = await questaoService.atualizarQuestao(
      req.params.id,
      req.body,
      autorId,
      Questao
    );
    req.flash('success', result.message);
    res.redirect(`/quizzes/${req.body.quizId}/questoes`);
  } catch (error) {
    req.flash('error', error.message);
    res.redirect(`/questoes/${req.params.id}/editar`);
  }
};

export const excluir = async (req, res) => {
  try {
    const autorId = req.session?.user?.id;
    const result = await questaoService.excluirQuestao(req.params.id, autorId, Questao);
    req.flash('success', result.message);
    res.redirect('back');
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('back');
  }
};

export const verificarResposta = async (req, res) => {
  try {
    const { respostaIdx } = req.body;
    const result = await questaoService.verificarResposta(
      req.params.id,
      Number(respostaIdx),
      Questao
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
