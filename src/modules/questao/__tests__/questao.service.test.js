import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as questaoService from '../questao.service.js';

// =============================================================
// SUITE 1 — criarQuestao
// Ciclo Red-Green-Refactor: cada bloco começa com o teste que
// falha (Red), depois o service o faz passar (Green).
// =============================================================
describe('Questao Service — criarQuestao', () => {
  let mockQuestaoModel;

  const alternativasValidas = ['Paris', 'Londres', 'Roma', 'Berlim'];
  const dadosValidos = {
    enunciado: 'Qual é a capital da França?',
    quizId: 1,
    autorId: 2,
    alternativas: alternativasValidas,
    alternativaCorreta: 0,
  };

  beforeEach(() => {
    mockQuestaoModel = { create: vi.fn() };
  });

  // Teste 1 — RED: quizId ausente
  it('deve lançar erro se quizId não for fornecido', async () => {
    const data = { ...dadosValidos, quizId: undefined };
    await expect(questaoService.criarQuestao(data, mockQuestaoModel))
      .rejects.toThrow('A questão deve pertencer a um quiz.');
  });

  // Teste 2 — RED: autorId ausente
  it('deve lançar erro se autorId não for fornecido', async () => {
    const data = { ...dadosValidos, autorId: undefined };
    await expect(questaoService.criarQuestao(data, mockQuestaoModel))
      .rejects.toThrow('A questão deve ter um autor.');
  });

  // Teste 3 — RED: enunciado curto demais
  it('deve lançar erro se enunciado tiver menos de 10 caracteres', async () => {
    const data = { ...dadosValidos, enunciado: 'Curto?' };
    await expect(questaoService.criarQuestao(data, mockQuestaoModel))
      .rejects.toThrow('O enunciado deve ter no mínimo 10 caracteres.');
  });

  // Teste 4 — RED: enunciado vazio/nulo
  it('deve lançar erro se enunciado for nulo', async () => {
    const data = { ...dadosValidos, enunciado: null };
    await expect(questaoService.criarQuestao(data, mockQuestaoModel))
      .rejects.toThrow('O enunciado deve ter no mínimo 10 caracteres.');
  });

  // Teste 5 — RED: menos de 2 alternativas
  it('deve lançar erro se houver menos de 2 alternativas', async () => {
    const data = { ...dadosValidos, alternativas: ['Só uma'] };
    await expect(questaoService.criarQuestao(data, mockQuestaoModel))
      .rejects.toThrow('A questão deve ter no mínimo 2 alternativas.');
  });

  // Teste 6 — RED: mais de 5 alternativas
  it('deve lançar erro se houver mais de 5 alternativas', async () => {
    const data = { ...dadosValidos, alternativas: ['A', 'B', 'C', 'D', 'E', 'F'] };
    await expect(questaoService.criarQuestao(data, mockQuestaoModel))
      .rejects.toThrow('A questão pode ter no máximo 5 alternativas.');
  });

  // Teste 7 — RED: alternativaCorreta não informada
  it('deve lançar erro se alternativaCorreta não for informada', async () => {
    const data = { ...dadosValidos, alternativaCorreta: undefined };
    await expect(questaoService.criarQuestao(data, mockQuestaoModel))
      .rejects.toThrow('É necessário indicar a alternativa correta.');
  });

  // Teste 8 — RED: índice de alternativa correta fora do range
  it('deve lançar erro se o índice da alternativa correta for inválido', async () => {
    const data = { ...dadosValidos, alternativaCorreta: 99 };
    await expect(questaoService.criarQuestao(data, mockQuestaoModel))
      .rejects.toThrow('O índice da alternativa correta é inválido.');
  });

  // Teste 9 — GREEN: criação bem-sucedida
  it('deve criar questão com sucesso e retornar mensagem', async () => {
    mockQuestaoModel.create.mockResolvedValueOnce({
      id: 1,
      ...dadosValidos,
      alternativas: JSON.stringify(dadosValidos.alternativas),
    });

    const result = await questaoService.criarQuestao(dadosValidos, mockQuestaoModel);

    expect(result.message).toBe('Questão criada com sucesso!');
    expect(result.questao).toHaveProperty('id', 1);
  });

  // Teste 10 — GREEN: alternativas são serializadas como JSON
  it('deve serializar alternativas como JSON ao criar', async () => {
    mockQuestaoModel.create.mockResolvedValueOnce({ id: 2 });

    await questaoService.criarQuestao(dadosValidos, mockQuestaoModel);

    const chamada = mockQuestaoModel.create.mock.calls[0][0];
    expect(chamada.alternativas).toBe(JSON.stringify(alternativasValidas));
  });

  // Teste 11 — REFACTOR: dica padrão é null se não fornecida
  it('deve usar null como dica padrão quando não fornecida', async () => {
    mockQuestaoModel.create.mockResolvedValueOnce({ id: 3 });

    await questaoService.criarQuestao(dadosValidos, mockQuestaoModel);

    const chamada = mockQuestaoModel.create.mock.calls[0][0];
    expect(chamada.dica).toBeNull();
  });

  // Teste 12 — REFACTOR: enunciado é trimado
  it('deve remover espaços extras do enunciado antes de salvar', async () => {
    mockQuestaoModel.create.mockResolvedValueOnce({ id: 4 });
    const data = { ...dadosValidos, enunciado: '   Qual é a capital da França?   ' };

    await questaoService.criarQuestao(data, mockQuestaoModel);

    const chamada = mockQuestaoModel.create.mock.calls[0][0];
    expect(chamada.enunciado).toBe('Qual é a capital da França?');
  });
});

// =============================================================
// SUITE 2 — listarQuestoesPorQuiz
// =============================================================
describe('Questao Service — listarQuestoesPorQuiz', () => {
  let mockQuestaoModel;

  beforeEach(() => {
    mockQuestaoModel = { findAll: vi.fn() };
  });

  // Teste 13 — RED: quizId ausente
  it('deve lançar erro se quizId não for fornecido', async () => {
    await expect(questaoService.listarQuestoesPorQuiz(null, mockQuestaoModel))
      .rejects.toThrow('O ID do quiz é obrigatório.');
  });

  // Teste 14 — GREEN: retorna lista de questões
  it('deve retornar a lista de questões do quiz', async () => {
    mockQuestaoModel.findAll.mockResolvedValueOnce([
      { id: 1, enunciado: 'Questão 1' },
      { id: 2, enunciado: 'Questão 2' },
    ]);

    const result = await questaoService.listarQuestoesPorQuiz(5, mockQuestaoModel);

    expect(result).toHaveLength(2);
    expect(mockQuestaoModel.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { quizId: 5 } })
    );
  });

  // Teste 15 — GREEN: retorna array vazio se não há questões
  it('deve retornar array vazio se o quiz não tiver questões', async () => {
    mockQuestaoModel.findAll.mockResolvedValueOnce([]);

    const result = await questaoService.listarQuestoesPorQuiz(99, mockQuestaoModel);

    expect(result).toEqual([]);
  });
});

// =============================================================
// SUITE 3 — buscarQuestaoPorId
// =============================================================
describe('Questao Service — buscarQuestaoPorId', () => {
  let mockQuestaoModel;

  beforeEach(() => {
    mockQuestaoModel = { findByPk: vi.fn() };
  });

  // Teste 16 — GREEN: encontra questão com sucesso
  it('deve retornar a questão pelo ID', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce({ id: 7, enunciado: 'Qual o maior planeta?' });

    const result = await questaoService.buscarQuestaoPorId(7, mockQuestaoModel);

    expect(result.id).toBe(7);
    expect(result).toHaveProperty('enunciado', 'Qual o maior planeta?');
  });

  // Teste 17 — RED: questão não existe
  it('deve lançar erro se a questão não for encontrada', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(null);

    await expect(questaoService.buscarQuestaoPorId(999, mockQuestaoModel))
      .rejects.toThrow('Questão não encontrada.');
  });
});

// =============================================================
// SUITE 4 — atualizarQuestao
// =============================================================
describe('Questao Service — atualizarQuestao', () => {
  let mockQuestaoModel;
  let mockQuestao;

  beforeEach(() => {
    mockQuestao = {
      id: 1,
      autorId: 10,
      enunciado: 'Pergunta original longa o suficiente',
      alternativas: JSON.stringify(['A', 'B', 'C']),
      alternativaCorreta: 0,
      dica: null,
      update: vi.fn().mockResolvedValue(true),
    };
    mockQuestaoModel = { findByPk: vi.fn() };
  });

  // Teste 18 — RED: questão não existe
  it('deve lançar erro se a questão não existir', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(null);

    await expect(questaoService.atualizarQuestao(99, {}, 10, mockQuestaoModel))
      .rejects.toThrow('Questão não encontrada.');
  });

  // Teste 19 — RED: autor não tem permissão
  it('deve lançar erro se o autor não tiver permissão para editar', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestao);

    await expect(questaoService.atualizarQuestao(1, {}, 999, mockQuestaoModel))
      .rejects.toThrow('Você não tem permissão para editar esta questão.');
  });

  // Teste 20 — GREEN: atualização com sucesso
  it('deve atualizar a questão com sucesso', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestao);

    const result = await questaoService.atualizarQuestao(
      1,
      { enunciado: 'Novo enunciado bem longo aqui' },
      10,
      mockQuestaoModel
    );

    expect(result.message).toBe('Questão atualizada com sucesso!');
    expect(mockQuestao.update).toHaveBeenCalledTimes(1);
  });

  // Teste 20b — RED: enunciado curto ao atualizar
  it('deve lançar erro se o novo enunciado for curto demais ao atualizar', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestao);

    await expect(questaoService.atualizarQuestao(1, { enunciado: 'Curto' }, 10, mockQuestaoModel))
      .rejects.toThrow('O enunciado deve ter no mínimo 10 caracteres.');
  });

  // Teste 20c — RED: alternativas inválidas ao atualizar (menos de 2)
  it('deve lançar erro se as alternativas tiverem menos de 2 itens ao atualizar', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestao);

    await expect(questaoService.atualizarQuestao(
      1, { alternativas: ['Só uma'], alternativaCorreta: 0 }, 10, mockQuestaoModel
    )).rejects.toThrow('A questão deve ter no mínimo 2 alternativas.');
  });

  // Teste 20d — RED: mais de 5 alternativas ao atualizar
  it('deve lançar erro se houver mais de 5 alternativas ao atualizar', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestao);

    await expect(questaoService.atualizarQuestao(
      1, { alternativas: ['A','B','C','D','E','F'], alternativaCorreta: 0 }, 10, mockQuestaoModel
    )).rejects.toThrow('A questão pode ter no máximo 5 alternativas.');
  });

  // Teste 20e — RED: índice de alternativa correta inválido ao atualizar
  it('deve lançar erro se o índice da alternativa correta for inválido ao atualizar', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestao);

    await expect(questaoService.atualizarQuestao(
      1, { alternativas: ['A','B','C'], alternativaCorreta: undefined }, 10, mockQuestaoModel
    )).rejects.toThrow('O índice da alternativa correta é inválido.');
  });
});

// =============================================================
// SUITE 5 — excluirQuestao
// =============================================================
describe('Questao Service — excluirQuestao', () => {
  let mockQuestaoModel;

  beforeEach(() => {
    mockQuestaoModel = { findByPk: vi.fn() };
  });

  // Teste 21 — RED: questão não existe
  it('deve lançar erro ao excluir questão inexistente', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(null);

    await expect(questaoService.excluirQuestao(1, 10, mockQuestaoModel))
      .rejects.toThrow('Questão não encontrada.');
  });

  // Teste 22 — RED: sem permissão para excluir
  it('deve lançar erro se o autor não tiver permissão para excluir', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce({ id: 1, autorId: 5, destroy: vi.fn() });

    await expect(questaoService.excluirQuestao(1, 99, mockQuestaoModel))
      .rejects.toThrow('Você não tem permissão para excluir esta questão.');
  });

  // Teste 23 — GREEN: exclusão bem-sucedida
  it('deve excluir a questão com sucesso', async () => {
    const mockQuestao = { id: 1, autorId: 10, destroy: vi.fn().mockResolvedValue(true) };
    mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestao);

    const result = await questaoService.excluirQuestao(1, 10, mockQuestaoModel);

    expect(result.message).toBe('Questão excluída com sucesso.');
    expect(mockQuestao.destroy).toHaveBeenCalledTimes(1);
  });
});

// =============================================================
// SUITE 6 — verificarResposta
// =============================================================
describe('Questao Service — verificarResposta', () => {
  let mockQuestaoModel;

  const mockQuestaoBase = {
    id: 1,
    enunciado: 'Qual é a capital da França?',
    alternativas: JSON.stringify(['Paris', 'Londres', 'Roma']),
    alternativaCorreta: 0,
    dica: 'Cidade Luz',
  };

  beforeEach(() => {
    mockQuestaoModel = { findByPk: vi.fn() };
  });

  // Teste 24 — RED: questão não existe
  it('deve lançar erro se a questão não existir', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(null);

    await expect(questaoService.verificarResposta(99, 0, mockQuestaoModel))
      .rejects.toThrow('Questão não encontrada.');
  });

  // Teste 25 — RED: resposta com índice inválido
  it('deve lançar erro se o índice da resposta for inválido', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestaoBase);

    await expect(questaoService.verificarResposta(1, 99, mockQuestaoModel))
      .rejects.toThrow('Resposta inválida.');
  });

  // Teste 26 — GREEN: resposta correta
  it('deve retornar correta=true quando a resposta for correta', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestaoBase);

    const result = await questaoService.verificarResposta(1, 0, mockQuestaoModel);

    expect(result.correta).toBe(true);
    expect(result.dica).toBeNull();
  });

  // Teste 27 — GREEN: resposta incorreta retorna dica
  it('deve retornar correta=false e a dica quando a resposta for incorreta', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestaoBase);

    const result = await questaoService.verificarResposta(1, 2, mockQuestaoModel);

    expect(result.correta).toBe(false);
    expect(result.dica).toBe('Cidade Luz');
    expect(result.alternativaCorreta).toBe(0);
  });

  // Teste 28 — REFACTOR: resposta negativa é inválida
  it('deve lançar erro se o índice de resposta for negativo', async () => {
    mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestaoBase);

    await expect(questaoService.verificarResposta(1, -1, mockQuestaoModel))
      .rejects.toThrow('Resposta inválida.');
  });
});
