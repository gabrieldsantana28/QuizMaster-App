import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as userService from '../user.service.js';
import bcrypt from 'bcryptjs';

// ================================================================
// SUITE 1: Cadastro de Usuário (register)
// ================================================================
describe('User Service - Cadastro (register)', () => {
  let mockUserModel;

  beforeEach(() => {
    mockUserModel = { findOne: vi.fn(), create: vi.fn() };
  });

  it('Teste 01 — RED: deve lançar erro se as senhas não coincidirem', async () => {
    const data = { username: 'gabriel', email: 'gabriel@test.com', password: '12345678', confirmPassword: '87654321' };
    await expect(userService.register(data, mockUserModel)).rejects.toThrow('As senhas não coincidem.');
  });

  it('Teste 02 — RED: deve lançar erro se a senha tiver menos de 8 caracteres', async () => {
    const data = { username: 'gabriel', email: 'gabriel@test.com', password: '123', confirmPassword: '123' };
    await expect(userService.register(data, mockUserModel)).rejects.toThrow('A senha deve ter no mínimo 8 caracteres.');
  });

  it('Teste 03 — RED: deve lançar erro se email ou username já existirem', async () => {
    const data = { username: 'gabriel', email: 'gabriel@test.com', password: '12345678', confirmPassword: '12345678' };
    mockUserModel.findOne.mockResolvedValueOnce({ id: 1 });
    await expect(userService.register(data, mockUserModel)).rejects.toThrow('Este e-mail ou usuário já está cadastrado.');
  });

  it('Teste 04 — GREEN: deve cadastrar com sucesso e retornar mensagem de confirmação', async () => {
    const data = { username: 'gabriel', email: 'gabriel@test.com', password: '12345678', confirmPassword: '12345678', fullName: 'Gabriel Teste' };
    mockUserModel.findOne.mockResolvedValueOnce(null);
    mockUserModel.create.mockResolvedValueOnce({ id: 1, username: 'gabriel', email: 'gabriel@test.com', fullName: 'Gabriel Teste' });
    const result = await userService.register(data, mockUserModel);
    expect(result.message).toBe('Usuário criado com sucesso!');
    expect(result.user).toHaveProperty('id', 1);
    expect(result.user).toHaveProperty('username', 'gabriel');
  });

  it('Teste 05 — GREEN: deve armazenar a senha como hash bcrypt', async () => {
    const data = { username: 'teste', email: 'teste@test.com', password: 'senhaSegura123', confirmPassword: 'senhaSegura123' };
    mockUserModel.findOne.mockResolvedValueOnce(null);
    mockUserModel.create.mockResolvedValueOnce({ id: 2, username: 'teste', email: 'teste@test.com', fullName: null });
    await userService.register(data, mockUserModel);
    const chamada = mockUserModel.create.mock.calls[0][0];
    expect(chamada.password).not.toBe('senhaSegura123');
    expect(chamada.password).toMatch(/^\$2b\$/);
  });

  it('Teste 06 — REFACTOR: não deve expor a senha na resposta do cadastro', async () => {
    const data = { username: 'seguro', email: 'seguro@test.com', password: '12345678', confirmPassword: '12345678' };
    mockUserModel.findOne.mockResolvedValueOnce(null);
    mockUserModel.create.mockResolvedValueOnce({ id: 3, username: 'seguro', email: 'seguro@test.com', fullName: null });
    const result = await userService.register(data, mockUserModel);
    expect(result.user).not.toHaveProperty('password');
  });

  it('Teste 07 — REFACTOR: deve aceitar fullName como opcional (null)', async () => {
    const data = { username: 'semNome', email: 'semNome@test.com', password: '12345678', confirmPassword: '12345678' };
    mockUserModel.findOne.mockResolvedValueOnce(null);
    mockUserModel.create.mockResolvedValueOnce({ id: 4, username: 'semNome', email: 'semNome@test.com', fullName: null });
    const result = await userService.register(data, mockUserModel);
    expect(result.user.fullName).toBeNull();
  });
});

// ================================================================
// SUITE 2: Login de Usuário (login)
// ================================================================
describe('User Service - Login', () => {
  let mockUserModel;

  beforeEach(() => {
    mockUserModel = { findOne: vi.fn() };
  });

  it('Teste 08 — GREEN: deve fazer login com sucesso usando username', async () => {
    const mockUser = { id: 1, username: 'paulo', email: 'paulo@test.com', password: 'hash', fullName: 'Paulo', profilePicture: null };
    mockUserModel.findOne.mockResolvedValueOnce(mockUser);
    vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
    const result = await userService.login('paulo', 'teste123', mockUserModel);
    expect(result.id).toBe(1);
    expect(result.username).toBe('paulo');
  });

  it('Teste 09 — GREEN: deve fazer login com sucesso usando e-mail', async () => {
    const mockUser = { id: 2, username: 'maria', email: 'maria@test.com', password: 'hash', fullName: 'Maria', profilePicture: null };
    mockUserModel.findOne.mockResolvedValueOnce(mockUser);
    vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
    const result = await userService.login('maria@test.com', 'senha123', mockUserModel);
    expect(result.email).toBe('maria@test.com');
  });

  it('Teste 10 — RED: deve lançar erro se o usuário não for encontrado', async () => {
    mockUserModel.findOne.mockResolvedValueOnce(null);
    await expect(userService.login('inexistente', 'senha123', mockUserModel)).rejects.toThrow('E-mail/Usuário ou senha incorretos.');
  });

  it('Teste 11 — RED: deve lançar erro se a senha estiver incorreta', async () => {
    const mockUser = { id: 1, username: 'paulo', email: 'paulo@test.com', password: 'hash', fullName: 'Paulo' };
    mockUserModel.findOne.mockResolvedValueOnce(mockUser);
    vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);
    await expect(userService.login('paulo', 'senha_errada', mockUserModel)).rejects.toThrow('E-mail/Usuário ou senha incorretos.');
  });

  it('Teste 12 — REFACTOR: não deve expor a senha na resposta do login', async () => {
    const mockUser = { id: 1, username: 'carlos', email: 'carlos@test.com', password: 'hash_secreto', fullName: 'Carlos', profilePicture: null };
    mockUserModel.findOne.mockResolvedValueOnce(mockUser);
    vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
    const result = await userService.login('carlos', 'senha123', mockUserModel);
    expect(result).not.toHaveProperty('password');
  });

  it('Teste 13 — GREEN: resultado do login deve conter todos os campos necessários', async () => {
    const mockUser = { id: 5, username: 'lucas', email: 'lucas@test.com', password: 'hash', fullName: 'Lucas Silva', profilePicture: 'foto.png' };
    mockUserModel.findOne.mockResolvedValueOnce(mockUser);
    vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
    const result = await userService.login('lucas', 'senha123', mockUserModel);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('username');
    expect(result).toHaveProperty('email');
    expect(result).toHaveProperty('fullName');
    expect(result).toHaveProperty('profilePicture');
  });
});

// ================================================================
// SUITE 3: Perfil de Usuário (getProfile)
// ================================================================
describe('User Service - Perfil (getProfile)', () => {
  let mockUserModel;

  beforeEach(() => {
    mockUserModel = { findByPk: vi.fn() };
  });

  it('Teste 14 — GREEN: deve retornar o perfil completo do usuário pelo ID', async () => {
    const mockUser = { id: 5, username: 'ana', email: 'ana@test.com', fullName: 'Ana Souza', bio: 'Amo quizzes!', profilePicture: null };
    mockUserModel.findByPk.mockResolvedValueOnce(mockUser);
    const result = await userService.getProfile(5, mockUserModel);
    expect(result.id).toBe(5);
    expect(result.username).toBe('ana');
    expect(result).toHaveProperty('bio', 'Amo quizzes!');
  });

  it('Teste 15 — RED: deve lançar erro se o usuário não for encontrado pelo ID', async () => {
    mockUserModel.findByPk.mockResolvedValueOnce(null);
    await expect(userService.getProfile(999, mockUserModel)).rejects.toThrow('Usuário não encontrado.');
  });

  it('Teste 16 — GREEN: perfil retornado não deve conter o campo password', async () => {
    const mockUser = { id: 7, username: 'test', email: 'test@test.com', fullName: 'Test User', bio: null, profilePicture: 'default.png' };
    mockUserModel.findByPk.mockResolvedValueOnce(mockUser);
    const result = await userService.getProfile(7, mockUserModel);
    expect(result).toHaveProperty('email');
    expect(result).not.toHaveProperty('password');
  });
});