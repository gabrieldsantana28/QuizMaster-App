export const criarQuiz = async (data, QuizModel) => {
  const { titulo, descricao, temaId, autorId, dificuldade = 'medio' } = data;

  if (!titulo || titulo.trim().length < 3)
    throw new Error('O título do quiz deve ter no mínimo 3 caracteres.');
  if (!temaId)
    throw new Error('O quiz deve pertencer a um tema.');
  if (!autorId)
    throw new Error('O quiz deve ter um autor.');

  const quiz = await QuizModel.create({ titulo: titulo.trim(), descricao, temaId, autorId, dificuldade });
  return { message: 'Quiz criado com sucesso!', quiz };
};

export const listarQuizzes = async (filtros = {}, QuizModel) => {
  const where = { ativo: true };
  if (filtros.temaId) where.temaId = filtros.temaId;
  if (filtros.dificuldade) where.dificuldade = filtros.dificuldade;
  if (filtros.autorId) where.autorId = filtros.autorId;
  return await QuizModel.findAll({ where, order: [['createdAt', 'DESC']] });
};

export const buscarQuizPorId = async (id, QuizModel) => {
  const quiz = await QuizModel.findByPk(id);
  if (!quiz) throw new Error('Quiz não encontrado.');
  if (!quiz.ativo) throw new Error('Este quiz não está mais disponível.');
  return quiz;
};

export const atualizarQuiz = async (id, data, autorId, QuizModel) => {
  const quiz = await QuizModel.findByPk(id);
  if (!quiz) throw new Error('Quiz não encontrado.');
  if (quiz.autorId !== autorId) throw new Error('Você não tem permissão para editar este quiz.');

  const { titulo, descricao, dificuldade } = data;
  if (titulo && titulo.trim().length < 3)
    throw new Error('O título do quiz deve ter no mínimo 3 caracteres.');

  await quiz.update({
    titulo: titulo?.trim() ?? quiz.titulo,
    descricao: descricao ?? quiz.descricao,
    dificuldade: dificuldade ?? quiz.dificuldade
  });
  return { message: 'Quiz atualizado com sucesso!', quiz };
};

export const excluirQuiz = async (id, autorId, QuizModel) => {
  const quiz = await QuizModel.findByPk(id);
  if (!quiz) throw new Error('Quiz não encontrado.');
  if (quiz.autorId !== autorId) throw new Error('Você não tem permissão para excluir este quiz.');
  await quiz.update({ ativo: false });
  return { message: 'Quiz excluído com sucesso.' };
};

export const avaliarQuiz = async (data, AvaliacaoModel) => {
  const { userId, quizId, nota, comentario } = data;
  if (!nota || nota < 1 || nota > 5) throw new Error('A nota deve ser entre 1 e 5.');
  const jaAvaliou = await AvaliacaoModel.findOne({ where: { userId, quizId } });
  if (jaAvaliou) throw new Error('Você já avaliou este quiz.');
  const avaliacao = await AvaliacaoModel.create({ userId, quizId, nota, comentario });
  return { message: 'Avaliação registrada com sucesso!', avaliacao };
};