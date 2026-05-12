import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as userService from '../user.service.js';

describe('User Service - Cadastro', () => {
  let mockUserModel;

  beforeEach(() => {
    mockUserModel = {
      findOne: vi.fn(),
      create: vi.fn()
    };
  });

  it('Red - deve retornar erro se as senhas não coincidirem', async () => {
    const data = {
      username: 'gabriel',
      email: 'gabriel@test.com',
      password: '12345678',
      confirmPassword: '87654321',
      fullName: 'Gabriel Teste'
    };

    await expect(userService.register(data, mockUserModel))
      .rejects
      .toThrow('As senhas não coincidem.');
  });

  it('deve retornar erro se o username ou e-mail já estiverem cadastrados', async () => {
    const data = {
      username: 'gabriel',
      email: 'gabriel@test.com',
      password: '12345678',
      confirmPassword: '12345678'
    };

    mockUserModel.findOne.mockResolvedValueOnce({ id: 1 });

    await expect(userService.register(data, mockUserModel))
      .rejects
      .toThrow('Este e-mail ou usuário já está cadastrado.');
  });
});

// [ADICIONAR]
import bcrypt from 'bcryptjs';
// ... outros testes dentro do 'describe' já existente ...
it('deve fazer login com sucesso usando email ou username', async () => {
const mockUser = {
id: 1,
username: 'paulo',
email: 'paulo@test.com',
password: '$2b$10$6QMW3mEVTc6VIWdxM0j6weRb3FxOcQmpFzBJK.F2Js1ChjZ8sX3Dm', // b
fullName: 'Paulo Teste'
};
mockUserModel.findOne.mockResolvedValueOnce(mockUser);
// Simular bcrypt.compare
vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
const result = await userService.login('paulo', 'teste123', mockUserModel);
expect(result.id).toBe(1);
expect(result.username).toBe('paulo');
});
