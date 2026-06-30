import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as quizService from '../quiz.service.js';

describe('Quiz Service - Criação (criarQuiz)', () => {
  let mockQuizModel;
  beforeEach(() => { mockQuizModel = { create: vi.fn() }; });

  it('deve lançar erro se título tiver menos de 3 caracteres', async () => {
    await expect(quizService.criarQuiz({ titulo: 'JS', temaId: 1, autorId: 1 }, mockQuizModel))
      .rejects.toThrow('O título do quiz deve ter no mínimo 3 caracteres.');
  });

  it('deve lançar erro se temaId não for fornecido', async () => {
    await expect(quizService.criarQuiz({ titulo: 'Quiz válido', autorId: 1 }, mockQuizModel))
      .rejects.toThrow('O quiz deve pertencer a um tema.');
  });

  it('deve lançar erro se autorId não for fornecido', async () => {
    await expect(quizService.criarQuiz({ titulo: 'Quiz válido', temaId: 1 }, mockQuizModel))
      .rejects.toThrow('O quiz deve ter um autor.');
  });

  it('deve criar quiz com sucesso', async () => {
    mockQuizModel.create.mockResolvedValueOnce({ id: 1, titulo: 'JavaScript Básico', temaId: 1, autorId: 2 });
    const result = await quizService.criarQuiz({ titulo: 'JavaScript Básico', temaId: 1, autorId: 2 }, mockQuizModel);
    expect(result.message).toBe('Quiz criado com sucesso!');
    expect(result.quiz).toHaveProperty('id', 1);
  });

  it('deve criar quiz com dificuldade padrão "medio"', async () => {
    mockQuizModel.create.mockResolvedValueOnce({ id: 2 });
    await quizService.criarQuiz({ titulo: 'React Hooks', temaId: 1, autorId: 2 }, mockQuizModel);
    expect(mockQuizModel.create.mock.calls[0][0].dificuldade).toBe('medio');
  });
});

describe('Quiz Service - Busca (buscarQuizPorId)', () => {
  let mockQuizModel;
  beforeEach(() => { mockQuizModel = { findByPk: vi.fn() }; });

  it('deve retornar quiz ativo por ID', async () => {
    mockQuizModel.findByPk.mockResolvedValueOnce({ id: 3, titulo: 'Node.js', ativo: true });
    const result = await quizService.buscarQuizPorId(3, mockQuizModel);
    expect(result.titulo).toBe('Node.js');
  });

  it('deve lançar erro se quiz não for encontrado', async () => {
    mockQuizModel.findByPk.mockResolvedValueOnce(null);
    await expect(quizService.buscarQuizPorId(999, mockQuizModel)).rejects.toThrow('Quiz não encontrado.');
  });

  it('deve lançar erro se quiz estiver inativo', async () => {
    mockQuizModel.findByPk.mockResolvedValueOnce({ id: 4, titulo: 'Antigo', ativo: false });
    await expect(quizService.buscarQuizPorId(4, mockQuizModel)).rejects.toThrow('Este quiz não está mais disponível.');
  });
});

describe('Quiz Service - Avaliação (avaliarQuiz)', () => {
  let mockAvaliacaoModel;
  beforeEach(() => { mockAvaliacaoModel = { findOne: vi.fn(), create: vi.fn() }; });

  it('deve lançar erro se nota for menor que 1', async () => {
    await expect(quizService.avaliarQuiz({ userId: 1, quizId: 1, nota: 0 }, mockAvaliacaoModel))
      .rejects.toThrow('A nota deve ser entre 1 e 5.');
  });

  it('deve lançar erro se nota for maior que 5', async () => {
    await expect(quizService.avaliarQuiz({ userId: 1, quizId: 1, nota: 6 }, mockAvaliacaoModel))
      .rejects.toThrow('A nota deve ser entre 1 e 5.');
  });

  it('deve lançar erro se usuário já avaliou o quiz', async () => {
    mockAvaliacaoModel.findOne.mockResolvedValueOnce({ id: 1 });
    await expect(quizService.avaliarQuiz({ userId: 1, quizId: 1, nota: 4 }, mockAvaliacaoModel))
      .rejects.toThrow('Você já avaliou este quiz.');
  });

  it('deve registrar avaliação com sucesso', async () => {
    mockAvaliacaoModel.findOne.mockResolvedValueOnce(null);
    mockAvaliacaoModel.create.mockResolvedValueOnce({ id: 5, userId: 1, quizId: 2, nota: 5 });
    const result = await quizService.avaliarQuiz({ userId: 1, quizId: 2, nota: 5 }, mockAvaliacaoModel);
    expect(result.message).toBe('Avaliação registrada com sucesso!');
  });
});

describe('Quiz Service - Listagem e Edição', () => {
  let mockQuizModel;
  beforeEach(() => { mockQuizModel = { findAll: vi.fn(), findByPk: vi.fn() }; });

  it('deve listar quizzes ativos sem filtros', async () => {
    mockQuizModel.findAll.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
    const result = await quizService.listarQuizzes({}, mockQuizModel);
    expect(result).toHaveLength(2);
  });

  it('deve filtrar quizzes por temaId', async () => {
    mockQuizModel.findAll.mockResolvedValueOnce([{ id: 1, temaId: 3 }]);
    await quizService.listarQuizzes({ temaId: 3 }, mockQuizModel);
    expect(mockQuizModel.findAll.mock.calls[0][0].where).toHaveProperty('temaId', 3);
  });

  it('deve lançar erro ao atualizar quiz de outro autor', async () => {
    mockQuizModel.findByPk.mockResolvedValueOnce({ id: 1, autorId: 99, update: vi.fn() });
    await expect(quizService.atualizarQuiz(1, { titulo: 'Novo' }, 1, mockQuizModel))
      .rejects.toThrow('Você não tem permissão para editar este quiz.');
  });

  it('deve atualizar quiz com sucesso', async () => {
    const mockQuiz = { id: 1, autorId: 1, titulo: 'Antigo', descricao: '', dificuldade: 'facil', update: vi.fn().mockResolvedValueOnce(true) };
    mockQuizModel.findByPk.mockResolvedValueOnce(mockQuiz);
    const result = await quizService.atualizarQuiz(1, { titulo: 'Novo Título' }, 1, mockQuizModel);
    expect(result.message).toBe('Quiz atualizado com sucesso!');
  });

  it('deve excluir (inativar) quiz com sucesso', async () => {
    const mockQuiz = { id: 1, autorId: 2, update: vi.fn().mockResolvedValueOnce(true) };
    mockQuizModel.findByPk.mockResolvedValueOnce(mockQuiz);
    const result = await quizService.excluirQuiz(1, 2, mockQuizModel);
    expect(result.message).toBe('Quiz excluído com sucesso.');
  });

  it('deve lançar erro ao excluir quiz de outro autor', async () => {
    mockQuizModel.findByPk.mockResolvedValueOnce({ id: 1, autorId: 5, update: vi.fn() });
    await expect(quizService.excluirQuiz(1, 1, mockQuizModel))
      .rejects.toThrow('Você não tem permissão para excluir este quiz.');
  });
});