# RELATÓRIO TÉCNICO — N3: TDD Avançado com QuizMaster

**Projeto:** QuizMaster — Plataforma de Quizzes Online  
**Aluno:** Gabriel Luis de Santana e Pedro Elizeu dos Santos
**Disciplina:** Testes de Software  
**Continuação da:** N2  

---

## 1. Nova Funcionalidade Implementada

### Módulo de Questões (`questao`)

**Acesso de Administrador:**
  - Usuário: admin
  - Senha: Admin@123

A funcionalidade implementada na N3 é o **Módulo de Questões do Quiz**, que permite criar, listar, editar, excluir e responder questões de múltipla escolha vinculadas a um quiz existente.

#### Regras de Negócio

| Código | Regra |
|--------|-------|
| RN-Q001 | O enunciado deve ter no mínimo 10 caracteres |
| RN-Q002 | A questão deve ter entre 2 e 5 alternativas |
| RN-Q003 | Exatamente uma alternativa deve ser indicada como correta |
| RN-Q004 | `quizId` e `autorId` são obrigatórios |
| RN-Q005 | O índice da alternativa correta deve ser um índice válido do array |
| RN-Q006 | `quizId` é obrigatório para listar questões |
| RN-Q007 | Apenas questões existentes podem ser buscadas |
| RN-Q008 | Apenas o autor pode editar ou excluir uma questão |
| RN-Q009 | Validações se aplicam também na atualização |
| RN-Q010 | Exclusão usa `destroy()` (hard delete) |
| RN-Q011 | A resposta do usuário deve ser um índice válido do array de alternativas |

#### Estrutura do Módulo

```
src/modules/questao/
├── questao.service.js      # Regras de negócio (funções puras testáveis)
├── questao.model.js        # Modelo Sequelize
├── questao.controller.js   # Handlers HTTP
├── questao.routes.js       # Definição das rotas Express
└── __tests__/
    ├── questao.service.test.js      # 33 testes unitários
    └── questao.controller.test.js   # 12 testes de integração
```

---

## 2. Aplicação do Ciclo Red-Green-Refactor

O TDD foi aplicado rigorosamente: **nenhuma linha do service foi escrita antes do teste que a exige**.

### Exemplo Real do Ciclo (RN-Q001 — Enunciado mínimo)

#### 🔴 Red — Teste escrito primeiro (falha)

```js
it('deve lançar erro se enunciado tiver menos de 10 caracteres', async () => {
  const data = { ...dadosValidos, enunciado: 'Curto?' };
  await expect(questaoService.criarQuestao(data, mockQuestaoModel))
    .rejects.toThrow('O enunciado deve ter no mínimo 10 caracteres.');
});
```

Resultado: ❌ `criarQuestao is not a function` — função não existe ainda.

#### 🟢 Green — Código mínimo para passar

```js
export const criarQuestao = async (data, QuestaoModel) => {
  const { enunciado } = data;
  if (!enunciado || enunciado.trim().length < 10) {
    throw new Error('O enunciado deve ter no mínimo 10 caracteres.');
  }
  // ... resto das validações
};
```

Resultado: ✅ Teste passa.

#### 🔵 Refactor — Consolidação e trim do enunciado

```js
// Refactor: garantir que o enunciado salvo não tenha espaços extras
await questao.update({
  enunciado: enunciado ? enunciado.trim() : questao.enunciado,
  // ...
});
```

Teste de regressão: ✅ todos continuam passando.

---

### Segundo Exemplo do Ciclo (RN-Q011 — Verificar resposta)

#### 🔴 Red

```js
it('deve retornar correta=true quando a resposta for correta', async () => {
  mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestaoBase);
  const result = await questaoService.verificarResposta(1, 0, mockQuestaoModel);
  expect(result.correta).toBe(true);
});
```

#### 🟢 Green

```js
export const verificarResposta = async (id, respostaIdx, QuestaoModel) => {
  const questao = await QuestaoModel.findByPk(id);
  if (!questao) throw new Error('Questão não encontrada.');
  const alternativas = JSON.parse(questao.alternativas);
  const correta = respostaIdx === questao.alternativaCorreta;
  return { correta, alternativaCorreta: questao.alternativaCorreta, dica: correta ? null : questao.dica };
};
```

#### 🔵 Refactor — Validação do índice

```js
if (respostaIdx === undefined || respostaIdx < 0 || respostaIdx >= alternativas.length) {
  throw new Error('Resposta inválida.');
}
```

---

## 3. Testes Unitários Explicados

### Teste Unitário 1 — Enunciado curto (RN-Q001)

**Arquivo:** `questao.service.test.js`  
**O que verifica:** Que o service rejeita enunciados com menos de 10 caracteres.  
**Mock utilizado:** `mockQuestaoModel.create` (vi.fn()) — não é chamado porque o erro ocorre antes.  
**Asserção:** `expect(...).rejects.toThrow('O enunciado deve ter no mínimo 10 caracteres.')`

```js
it('deve lançar erro se enunciado tiver menos de 10 caracteres', async () => {
  const data = { ...dadosValidos, enunciado: 'Curto?' };
  await expect(questaoService.criarQuestao(data, mockQuestaoModel))
    .rejects.toThrow('O enunciado deve ter no mínimo 10 caracteres.');
});
```

---

### Teste Unitário 2 — Serialização de alternativas (RN-Q002)

**O que verifica:** Que as alternativas são convertidas para JSON string antes de salvar no banco.  
**Mock utilizado:** `mockQuestaoModel.create = vi.fn()` — inspecionamos o argumento passado.  
**Asserção:** `expect(chamada.alternativas).toBe(JSON.stringify(alternativasValidas))`

```js
it('deve serializar alternativas como JSON ao criar', async () => {
  mockQuestaoModel.create.mockResolvedValueOnce({ id: 2 });
  await questaoService.criarQuestao(dadosValidos, mockQuestaoModel);
  const chamada = mockQuestaoModel.create.mock.calls[0][0];
  expect(chamada.alternativas).toBe(JSON.stringify(alternativasValidas));
});
```

---

### Teste Unitário 3 — Resposta correta retorna dica null

**O que verifica:** Que quando o usuário acerta, a dica não é revelada (retorna null).  
**Mock utilizado:** `vi.fn()` no `QuestaoModel.findByPk` retornando objeto com `alternativas` como JSON string.  
**Asserção:** `expect(result.dica).toBeNull()` + `expect(result.correta).toBe(true)`

```js
it('deve retornar correta=true quando a resposta for correta', async () => {
  mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestaoBase);
  const result = await questaoService.verificarResposta(1, 0, mockQuestaoModel);
  expect(result.correta).toBe(true);
  expect(result.dica).toBeNull();
});
```

---

### Teste Unitário 4 — Permissão de edição (RN-Q008)

**O que verifica:** Que um usuário não pode editar a questão de outro autor.  
**Mock utilizado:** `findByPk` retorna questão com `autorId: 10`; chamamos `atualizarQuestao` com `autorId: 999`.  
**Asserção:** `.rejects.toThrow('Você não tem permissão para editar esta questão.')`

```js
it('deve lançar erro se o autor não tiver permissão para editar', async () => {
  mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestao); // autorId: 10
  await expect(questaoService.atualizarQuestao(1, {}, 999, mockQuestaoModel))
    .rejects.toThrow('Você não tem permissão para editar esta questão.');
});
```

---

### Teste Unitário 5 — Resposta incorreta revela dica

**O que verifica:** Que quando o usuário erra, a dica é retornada junto com o índice correto.  
**Mock utilizado:** `findByPk` retorna questão com `dica: 'Cidade Luz'` e `alternativaCorreta: 0`.  
**Asserção:** `expect(result.correta).toBe(false)` + `expect(result.dica).toBe('Cidade Luz')`

```js
it('deve retornar correta=false e a dica quando a resposta for incorreta', async () => {
  mockQuestaoModel.findByPk.mockResolvedValueOnce(mockQuestaoBase);
  const result = await questaoService.verificarResposta(1, 2, mockQuestaoModel);
  expect(result.correta).toBe(false);
  expect(result.dica).toBe('Cidade Luz');
  expect(result.alternativaCorreta).toBe(0);
});
```

---

## 4. Testes de Integração Explicados

### Teste de Integração 1 — POST /questoes com sucesso

**O que verifica:** Status HTTP 302 e redirecionamento correto após criação bem-sucedida.  
**Mock utilizado:** `vi.mock('../questao.service.js')` — `criarQuestao` retorna `{ message: 'Questão criada com sucesso!' }`.  
**Asserção:** `expect(response.status).toBe(302)` + `expect(response.header.location).toBe('/quizzes/1/questoes')`

```js
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
```

---

### Teste de Integração 2 — POST /questoes/:id/responder com resposta incorreta

**O que verifica:** JSON de resposta contém `correta: false` e a dica, com status 200.  
**Mock utilizado:** `verificarResposta` mocka retorno com `correta: false, dica: 'Cidade Luz'`.  
**Asserção:** `expect(response.body.correta).toBe(false)` + `expect(response.body.dica).toBe('Cidade Luz')`

```js
it('deve retornar JSON com correta=false e dica para resposta incorreta', async () => {
  questaoService.verificarResposta.mockResolvedValueOnce({
    correta: false, alternativaCorreta: 0, dica: 'Cidade Luz',
  });
  const response = await request(app)
    .post('/questoes/1/responder')
    .send({ respostaIdx: 2 });
  expect(response.status).toBe(200);
  expect(response.body.dica).toBe('Cidade Luz');
});
```

---

## 5. Resumo dos Testes

| Módulo | Unitários | Integração | Total |
|--------|-----------|------------|-------|
| user   | 16        | 3          | 19    |
| quiz   | 18        | —          | 18    |
| favorito | 6       | —          | 6     |
| questao (N3) | 33  | 12         | 45    |
| health | 1         | —          | 1     |
| **Total** | **74** | **15**     | **89**|

---

## 6. Cobertura de Código

Comando: `npm run test:coverage`

| Módulo | Stmts | Branch | Funcs | Lines |
|--------|-------|--------|-------|-------|
| user.service.js | 100% | 100% | 100% | 100% |
| questao.service.js | 100% | 91.3% | 100% | 100% |
| quiz.service.js | 90.7% | 86.6% | 100% | 97.6% |
| favorito.service.js | 94.4% | 90% | 100% | 100% |
| **Geral** | **96.5%** | **91%** | **100%** | **99.3%** |

Ambos os módulos exigidos (user e questao) atingem cobertura ≥ 80% em todas as métricas.

---

## 7. CI com GitHub Actions

O arquivo `.github/workflows/ci.yml` configura o pipeline com os seguintes passos:

1. Checkout do repositório
2. Configuração do Node.js 20
3. `npm install --ignore-scripts`
4. `npm test` (todos os 89 testes devem passar)
5. `npm run test:coverage` (gera relatório HTML)
6. Upload do artefato `coverage/` para download no GitHub

---

## 8. Como Rodar o Projeto

```bash
# 1. Instalar dependências
npm install --ignore-scripts

# 2. Rodar todos os testes
npm test

# 3. Rodar com cobertura de código
npm run test:coverage

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

---

## 9. Lições Aprendidas

- **TDD força design melhor:** Escrever o teste primeiro obriga a pensar na interface da função antes de implementá-la, resultando em funções mais coesas e testáveis.
- **Mocks são essenciais em testes unitários:** Isolar o service do Model real permite testar regras de negócio puras sem depender de banco de dados.
- **Mini-apps de teste para integração:** Criar um mini Express app isolado nos testes de integração evita problemas com middlewares de autenticação e views, tornando os testes mais robustos.
- **Cobertura não é tudo:** Ter 100% de cobertura de linhas mas 91% de branches mostra que existem condições que combinações específicas de dados testam — a cobertura de branches é a mais valiosa.
- **CI garante qualidade contínua:** O GitHub Actions executa todos os testes a cada push, impedindo que código quebrado chegue à branch principal.
