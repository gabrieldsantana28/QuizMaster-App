# RELATORIO.md — QuizMaster: Aplicação do TDD

## 1. Funcionalidade Escolhida

**Autenticação e Gerenciamento de Usuários** — módulo central do QuizMaster.

| Função | Arquivo | Descrição |
|---|---|---|
| `register()` | `user.service.js` | Cadastro de novo usuário com validações e hash de senha |
| `login()` | `user.service.js` | Autenticação por e-mail ou username com bcrypt |
| `getProfile()` | `user.service.js` | Busca segura do perfil de um usuário pelo ID |

### Regras de Negócio

| Código | Regra |
|---|---|
| RN-001 | `password` e `confirmPassword` devem ser idênticos |
| RN-002 | Senha deve ter mínimo de 8 caracteres |
| RN-003 | E-mail e username devem ser únicos no sistema |
| RN-004 | Senha nunca armazenada em texto puro — hash `bcrypt` (salt 10) |
| RN-005 | Resposta do cadastro nunca expõe o campo `password` |
| RN-006 | Login aceita e-mail **ou** username |
| RN-007 | Mensagem de erro genérica para não expor qual campo está errado |
| RN-008 | Senha comparada com hash via `bcrypt.compare` |
| RN-009 | Resposta do login nunca expõe o campo `password` |
| RN-010 | `getProfile`: lança erro se ID não encontrado |

---

## 2. Como o TDD foi Aplicado — Ciclo Red–Green–Refactor

```
🔴 RED     → Escrever um teste que FALHA porque a funcionalidade não existe
🟢 GREEN   → Implementar o mínimo de código para o teste PASSAR
🔵 REFACTOR → Melhorar o código sem quebrar os testes existentes
```

### Exemplo real aplicado (RN-004 — hash da senha):

**🔴 RED** — Teste escrito antes da implementação:
```js
it('deve armazenar a senha como hash bcrypt', async () => {
  await userService.register(data, mockUserModel);
  const chamada = mockUserModel.create.mock.calls[0][0];
  expect(chamada.password).not.toBe('senhaSegura123');
  expect(chamada.password).toMatch(/^\$2b\$/);
});
// ❌ FALHOU — register() ainda salvava em texto puro
```

**🟢 GREEN** — Código mínimo adicionado:
```js
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
await UserModel.create({ username, email, password: hashedPassword });
// ✅ PASSOU
```

**🔵 REFACTOR** — Garantia de que a senha não vaza na resposta:
```js
return {
  message: 'Usuário criado com sucesso!',
  user: { id, username, email, fullName }  // ← sem password
};
```

---

## 3. Exemplos de 3 Testes Unitários

### Teste 1 — Senhas não coincidem (RN-001)

```js
it('Teste 01 — RED: deve lançar erro se as senhas não coincidirem', async () => {
  const data = {
    username: 'gabriel',
    email: 'gabriel@test.com',
    password: '12345678',
    confirmPassword: '87654321',
  };

  await expect(userService.register(data, mockUserModel))
    .rejects
    .toThrow('As senhas não coincidem.');
});
```

**O que verifica:** Confirma que `register()` rejeita dados quando `password !== confirmPassword`. Usa `expect().rejects.toThrow()` para asserção de erros assíncronos. O `mockUserModel` não tem seus métodos chamados — o erro é lançado antes de qualquer acesso ao banco.

---

### Teste 2 — Hash da senha (RN-004)

```js
it('Teste 05 — GREEN: deve armazenar a senha como hash bcrypt', async () => {
  const data = { username: 'teste', email: 'teste@test.com',
                 password: 'senhaSegura123', confirmPassword: 'senhaSegura123' };

  mockUserModel.findOne.mockResolvedValueOnce(null);
  mockUserModel.create.mockResolvedValueOnce({ id: 2, username: 'teste' });

  await userService.register(data, mockUserModel);

  const chamada = mockUserModel.create.mock.calls[0][0];
  expect(chamada.password).not.toBe('senhaSegura123');  // não é texto puro
  expect(chamada.password).toMatch(/^\$2b\$/);           // é hash bcrypt
});
```

**O que verifica:** Inspeciona os argumentos passados ao `mockUserModel.create` via `.mock.calls[0][0]`. Garante que (a) a senha original não foi armazenada e (b) o valor corresponde ao formato hash do bcrypt. Protege contra regressões que exponham senhas.

---

### Teste 3 — Usuário ou e-mail duplicado (RN-003)

```js
it('Teste 03 — RED: deve lançar erro se email ou username já existirem', async () => {
  const data = {
    username: 'gabriel',
    email: 'gabriel@test.com',
    password: '12345678',
    confirmPassword: '12345678',
  };

  mockUserModel.findOne.mockResolvedValueOnce({ id: 1 }); // simula duplicata

  await expect(userService.register(data, mockUserModel))
    .rejects
    .toThrow('Este e-mail ou usuário já está cadastrado.');
});
```

**O que verifica:** Usa `vi.fn().mockResolvedValueOnce({ id: 1 })` para simular um usuário já existente sem acessar o banco real. Confirma que a mensagem de erro correta é lançada. Demonstra o uso de **mocks para isolamento de dependências**.

---

## 4. Relatório de Cobertura

```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|--------
user.service.js    |   100   |   100    |   100   |   100
quiz.service.js    |  96.36  |  81.25   |   100   |  96.36
favorito.service.js|   100   |  88.88   |   100   |   100
-------------------|---------|----------|---------|--------
TOTAL              |  98.59  |  87.50   |   100   |  98.59
```

## 5. Estrutura do Projeto

```
QuizMaster-App-master/
├── src/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── __tests__/
│   │   │   │   ├── user.service.test.js   ← 16 testes unitários
│   │   │   │   └── user.controller.test.js
│   │   │   ├── user.service.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.model.js
│   │   │   └── user.routes.js
│   │   ├── quiz/
│   │   │   ├── __tests__/quiz.service.test.js  ← 18 testes
│   │   │   ├── quiz.service.js
│   │   │   ├── quiz.controller.js
│   │   │   ├── quiz.model.js
│   │   │   ├── questao.model.js
│   │   │   ├── avaliacao.model.js
│   │   │   └── quiz.routes.js
│   │   ├── favorito/
│   │   │   ├── __tests__/favorito.service.test.js  ← 6 testes
│   │   │   ├── favorito.service.js
│   │   │   ├── favorito.controller.js
│   │   │   ├── favorito.model.js
│   │   │   └── favorito.routes.js
│   │   ├── tema/
│   │   │   └── tema.model.js
│   │   ├── admin/
│   │   │   ├── admin.controller.js
│   │   │   └── admin.routes.js
│   │   └── health/
│   │       ├── __tests__/health.service.test.js
│   │       └── health.service.js
│   ├── views/
│   │   ├── layouts/main.ejs
│   │   └── pages/
│   │       ├── index.ejs        ← Landing page
│   │       ├── login.ejs
│   │       ├── register.ejs
│   │       ├── feed.ejs         ← Lista de quizzes
│   │       ├── quiz-form.ejs    ← Criar quiz
│   │       ├── quiz-detalhe.ejs ← Detalhes + Avaliação
│   │       ├── favoritos.ejs
│   │       ├── error.ejs        ← 404
│   │       └── admin/
│   │           ├── dashboard.ejs
│   │           ├── usuarios.ejs
│   │           ├── quizzes.ejs
│   │           └── temas.ejs
│   ├── config/database.js
│   ├── middlewares/auth.js
│   ├── public/stylesheets/style.css
│   ├── app.js
│   └── server.js
├── test/setup.js
├── vitest.config.js
├── quizmaster.sql
├── RELATORIO.md
└── package.json
```

## 6. Resultado Final dos Testes

```
✓ src/modules/user/__tests__/user.service.test.js     (16 testes)
✓ src/modules/user/__tests__/user.controller.test.js  ( 3 testes)
✓ src/modules/quiz/__tests__/quiz.service.test.js     (18 testes)
✓ src/modules/favorito/__tests__/favorito.service.test.js (6 testes)
✓ src/modules/health/__tests__/health.service.test.js  (1 teste)

Test Files: 5 passed
     Tests: 44 passed
  Coverage: 98.59% linhas
```