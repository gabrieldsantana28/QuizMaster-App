import * as quizService from './quiz.service.js';
import Quiz from './quiz.model.js';
import Avaliacao from './avaliacao.model.js';
import Tema from '../tema/tema.model.js';

export const listar = async (req, res) => {
  try {
    const { temaId, dificuldade } = req.query;
    const temas = await Tema.findAll({ order: [['nome', 'ASC']] });
    const quizzes = await quizService.listarQuizzes({ temaId, dificuldade }, Quiz);
    res.render('feed', { title: 'Explorar Quizzes', quizzes, temas, filtros: req.query });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/');
  }
};

export const detalhe = async (req, res) => {
  try {
    const quiz = await quizService.buscarQuizPorId(req.params.id, Quiz);
    const avaliacoes = await Avaliacao.findAll({ where: { quizId: quiz.id }, limit: 10 });
    res.render('quiz-detalhe', { title: quiz.titulo, quiz, avaliacoes });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/feed');
  }
};

export const formCriar = async (req, res) => {
  const temas = await Tema.findAll({ order: [['nome', 'ASC']] });
  res.render('quiz-form', { title: 'Criar Quiz', temas, quiz: null, errors: [] });
};

export const criar = async (req, res) => {
  try {
    const autorId = req.session.user.id;
    await quizService.criarQuiz({ ...req.body, autorId }, Quiz);
    req.flash('success', 'Quiz criado com sucesso!');
    res.redirect('/feed');
  } catch (error) {
    const temas = await Tema.findAll();
    res.render('quiz-form', { title: 'Criar Quiz', temas, quiz: req.body, errors: [error.message] });
  }
};

export const avaliar = async (req, res) => {
  try {
    const userId = req.session.user.id;
    await quizService.avaliarQuiz({ ...req.body, userId, quizId: req.params.id }, Avaliacao);
    req.flash('success', 'Avaliação registrada!');
  } catch (error) {
    req.flash('error', error.message);
  }
  res.redirect(`/quiz/${req.params.id}`);
};