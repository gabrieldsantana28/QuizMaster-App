import * as favoritoService from './favorito.service.js';
import Favorito from './favorito.model.js';

export const favoritar = async (req, res) => {
  try {
    await favoritoService.favoritarQuiz(req.session.user.id, req.params.quizId, Favorito);
    req.flash('success', 'Quiz adicionado aos favoritos!');
  } catch (error) {
    req.flash('error', error.message);
  }
  res.redirect('back');
};

export const desfavoritar = async (req, res) => {
  try {
    await favoritoService.desfavoritarQuiz(req.session.user.id, req.params.quizId, Favorito);
    req.flash('success', 'Quiz removido dos favoritos.');
  } catch (error) {
    req.flash('error', error.message);
  }
  res.redirect('back');
};

export const listar = async (req, res) => {
  try {
    const favoritos = await favoritoService.listarFavoritos(req.session.user.id, Favorito);
    res.render('favoritos', { title: 'Meus Favoritos', favoritos });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/feed');
  }
};