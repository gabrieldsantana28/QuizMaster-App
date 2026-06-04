import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as userService from '../user.service.js';
import bcrypt from 'bcryptjs';
import axios from 'axios';

vi.mock('axios');

// ==============================================================
// SUITE 1: Cadastro de Usuário (register)
// ==============================================================
describe('User Service - Cadastro (register)', () => {
  let mockUserModel;

  beforeEach(() => {
    mockUserModel = {
      findOne: vi.fn(),
      create: vi.fn(),
    };
  });

  // Teste 1 - RED: senhas não coincidem
  it('deve lançar erro se as senhas não coincidirem', async () => {
    const data = {
      username: 'gabriel',
      email: 'gabriel@test.com',
      password: '12345678',
      confirmPassword: '87654321',
      fullName: 'Gabriel Teste',
    };

    await expect(userService.register(data, mockUserModel))
      .rejects
      .toThrow('As senhas não coincidem.');
  });

  // Teste 2 - RED: senha curta demais
  it('deve lançar erro se a senha tiver menos de 8 caracteres', async () => {
    const data = {
      username: 'gabriel',
      email: 'gabriel@test.com',
      password: '123',
      confirmPassword: '123',
      fullName: 'Gabriel Teste',
    };

    await expect(userService.register(data, mockUserModel))
      .rejects
      .toThrow('A senha deve ter no mínimo 8 caracteres.');
  });

  // Teste 3 - RED: email ou username já existe
  it('deve lançar erro se o username ou e-mail já estiverem cadastrados', async () => {
    const data = {
      username: 'gabriel',
      email: 'gabriel@test.com',
      password: '12345678',
      confirmPassword: '12345678',
    };

    mockUserModel.findOne.mockResolvedValueOnce({ id: 1 });

    await expect(userService.register(data, mockUserModel))
      .rejects
      .toThrow('Este e-mail ou usuário já está cadastrado.');
  });

  // Teste 4 - GREEN: cadastro bem-sucedido
  it('deve cadastrar o usuário com sucesso e retornar mensagem de confirmação', async () => {
    const data = {
      username: 'gabriel',
      email: 'gabriel@test.com',
      password: '12345678',
      confirmPassword: '12345678',
      fullName: 'Gabriel Teste',
    };

    mockUserModel.findOne.mockResolvedValueOnce(null);
    mockUserModel.create.mockResolvedValueOnce({
      id: 1,
      username: 'gabriel',
      email: 'gabriel@test.com',
      fullName: 'Gabriel Teste',
    });

    const result = await userService.register(data, mockUserModel);

    expect(result.message).toBe('Usuário criado com sucesso!');
    expect(result.user).toHaveProperty('id', 1);
    expect(result.user).toHaveProperty('username', 'gabriel');
    expect(result.user).toHaveProperty('email', 'gabriel@test.com');
  });

  // Teste 5 - GREEN: senha deve ser hasheada (não armazenada em texto puro)
  it('deve criar o usuário com senha hasheada (não em texto puro)', async () => {
    const data = {
      username: 'teste',
      email: 'teste@test.com',
      password: 'senhaSegura123',
      confirmPassword: 'senhaSegura123',
      fullName: 'Teste Hash',
    };

    mockUserModel.findOne.mockResolvedValueOnce(null);
    mockUserModel.create.mockResolvedValueOnce({
      id: 2,
      username: 'teste',
      email: 'teste@test.com',
      fullName: 'Teste Hash',
    });

    await userService.register(data, mockUserModel);

    const chamada = mockUserModel.create.mock.calls[0][0];
    expect(chamada.password).not.toBe('senhaSegura123');
    expect(chamada.password).toMatch(/^\$2b\$/); // formato bcrypt
  });

  // Teste 6 - REFACTOR: campos do usuário retornados não incluem a senha
  it('não deve expor a senha na resposta do cadastro', async () => {
    const data = {
      username: 'seguro',
      email: 'seguro@test.com',
      password: '12345678',
      confirmPassword: '12345678',
    };

    mockUserModel.findOne.mockResolvedValueOnce(null);
    mockUserModel.create.mockResolvedValueOnce({
      id: 3,
      username: 'seguro',
      email: 'seguro@test.com',
      fullName: null,
    });

    const result = await userService.register(data, mockUserModel);

    expect(result.user).not.toHaveProperty('password');
  });
});

// ==============================================================
// SUITE 2: Login de Usuário (login)
// ==============================================================
describe('User Service - Login', () => {
  let mockUserModel;

  beforeEach(() => {
    mockUserModel = {
      findOne: vi.fn(),
    };
  });

  // Teste 7 - GREEN: login bem-sucedido com username
  it('deve fazer login com sucesso usando username', async () => {
    const mockUser = {
      id: 1,
      username: 'paulo',
      email: 'paulo@test.com',
      password: 'hash_fake',
      fullName: 'Paulo Teste',
      profilePicture: null,
    };

    mockUserModel.findOne.mockResolvedValueOnce(mockUser);
    vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

    const result = await userService.login('paulo', 'teste123', mockUserModel);

    expect(result.id).toBe(1);
    expect(result.username).toBe('paulo');
    expect(result).toHaveProperty('email', 'paulo@test.com');
  });

  // Teste 8 - GREEN: login bem-sucedido com email
  it('deve fazer login com sucesso usando e-mail', async () => {
    const mockUser = {
      id: 2,
      username: 'maria',
      email: 'maria@test.com',
      password: 'hash_fake',
      fullName: 'Maria Teste',
      profilePicture: null,
    };

    mockUserModel.findOne.mockResolvedValueOnce(mockUser);
    vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

    const result = await userService.login('maria@test.com', 'senha123', mockUserModel);

    expect(result.username).toBe('maria');
    expect(result.email).toBe('maria@test.com');
  });

  // Teste 9 - RED: usuário não encontrado
  it('deve lançar erro se o usuário não for encontrado', async () => {
    mockUserModel.findOne.mockResolvedValueOnce(null);

    await expect(userService.login('inexistente', 'senha123', mockUserModel))
      .rejects
      .toThrow('E-mail/Usuário ou senha incorretos.');
  });

  // Teste 10 - RED: senha incorreta
  it('deve lançar erro se a senha estiver incorreta', async () => {
    const mockUser = {
      id: 1,
      username: 'paulo',
      email: 'paulo@test.com',
      password: 'hash_fake',
      fullName: 'Paulo Teste',
    };

    mockUserModel.findOne.mockResolvedValueOnce(mockUser);
    vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

    await expect(userService.login('paulo', 'senha_errada', mockUserModel))
      .rejects
      .toThrow('E-mail/Usuário ou senha incorretos.');
  });

  // Teste 11 - REFACTOR: login não deve expor a senha na resposta
  it('não deve expor a senha do usuário na resposta do login', async () => {
    const mockUser = {
      id: 1,
      username: 'carlos',
      email: 'carlos@test.com',
      password: 'hash_secreto',
      fullName: 'Carlos Teste',
      profilePicture: null,
    };

    mockUserModel.findOne.mockResolvedValueOnce(mockUser);
    vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

    const result = await userService.login('carlos', 'senha123', mockUserModel);

    expect(result).not.toHaveProperty('password');
  });
});

// ==============================================================
// SUITE 3: Perfil de Usuário (getProfile)
// ==============================================================
describe('User Service - Perfil (getProfile)', () => {
  let mockUserModel;

  beforeEach(() => {
    mockUserModel = {
      findByPk: vi.fn(),
    };
  });

  // Teste 12 - GREEN: busca perfil com sucesso
  it('deve retornar o perfil do usuário pelo ID', async () => {
    const mockUser = {
      id: 5,
      username: 'ana',
      email: 'ana@test.com',
      fullName: 'Ana Souza',
      bio: 'Amo quizzes!',
      profilePicture: null,
    };

    mockUserModel.findByPk.mockResolvedValueOnce(mockUser);

    const result = await userService.getProfile(5, mockUserModel);

    expect(result.id).toBe(5);
    expect(result.username).toBe('ana');
    expect(result).toHaveProperty('bio', 'Amo quizzes!');
  });

  // Teste 13 - RED: usuário não existe
  it('deve lançar erro se o usuário não for encontrado pelo ID', async () => {
    mockUserModel.findByPk.mockResolvedValueOnce(null);

    await expect(userService.getProfile(999, mockUserModel))
      .rejects
      .toThrow('Usuário não encontrado.');
  });
});

// ==============================================================
// SUITE 4: API de Validação de E-mail
// ==============================================================
describe('User Service - API de validação de e-mail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar true quando a API externa responde que o email é válido', async () => {
    const mockEmail = 'aluno@faculdade.com.br';
    
    axios.get.mockResolvedValue({
      data: {
        email: mockEmail,
        deliverability: 'DELIVERABLE',
        is_valid_format: { value: true }
      }
    });

    const result = await userService.validateEmailExternalAPI(mockEmail);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(mockEmail));
    expect(result).toBe(true);
  });

  it('deve retornar false quando a API externa responde que o email é inválido', async () => {
    const mockEmail = 'email_falso@dominio_inexistente.com';
    
    axios.get.mockResolvedValue({
      data: {
        email: mockEmail,
        deliverability: 'UNDELIVERABLE',
        is_valid_format: { value: false }
      }
    });

    const result = await userService.validateEmailExternalAPI(mockEmail);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });

  it('deve lançar um erro quando a API externa estiver fora do ar', async () => {
    const mockEmail = 'teste@teste.com';
    
    axios.get.mockRejectedValue(new Error('Network Error'));

    await expect(userService.validateEmailExternalAPI(mockEmail)).rejects.toThrow('Erro ao comunicar com a API de validação de e-mail');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});
