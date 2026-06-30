export const favoritarQuiz = async (userId, quizId, FavoritoModel) => {
  if (!userId || !quizId) throw new Error('Usuário e quiz são obrigatórios.');
  const jaFavoritou = await FavoritoModel.findOne({ where: { userId, quizId } });
  if (jaFavoritou) throw new Error('Quiz já está nos favoritos.');
  const favorito = await FavoritoModel.create({ userId, quizId });
  return { message: 'Quiz adicionado aos favoritos!', favorito };
};

export const desfavoritarQuiz = async (userId, quizId, FavoritoModel) => {
  const favorito = await FavoritoModel.findOne({ where: { userId, quizId } });
  if (!favorito) throw new Error('Este quiz não está nos seus favoritos.');
  await favorito.destroy();
  return { message: 'Quiz removido dos favoritos.' };
};

export const listarFavoritos = async (userId, FavoritoModel) => {
  if (!userId) throw new Error('Usuário obrigatório.');
  return await FavoritoModel.findAll({ where: { userId } });
};