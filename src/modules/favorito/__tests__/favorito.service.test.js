import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as favoritoService from '../favorito.service.js';

describe('Favorito Service', () => {
  let mockFavoritoModel;
  beforeEach(() => {
    mockFavoritoModel = { findOne: vi.fn(), create: vi.fn(), findAll: vi.fn() };
  });

  it('deve lançar erro se userId não for fornecido', async () => {
    await expect(favoritoService.favoritarQuiz(null, 1, mockFavoritoModel))
      .rejects.toThrow('Usuário e quiz são obrigatórios.');
  });

  it('deve lançar erro se quiz já estiver favoritado', async () => {
    mockFavoritoModel.findOne.mockResolvedValueOnce({ id: 1 });
    await expect(favoritoService.favoritarQuiz(1, 2, mockFavoritoModel))
      .rejects.toThrow('Quiz já está nos favoritos.');
  });

  it('deve favoritar quiz com sucesso', async () => {
    mockFavoritoModel.findOne.mockResolvedValueOnce(null);
    mockFavoritoModel.create.mockResolvedValueOnce({ id: 3, userId: 1, quizId: 2 });
    const result = await favoritoService.favoritarQuiz(1, 2, mockFavoritoModel);
    expect(result.message).toBe('Quiz adicionado aos favoritos!');
  });

  it('deve lançar erro ao desfavoritar quiz que não está nos favoritos', async () => {
    mockFavoritoModel.findOne.mockResolvedValueOnce(null);
    await expect(favoritoService.desfavoritarQuiz(1, 99, mockFavoritoModel))
      .rejects.toThrow('Este quiz não está nos seus favoritos.');
  });

  it('deve desfavoritar quiz com sucesso', async () => {
    const mockFav = { id: 1, destroy: vi.fn() };
    mockFavoritoModel.findOne.mockResolvedValueOnce(mockFav);
    const result = await favoritoService.desfavoritarQuiz(1, 2, mockFavoritoModel);
    expect(result.message).toBe('Quiz removido dos favoritos.');
    expect(mockFav.destroy).toHaveBeenCalled();
  });

  it('deve listar favoritos do usuário', async () => {
    mockFavoritoModel.findAll.mockResolvedValueOnce([{ id: 1, quizId: 5 }, { id: 2, quizId: 8 }]);
    const result = await favoritoService.listarFavoritos(1, mockFavoritoModel);
    expect(result).toHaveLength(2);
  });
});