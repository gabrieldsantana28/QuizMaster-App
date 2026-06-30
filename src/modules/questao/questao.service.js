// questao.service.js
// Módulo de Questões do Quiz — implementado com TDD na N3

/**
 * Adiciona uma questão a um quiz existente.
 * RN-Q001: Enunciado deve ter no mínimo 10 caracteres.
 * RN-Q002: Deve haver no mínimo 2 e no máximo 5 alternativas.
 * RN-Q003: Exatamente uma alternativa deve ser marcada como correta.
 * RN-Q004: O quizId e autorId são obrigatórios.
 * RN-Q005: O índice da alternativa correta deve ser válido.
 */
export const criarQuestao = async (data, QuestaoModel) => {
  const { enunciado, quizId, autorId, alternativas, alternativaCorreta, dica = null } = data;

  if (!quizId) throw new Error('A questão deve pertencer a um quiz.');
  if (!autorId) throw new Error('A questão deve ter um autor.');

  if (!enunciado || enunciado.trim().length < 10) {
    throw new Error('O enunciado deve ter no mínimo 10 caracteres.');
  }

  if (!Array.isArray(alternativas) || alternativas.length < 2) {
    throw new Error('A questão deve ter no mínimo 2 alternativas.');
  }

  if (alternativas.length > 5) {
    throw new Error('A questão pode ter no máximo 5 alternativas.');
  }

  if (alternativaCorreta === undefined || alternativaCorreta === null) {
    throw new Error('É necessário indicar a alternativa correta.');
  }

  if (alternativaCorreta < 0 || alternativaCorreta >= alternativas.length) {
    throw new Error('O índice da alternativa correta é inválido.');
  }

  const questao = await QuestaoModel.create({
    enunciado: enunciado.trim(),
    quizId,
    autorId,
    alternativas: JSON.stringify(alternativas),
    alternativaCorreta,
    dica,
  });

  return { message: 'Questão criada com sucesso!', questao };
};

/**
 * Lista todas as questões de um quiz.
 * RN-Q006: O quizId é obrigatório.
 */
export const listarQuestoesPorQuiz = async (quizId, QuestaoModel) => {
  if (!quizId) throw new Error('O ID do quiz é obrigatório.');

  const questoes = await QuestaoModel.findAll({
    where: { quizId },
    order: [['createdAt', 'ASC']],
  });

  return questoes;
};

/**
 * Busca uma questão pelo ID.
 * RN-Q007: Questão deve existir.
 */
export const buscarQuestaoPorId = async (id, QuestaoModel) => {
  const questao = await QuestaoModel.findByPk(id);
  if (!questao) throw new Error('Questão não encontrada.');
  return questao;
};

/**
 * Atualiza uma questão existente.
 * RN-Q008: Apenas o autor pode editar.
 * RN-Q009: Regras de validação do enunciado e alternativas se aplicam.
 */
export const atualizarQuestao = async (id, data, autorId, QuestaoModel) => {
  const questao = await QuestaoModel.findByPk(id);
  if (!questao) throw new Error('Questão não encontrada.');
  if (questao.autorId !== autorId) throw new Error('Você não tem permissão para editar esta questão.');

  const { enunciado, alternativas, alternativaCorreta, dica } = data;

  if (enunciado && enunciado.trim().length < 10) {
    throw new Error('O enunciado deve ter no mínimo 10 caracteres.');
  }

  if (alternativas !== undefined) {
    if (!Array.isArray(alternativas) || alternativas.length < 2) {
      throw new Error('A questão deve ter no mínimo 2 alternativas.');
    }
    if (alternativas.length > 5) {
      throw new Error('A questão pode ter no máximo 5 alternativas.');
    }
    if (alternativaCorreta === undefined || alternativaCorreta < 0 || alternativaCorreta >= alternativas.length) {
      throw new Error('O índice da alternativa correta é inválido.');
    }
  }

  await questao.update({
    enunciado: enunciado ? enunciado.trim() : questao.enunciado,
    alternativas: alternativas ? JSON.stringify(alternativas) : questao.alternativas,
    alternativaCorreta: alternativaCorreta ?? questao.alternativaCorreta,
    dica: dica !== undefined ? dica : questao.dica,
  });

  return { message: 'Questão atualizada com sucesso!', questao };
};

/**
 * Remove uma questão.
 * RN-Q010: Apenas o autor pode remover.
 */
export const excluirQuestao = async (id, autorId, QuestaoModel) => {
  const questao = await QuestaoModel.findByPk(id);
  if (!questao) throw new Error('Questão não encontrada.');
  if (questao.autorId !== autorId) throw new Error('Você não tem permissão para excluir esta questão.');
  await questao.destroy();
  return { message: 'Questão excluída com sucesso.' };
};

/**
 * Verifica se a resposta do usuário está correta.
 * RN-Q011: A resposta deve ser um índice válido.
 */
export const verificarResposta = async (id, respostaIdx, QuestaoModel) => {
  const questao = await QuestaoModel.findByPk(id);
  if (!questao) throw new Error('Questão não encontrada.');

  const alternativas = JSON.parse(questao.alternativas);
  if (respostaIdx === undefined || respostaIdx < 0 || respostaIdx >= alternativas.length) {
    throw new Error('Resposta inválida.');
  }

  const correta = respostaIdx === questao.alternativaCorreta;
  return {
    correta,
    alternativaCorreta: questao.alternativaCorreta,
    dica: correta ? null : questao.dica,
  };
};
