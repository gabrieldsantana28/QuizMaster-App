import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../../app.js';
import * as userService from '../user.service.js';
vi.mock('../user.service.js');
describe('User Controller - Register', () => {
 beforeEach(() => {
 vi.clearAllMocks();
 });
 it('deve redirecionar para /login com sucesso', async () => {
 userService.register.mockResolvedValueOnce({
 message: 'Usuário criado com sucesso!'
 });
 const response = await request(app)
 .post('/register')
 .send({
 username: 'testuser',
 email: 'test@test.com',
 password: '12345678',
 confirmPassword: '12345678'
 });
 expect(response.status).toBe(302);
 expect(response.header.location).toBe('/login');
 });
 it('deve redirecionar para /register em caso de erro', async () => {
 userService.register.mockRejectedValueOnce(
 new Error('As senhas não coincidem.')
 );
 const response = await request(app)
 .post('/register')
 .send({
 username: 'testuser',
 email: 'test@test.com',
 password: '12345678',
 confirmPassword: 'wrongpass'
 });
 expect(response.status).toBe(302);
 expect(response.header.location).toBe('/register');
 });
});
// ... outros testes existentes no 'describe' já existente ...
it('deve fazer login com sucesso e redirecionar para /feed', async () => {
// Mock do service
userService.login.mockResolvedValueOnce({
id: 1,
username: 'testuser'
});
const response = await request(app)
.post('/login')
.send({
login: 'testuser',
password: '12345678'
});
expect(response.status).toBe(302);
expect(response.header.location).toBe('/feed');
});