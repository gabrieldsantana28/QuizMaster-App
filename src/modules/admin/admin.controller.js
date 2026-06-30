import Quiz from '../quiz/quiz.model.js';
import User from '../user/user.model.js';
import Tema from '../tema/tema.model.js';

export const dashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalQuizzes = await Quiz.count({ where: { ativo: true } });
    const totalTemas = await Tema.count();
    const recentUsers = await User.findAll({
      limit: 5, order: [['createdAt', 'DESC']],
      attributes: ['id','username','email','createdAt']
    });
    res.render('admin/dashboard', {
      title: 'Admin — Dashboard',
      stats: { totalUsers, totalQuizzes, totalTemas },
      recentUsers
    });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/feed');
  }
};

export const gerenciarUsuarios = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id','username','email','fullName','createdAt'],
      order: [['createdAt','DESC']]
    });
    res.render('admin/usuarios', { title: 'Admin — Usuários', users });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/admin');
  }
};

export const gerenciarQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({ order: [['createdAt','DESC']] });
    res.render('admin/quizzes', { title: 'Admin — Quizzes', quizzes });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/admin');
  }
};

export const gerenciarTemas = async (req, res) => {
  try {
    const temas = await Tema.findAll({ order: [['nome','ASC']] });
    res.render('admin/temas', { title: 'Admin — Temas', temas });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/admin');
  }
};

export const criarTema = async (req, res) => {
  try {
    const { nome, descricao, icone } = req.body;
    await Tema.create({ nome, descricao, icone: icone || '📚' });
    req.flash('success', 'Tema criado com sucesso!');
  } catch (error) {
    req.flash('error', 'Erro ao criar tema: ' + error.message);
  }
  res.redirect('/admin/temas');
};

export const ativarDesativarQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (quiz) {
      await quiz.update({ ativo: !quiz.ativo });
      req.flash('success', 'Status do quiz atualizado.');
    }
  } catch (error) {
    req.flash('error', error.message);
  }
  res.redirect('/admin/quizzes');
};