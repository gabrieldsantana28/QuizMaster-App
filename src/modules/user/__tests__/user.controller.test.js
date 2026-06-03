import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../config/database.js', () => ({
  default: { define: vi.fn(() => ({})), authenticate: vi.fn(), sync: vi.fn() }
}));
vi.mock('../user.model.js', () => ({ default: {} }));

import request from 'supertest';
import app from '../../../app.js';
import * as userService from '../user.service.js';

vi.mock('../user.service.js');

describe('User Controller - Register', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deve redirecionar para /login com sucesso após cadastro', async () => {
    userService.register.mockResolvedValueOnce({ message: 'Usuário criado com sucesso!' });
    const response = await request(app).post('/register').send({
      username: 'testuser', email: 'test@test.com', password: '12345678', confirmPassword: '12345678'
    });
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/login');
  });

  it('deve redirecionar para /register em caso de erro', async () => {
    userService.register.mockRejectedValueOnce(new Error('As senhas não coincidem.'));
    const response = await request(app).post('/register').send({
      username: 'testuser', email: 'test@test.com', password: '12345678', confirmPassword: 'wrong'
    });
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/register');
  });
});

describe('User Controller - Login', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deve redirecionar para /feed após login com sucesso', async () => {
    userService.login.mockResolvedValueOnce({ id: 1, username: 'testuser' });
    const response = await request(app).post('/login').send({ login: 'testuser', password: '12345678' });
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/feed');
  });
});