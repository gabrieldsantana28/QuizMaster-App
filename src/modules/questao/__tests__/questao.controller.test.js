import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mocks de dependências pesadas antes de qualquer import de app
vi.mock('../../../config/database.js', () => ({
  default: { define: vi.fn(() => ({})), authenticate: vi.fn(), sync: vi.fn() },
}));
vi.mock('../questao.model.js', () => ({ default: {} }));
vi.mock('../../../modules/user/user.model.js', () => ({ default: {} }));
vi.mock('../../../modules/quiz/quiz.model.js', () => ({ default: { findByPk: vi.fn() } }));
vi.mock('../../../modules/quiz/avaliacao.model.js', () => ({ default: {} }));
vi.mock('../../../modules/quiz/questao.model.js', () => ({ default: {} }));
vi.mock('../../../modules/favorito/favorito.model.js', () => ({ default: {} }));
vi.mock('../../../modules/tema/tema.model.js', () => ({ default: {} }));
vi.mock('../questao.service.js');

// Importa app DEPOIS dos mocks
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';
import * as questaoService from '../questao.service.js';
import questaoRoutes from '../questao.routes.js';
import Quiz from '../../quiz/quiz.model.js';

// Mini-app de teste — sem dependências de BD ou views
const buildTestApp = (sessionUser = null) => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: false }));
  testApp.use(cookieParser());
  testApp.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
  }));
  testApp.use(flash());
  testApp.use((req, res, next) => {
    res.locals.messages = req.flash();
    res.locals.user = sessionUser;
    if (sessionUser) req.session.user = sessionUser;
    next();
  });

  // Substituir render para não precisar de views
  testApp.use((req, res, next) => {
    res.render = (view, data) => res.json({ view, ...data });
    next();
  });

  testApp.use(questaoRoutes);

  // Fallback 404
  testApp.use((req, res) => res.status(404).json({ error: 'not found' }));
  return testApp;
};

// =============================================================
// TESTES DE INTEGRAÇÃO — Questão Controller (mini-app isolado)
// =============================================================

describe('Questao Controller — POST /questoes (criar)', () => {
  let app;
  beforeEach(() => {
    vi.clearAllMocks();
    app = buildTestApp({ id: 10, username: 'testuser' });
  });

  // Integração 1 — sucesso → redireciona para lista de questões do quiz
  it('deve redirecionar para /quizzes/:quizId/questoes após criação bem-sucedida', async () => {
    questaoService.criarQuestao.mockResolvedValueOnce({ message: 'Questão criada com sucesso!' });

    const response = await request(app).post('/questoes').send({
      enunciado: 'Qual é a capital da França?',
      quizId: 1,
      alternativas: ['Paris', 'Londres'],
      alternativaCorreta: 0,
    });

    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/quizzes/1/questoes');
  });

  // Integração 2 — erro no service → redireciona para formulário de nova questão
  it('deve redirecionar para /quizzes/:quizId/questoes/nova em caso de erro do service', async () => {
    questaoService.criarQuestao.mockRejectedValueOnce(
      new Error('O enunciado deve ter no mínimo 10 caracteres.')
    );

    const response = await request(app).post('/questoes').send({
      enunciado: 'Curto',
      quizId: 2,
      alternativas: ['A', 'B'],
      alternativaCorreta: 0,
    });

    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/quizzes/2/questoes/nova');
  });

  // Integração 3 — service é chamado exatamente 1 vez
  it('deve chamar questaoService.criarQuestao com os dados do body', async () => {
    questaoService.criarQuestao.mockResolvedValueOnce({ message: 'Questão criada com sucesso!' });

    await request(app).post('/questoes').send({
      enunciado: 'Qual o maior planeta do sistema solar?',
      quizId: 5,
      alternativas: ['Júpiter', 'Saturno'],
      alternativaCorreta: 0,
    });

    expect(questaoService.criarQuestao).toHaveBeenCalledTimes(1);
  });

  // Integração 4 — status 302 mesmo em erro
  it('deve retornar status 302 em qualquer caso (redirect always)', async () => {
    questaoService.criarQuestao.mockRejectedValueOnce(new Error('Erro qualquer'));

    const response = await request(app).post('/questoes').send({ quizId: 3 });

    expect(response.status).toBe(302);
  });
});

describe('Questao Controller — GET /quizzes/:quizId/questoes (listar)', () => {
  let app;
  beforeEach(() => {
    vi.clearAllMocks();
    app = buildTestApp({ id: 10, username: 'testuser' });
  });

  // Integração 5 — listagem com erro → redireciona para /feed
  it('deve redirecionar para /feed em caso de erro na listagem', async () => {
    questaoService.listarQuestoesPorQuiz.mockRejectedValueOnce(
      new Error('O ID do quiz é obrigatório.')
    );

    const response = await request(app).get('/quizzes/0/questoes');

    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/feed');
  });

  // Integração 6 — quizId passado como parâmetro da rota
  it('deve chamar questaoService.listarQuestoesPorQuiz com o quizId correto', async () => {
    questaoService.listarQuestoesPorQuiz.mockRejectedValueOnce(new Error('err'));

    await request(app).get('/quizzes/7/questoes');

    expect(questaoService.listarQuestoesPorQuiz).toHaveBeenCalledWith('7', expect.anything());
  });
});

describe('Questao Controller — POST /questoes/:id/responder (verificarResposta)', () => {
  let app;
  beforeEach(() => {
    vi.clearAllMocks();
    app = buildTestApp();
  });

  // Integração 7 — resposta correta retorna JSON 200
  it('deve retornar JSON com correta=true para resposta correta', async () => {
    questaoService.verificarResposta.mockResolvedValueOnce({
      correta: true,
      alternativaCorreta: 0,
      dica: null,
    });

    const response = await request(app)
      .post('/questoes/1/responder')
      .send({ respostaIdx: 0 });

    expect(response.status).toBe(200);
    expect(response.body.correta).toBe(true);
    expect(response.body.dica).toBeNull();
  });

  // Integração 8 — resposta incorreta retorna JSON com dica
  it('deve retornar JSON com correta=false e dica para resposta incorreta', async () => {
    questaoService.verificarResposta.mockResolvedValueOnce({
      correta: false,
      alternativaCorreta: 0,
      dica: 'Cidade Luz',
    });

    const response = await request(app)
      .post('/questoes/1/responder')
      .send({ respostaIdx: 2 });

    expect(response.status).toBe(200);
    expect(response.body.correta).toBe(false);
    expect(response.body.dica).toBe('Cidade Luz');
  });

  // Integração 9 — questão não encontrada → retorna 400 com mensagem de erro
  it('deve retornar 400 e mensagem de erro se a questão não existir', async () => {
    questaoService.verificarResposta.mockRejectedValueOnce(
      new Error('Questão não encontrada.')
    );

    const response = await request(app)
      .post('/questoes/999/responder')
      .send({ respostaIdx: 0 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Questão não encontrada.');
  });

  // Integração 10 — índice inválido → retorna 400
  it('deve retornar 400 para índice de resposta inválido', async () => {
    questaoService.verificarResposta.mockRejectedValueOnce(
      new Error('Resposta inválida.')
    );

    const response = await request(app)
      .post('/questoes/1/responder')
      .send({ respostaIdx: 99 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Resposta inválida.');
  });

  // Integração 11 — response body tem propriedade alternativaCorreta
  it('deve incluir alternativaCorreta no JSON de resposta correta', async () => {
    questaoService.verificarResposta.mockResolvedValueOnce({
      correta: false,
      alternativaCorreta: 2,
      dica: 'Dica aqui',
    });

    const response = await request(app)
      .post('/questoes/1/responder')
      .send({ respostaIdx: 0 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('alternativaCorreta', 2);
  });
});

describe('Questao Controller — POST /questoes/:id/excluir (excluir)', () => {
  let app;
  beforeEach(() => {
    vi.clearAllMocks();
    app = buildTestApp({ id: 10, username: 'testuser' });
  });

  // Integração 12 — exclusão bem-sucedida → redireciona
  it('deve redirecionar após exclusão bem-sucedida', async () => {
    questaoService.excluirQuestao.mockResolvedValueOnce({ message: 'Questão excluída com sucesso.' });

    const response = await request(app)
      .post('/questoes/1/excluir')
      .set('Referer', '/quizzes/1/questoes')
      .send();

    expect(response.status).toBe(302);
    expect(questaoService.excluirQuestao).toHaveBeenCalledTimes(1);
  });
});

describe('Questao Controller — GET /quizzes/:quizId/questoes/nova (novaForm)', () => {
  let app;
  beforeEach(() => {
    vi.clearAllMocks();
    app = buildTestApp({ id: 10, username: 'testuser' });
  });

  it('deve renderizar o formulário de nova questão quando o quiz existe', async () => {
    Quiz.findByPk.mockResolvedValueOnce({ id: 1, titulo: 'Geografia' });

    const response = await request(app).get('/quizzes/1/questoes/nova');

    expect(response.status).toBe(200);
    expect(response.body.view).toBe('questoes/form');
    expect(response.body.quiz).toEqual({ id: 1, titulo: 'Geografia' });
    expect(response.body.questao).toBeNull();
  });

  it('deve redirecionar para /feed se o quiz não existir', async () => {
    Quiz.findByPk.mockResolvedValueOnce(null);

    const response = await request(app).get('/quizzes/999/questoes/nova');

    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/feed');
  });
});

describe('Questao Controller — GET /questoes/:id/editar (editarForm)', () => {
  let app;
  beforeEach(() => {
    vi.clearAllMocks();
    app = buildTestApp({ id: 10, username: 'testuser' });
  });

  it('deve renderizar o formulário de edição para o autor da questão', async () => {
    questaoService.buscarQuestaoPorId.mockResolvedValueOnce({
      id: 1, quizId: 1, autorId: 10, enunciado: 'Pergunta?', alternativas: JSON.stringify(['A', 'B']),
    });
    Quiz.findByPk.mockResolvedValueOnce({ id: 1, titulo: 'Geografia' });

    const response = await request(app).get('/questoes/1/editar');

    expect(response.status).toBe(200);
    expect(response.body.view).toBe('questoes/form');
    expect(response.body.alternativasAtuais).toEqual(['A', 'B']);
  });

  it('deve redirecionar de volta para a lista se o usuário não for o autor', async () => {
    questaoService.buscarQuestaoPorId.mockResolvedValueOnce({
      id: 1, quizId: 3, autorId: 999, enunciado: 'Pergunta?', alternativas: JSON.stringify(['A', 'B']),
    });

    const response = await request(app).get('/questoes/1/editar');

    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/quizzes/3/questoes');
  });

  it('deve redirecionar para /feed se a questão não existir', async () => {
    questaoService.buscarQuestaoPorId.mockRejectedValueOnce(new Error('Questão não encontrada.'));

    const response = await request(app).get('/questoes/999/editar');

    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/feed');
  });
});
