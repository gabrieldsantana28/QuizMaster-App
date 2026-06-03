// const pptxgen = require("pptxgenjs");
import pptxgen from "pptxgenjs";

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'QuizMaster — TDD e Testes Unitários';

// ── PALETA ──
const NAVY   = "0D1B2A";
const BLUE   = "1B4FD8";
const LBLUE  = "3B82F6";
const TEAL   = "0891B2";
const WHITE  = "FFFFFF";
const LGRAY  = "E2E8F0";
const MGRAY  = "94A3B8";
const DGRAY  = "1E293B";
const GREEN  = "16A34A";
const YELLOW = "CA8A04";

function makeShadow() {
  return { type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.18 };
}

function addCard(slide, x, y, w, h, accent) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: "1E3A5F" }, line: { color: "263B6A", width: 1 }, shadow: makeShadow() });
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h, fill: { color: accent }, line: { color: accent, width: 0 } });
}

// ══════════════════════════════════════════════════════
// SLIDE 1 — CAPA
// ══════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  // Bloco decorativo esquerdo
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.4, h: 5.625, fill: { color: BLUE }, line: { color: BLUE, width: 0 } });

  // Badge
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.0, y: 0.5, w: 2.5, h: 0.42, fill: { color: "0C2D6B" }, rectRadius: 0.12, line: { color: LBLUE, width: 1 } });
  s.addText("TRABALHO DE TDD", { x: 1.0, y: 0.5, w: 2.5, h: 0.42, fontSize: 9, color: LBLUE, bold: true, align: "center", valign: "middle", margin: 0 });

  // Título principal
  s.addText("🎯 QuizMaster", { x: 0.75, y: 1.1, w: 8.5, h: 1.1, fontSize: 46, color: WHITE, bold: true, fontFace: "Calibri" });
  s.addText("Plataforma de Quizzes Online", { x: 0.75, y: 2.1, w: 8.5, h: 0.6, fontSize: 22, color: MGRAY, fontFace: "Calibri" });

  // Divisor
  s.addShape(pres.shapes.RECTANGLE, { x: 0.75, y: 2.82, w: 8.0, h: 0.03, fill: { color: "263B6A" }, line: { color: "263B6A", width: 0 } });

  // Subtítulo
  s.addText("Fundamentos do TDD e Testes Unitários", { x: 0.75, y: 2.95, w: 8.5, h: 0.5, fontSize: 15, color: LBLUE, fontFace: "Calibri" });

  // Chips de info
  const chips = [
    { label: "44 Testes", icon: "✅" },
    { label: "98.6% Cobertura", icon: "📊" },
    { label: "Node.js + Vitest", icon: "⚙️" },
  ];
  chips.forEach((c, i) => {
    const cx = 0.75 + i * 3.1;
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 3.65, w: 2.7, h: 0.52, fill: { color: "0C2D6B" }, line: { color: BLUE, width: 1 }, shadow: makeShadow() });
    s.addText(`${c.icon}  ${c.label}`, { x: cx, y: 3.65, w: 2.7, h: 0.52, fontSize: 12, color: WHITE, align: "center", valign: "middle", margin: 0 });
  });

  // Rodapé
  s.addText("QuizMaster © 2026  •  Desenvolvimento com TDD", { x: 0.75, y: 5.15, w: 8.5, h: 0.3, fontSize: 9, color: "4B5E7A", align: "center" });
}

// ══════════════════════════════════════════════════════
// SLIDE 2 — VISÃO GERAL DO PROJETO
// ══════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: "0F1E35" };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.4, h: 5.625, fill: { color: TEAL }, line: { color: TEAL, width: 0 } });

  s.addText("Visão Geral do Projeto", { x: 0.65, y: 0.25, w: 9, h: 0.6, fontSize: 28, color: WHITE, bold: true, fontFace: "Calibri" });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.65, y: 0.88, w: 9, h: 0.03, fill: { color: "1B3A5C" }, line: { color: "1B3A5C", width: 0 } });

  // Cards 2x2
  const features = [
    { icon: "👤", title: "Autenticação", desc: "Cadastro e login com bcrypt.\nToken de sessão seguro." },
    { icon: "📚", title: "Quizzes", desc: "Criar, editar e jogar quizzes\norganizados por temas." },
    { icon: "❤️", title: "Favoritos", desc: "Salvar quizzes favoritos\ne gerenciar a lista." },
    { icon: "⭐", title: "Avaliações", desc: "Notas (1-5) e comentários\nnos quizzes jogados." },
  ];

  features.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 0.65 + col * 4.7;
    const cy = 1.1 + row * 2.05;
    addCard(s, cx, cy, 4.4, 1.82, TEAL);
    s.addText(f.icon, { x: cx + 0.2, y: cy + 0.12, w: 0.7, h: 0.7, fontSize: 26, align: "center" });
    s.addText(f.title, { x: cx + 0.95, y: cy + 0.14, w: 3.2, h: 0.38, fontSize: 14, color: WHITE, bold: true });
    s.addText(f.desc, { x: cx + 0.95, y: cy + 0.54, w: 3.2, h: 0.8, fontSize: 11, color: MGRAY });
  });

  // Stack
  s.addShape(pres.shapes.RECTANGLE, { x: 0.65, y: 5.1, w: 9.0, h: 0.38, fill: { color: "0C2244" }, line: { color: "1B3A5C", width: 1 } });
  s.addText("Stack:  Node.js  •  Express  •  EJS  •  Sequelize  •  MySQL  •  Vitest", { x: 0.65, y: 5.1, w: 9.0, h: 0.38, fontSize: 10.5, color: LBLUE, align: "center", valign: "middle", margin: 0 });
}

// ══════════════════════════════════════════════════════
// SLIDE 3 — CICLO TDD
// ══════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: "0F1E35" };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.4, h: 5.625, fill: { color: GREEN }, line: { color: GREEN, width: 0 } });

  s.addText("O Ciclo TDD: Red → Green → Refactor", { x: 0.65, y: 0.25, w: 9, h: 0.6, fontSize: 26, color: WHITE, bold: true, fontFace: "Calibri" });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.65, y: 0.88, w: 9, h: 0.03, fill: { color: "1B3A5C" }, line: { color: "1B3A5C", width: 0 } });

  const steps = [
    { color: "B91C1C", lcolor: "EF4444", num: "01", label: "🔴 RED", title: "Escreva o teste primeiro", desc: "O teste falha porque a funcionalidade\nainda não existe. Isso confirma que\no teste realmente testa algo." },
    { color: "15803D", lcolor: "22C55E", num: "02", label: "🟢 GREEN", title: "Implemente o mínimo", desc: "Escreva o código mínimo necessário\npara o teste passar. Sem otimizações,\nsó o suficiente para ficar verde." },
    { color: "1D4ED8", lcolor: "3B82F6", num: "03", label: "🔵 REFACTOR", title: "Melhore o código", desc: "Refatore com confiança — os testes\ngarantem que nada quebrou.\nElimine duplicatas e melhore a clareza." },
  ];

  steps.forEach((st, i) => {
    const cx = 0.65 + i * 3.1;
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.1, w: 2.9, h: 3.8, fill: { color: "1E3A5F" }, line: { color: "263B6A", width: 1 }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.1, w: 2.9, h: 0.55, fill: { color: st.color }, line: { color: st.color, width: 0 } });
    s.addText(st.label, { x: cx, y: 1.1, w: 2.9, h: 0.55, fontSize: 14, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(st.title, { x: cx + 0.12, y: 1.75, w: 2.66, h: 0.42, fontSize: 12, color: WHITE, bold: true });
    s.addText(st.desc, { x: cx + 0.12, y: 2.24, w: 2.66, h: 1.4, fontSize: 10.5, color: MGRAY, lineSpacingMultiple: 1.3 });
    // Numero grande
    s.addText(st.num, { x: cx + 0.12, y: 3.72, w: 0.6, h: 0.7, fontSize: 30, color: st.lcolor, bold: true, fontFace: "Calibri" });
  });

  // Setas entre steps
  for (let i = 0; i < 2; i++) {
    const ax = 0.65 + (i + 1) * 3.1 - 0.2;
    s.addShape(pres.shapes.RIGHT_ARROW, { x: ax, y: 2.7, w: 0.35, h: 0.35, fill: { color: MGRAY }, line: { color: MGRAY, width: 0 } });
  }

  s.addText("Aplicado em cada funcionalidade do QuizMaster — especialmente no módulo de Usuários", { x: 0.65, y: 5.1, w: 9, h: 0.35, fontSize: 10, color: MGRAY, align: "center" });
}

// ══════════════════════════════════════════════════════
// SLIDE 4 — 5 TESTES UNITÁRIOS
// ══════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: "0F1E35" };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.4, h: 5.625, fill: { color: YELLOW }, line: { color: YELLOW, width: 0 } });

  s.addText("5 Testes Unitários em Destaque", { x: 0.65, y: 0.22, w: 9, h: 0.55, fontSize: 26, color: WHITE, bold: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.65, y: 0.8, w: 9, h: 0.03, fill: { color: "1B3A5C" }, line: { color: "1B3A5C", width: 0 } });

  const tests = [
    { num:"T01", phase:"RED",     color:"B91C1C", title:"Senhas não coincidem",     what:"register() lança erro quando password ≠ confirmPassword",   assert:"expect().rejects.toThrow()" },
    { num:"T03", phase:"RED",     color:"B91C1C", title:"Usuário/email duplicado",  what:"register() rejeita cadastro se username ou email já existir", assert:"mockUserModel.findOne retorna objeto" },
    { num:"T05", phase:"GREEN",   color:"15803D", title:"Hash da senha (bcrypt)",   what:"Senha nunca salva em texto puro — formato $2b$ verificado",  assert:"expect().not.toBe() + .toMatch(/^\\$2b\\$/)" },
    { num:"T10", phase:"RED",     color:"B91C1C", title:"Login: usuário não existe", what:"login() lança erro genérico quando usuário não é encontrado", assert:"mockUserModel.findOne retorna null" },
    { num:"T14", phase:"GREEN",   color:"15803D", title:"Buscar perfil por ID",      what:"getProfile() retorna dados completos sem expor password",    assert:"expect().toHaveProperty() + .not.toHaveProperty('password')" },
  ];

  tests.forEach((t, i) => {
    const cy = 1.0 + i * 0.88;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.65, y: cy, w: 9.0, h: 0.78, fill: { color: "182D4A" }, line: { color: "263B6A", width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.65, y: cy, w: 0.06, h: 0.78, fill: { color: t.color }, line: { color: t.color, width: 0 } });
    // Badge fase
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.82, y: cy + 0.14, w: 0.75, h: 0.28, fill: { color: t.color }, rectRadius: 0.05, line: { color: t.color, width: 0 } });
    s.addText(t.phase, { x: 0.82, y: cy + 0.14, w: 0.75, h: 0.28, fontSize: 8, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(t.num + " — " + t.title, { x: 1.7, y: cy + 0.07, w: 4.4, h: 0.3, fontSize: 11.5, color: WHITE, bold: true });
    s.addText(t.what, { x: 1.7, y: cy + 0.38, w: 4.4, h: 0.28, fontSize: 9.5, color: MGRAY });
    s.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: cy + 0.1, w: 3.3, h: 0.55, fill: { color: "0C1A2E" }, line: { color: "263B6A", width: 1 } });
    s.addText(t.assert, { x: 6.2, y: cy + 0.1, w: 3.3, h: 0.55, fontSize: 8.5, color: "7DD3FC", fontFace: "Consolas", align: "center", valign: "middle", margin: 6 });
  });
}

// ══════════════════════════════════════════════════════
// SLIDE 5 — USO DE MOCKS
// ══════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: "0F1E35" };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.4, h: 5.625, fill: { color: LBLUE }, line: { color: LBLUE, width: 0 } });

  s.addText("Uso de Mocks para Isolamento", { x: 0.65, y: 0.22, w: 9, h: 0.55, fontSize: 26, color: WHITE, bold: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.65, y: 0.8, w: 9, h: 0.03, fill: { color: "1B3A5C" }, line: { color: "1B3A5C", width: 0 } });

  // Por que mocks?
  s.addText("Por que usar Mocks?", { x: 0.65, y: 0.95, w: 4.3, h: 0.38, fontSize: 14, color: WHITE, bold: true });
  addCard(s, 0.65, 1.35, 4.3, 2.7, LBLUE);
  const bullets = ["✓  Testa apenas a lógica do Service, sem banco real", "✓  Execução ultra-rápida (ms, não segundos)", "✓  Simula erros impossíveis em DB real", "✓  Sem efeitos colaterais nos dados"];
  s.addText(bullets.map(b => ({ text: b, options: { breakLine: true } })), { x: 0.8, y: 1.5, w: 4.0, h: 2.4, fontSize: 11.5, color: LGRAY, lineSpacingMultiple: 1.5 });

  // Diagrama
  s.addText("Fluxo de Isolamento", { x: 5.2, y: 0.95, w: 4.3, h: 0.38, fontSize: 14, color: WHITE, bold: true });
  const boxes = [
    { label: "🧪 Teste", color: "1B4FD8", y: 1.35 },
    { label: "⚙️  Service\n(user.service.js)", color: "15803D", y: 2.35 },
    { label: "🎭 mockUserModel\n(vi.fn())", color: "6B21A8", y: 3.35 },
  ];
  boxes.forEach((b, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 6.3, y: b.y, w: 2.8, h: 0.75, fill: { color: b.color }, line: { color: b.color, width: 0 }, shadow: makeShadow() });
    s.addText(b.label, { x: 6.3, y: b.y, w: 2.8, h: 0.75, fontSize: 11, color: WHITE, bold: true, align: "center", valign: "middle", margin: 4 });
    if (i < 2) s.addShape(pres.shapes.DOWN_ARROW, { x: 7.45, y: b.y + 0.77, w: 0.4, h: 0.3, fill: { color: MGRAY }, line: { color: MGRAY, width: 0 } });
  });
  s.addText("❌  Banco de Dados real não é chamado", { x: 5.2, y: 4.28, w: 4.5, h: 0.35, fontSize: 10, color: "F87171", align: "center" });

  // Código de exemplo
  s.addShape(pres.shapes.RECTANGLE, { x: 0.65, y: 4.2, w: 4.3, h: 1.22, fill: { color: "0C1A2E" }, line: { color: "263B6A", width: 1 } });
  s.addText([
    { text: "mockUserModel", options: { color: "7DD3FC" } },
    { text: " = {\n  findOne: ", options: { color: LGRAY } },
    { text: "vi.fn()", options: { color: "C4B5FD" } },
    { text: ",\n  create:  ", options: { color: LGRAY } },
    { text: "vi.fn()", options: { color: "C4B5FD" } },
    { text: "\n};\nmockUserModel.findOne.", options: { color: LGRAY } },
    { text: "mockResolvedValueOnce", options: { color: "86EFAC" } },
    { text: "(null);", options: { color: LGRAY } },
  ], { x: 0.78, y: 4.26, w: 4.0, h: 1.1, fontSize: 9, fontFace: "Consolas", lineSpacingMultiple: 1.4 });
}

// ══════════════════════════════════════════════════════
// SLIDE 6 — COBERTURA E RESULTADOS
// ══════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.4, h: 5.625, fill: { color: GREEN }, line: { color: GREEN, width: 0 } });

  s.addText("Cobertura de Código e Resultados Finais", { x: 0.65, y: 0.22, w: 9, h: 0.55, fontSize: 24, color: WHITE, bold: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.65, y: 0.8, w: 9, h: 0.03, fill: { color: "1B3A5C" }, line: { color: "1B3A5C", width: 0 } });

  // Números grandes
  const stats = [
    { val: "44",    label: "Testes passando",     color: LBLUE },
    { val: "98.6%", label: "Cobertura de linhas", color: "4ADE80" },
    { val: "5",     label: "Arquivos de teste",   color: "FBBF24" },
    { val: "0",     label: "Testes falhando",     color: "F87171" },
  ];
  stats.forEach((st, i) => {
    const cx = 0.65 + i * 2.35;
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.0, w: 2.15, h: 1.5, fill: { color: "1E3A5F" }, line: { color: "263B6A", width: 1 }, shadow: makeShadow() });
    s.addText(st.val, { x: cx, y: 1.05, w: 2.15, h: 0.82, fontSize: 38, color: st.color, bold: true, align: "center", valign: "middle", fontFace: "Calibri", margin: 0 });
    s.addText(st.label, { x: cx, y: 1.85, w: 2.15, h: 0.52, fontSize: 9.5, color: MGRAY, align: "center", valign: "middle", margin: 0 });
  });

  // Tabela de cobertura
  const tableRows = [
    [{ text: "Arquivo", options: { color: WHITE, bold: true, fill: { color: "0C2D6B" } } },
     { text: "Stmts", options: { color: WHITE, bold: true, fill: { color: "0C2D6B" } } },
     { text: "Branch", options: { color: WHITE, bold: true, fill: { color: "0C2D6B" } } },
     { text: "Funcs", options: { color: WHITE, bold: true, fill: { color: "0C2D6B" } } },
     { text: "Lines", options: { color: WHITE, bold: true, fill: { color: "0C2D6B" } } }],
    ["user.service.js",     "100%", "100%", "100%", "100%"],
    ["quiz.service.js",     "96.4%", "81.3%", "100%", "96.4%"],
    ["favorito.service.js", "100%", "88.9%", "100%", "100%"],
    [{ text:"TOTAL", options:{bold:true, color:WHITE} }, { text:"98.6%", options:{bold:true, color:"4ADE80"} }, { text:"87.5%", options:{bold:true,color:LBLUE} }, { text:"100%", options:{bold:true,color:"4ADE80"} }, { text:"98.6%", options:{bold:true,color:"4ADE80"} }],
  ];
  s.addTable(tableRows, {
    x: 0.65, y: 2.65, w: 9.0, h: 2.2,
    fontSize: 10,
    color: MGRAY,
    border: { pt: 0.5, color: "263B6A" },
    fill: { color: "182D4A" },
    colW: [4.0, 1.25, 1.25, 1.25, 1.25],
    align: "center",
  });

  s.addText("npm run test:coverage  →  vitest run --coverage  →  relatório em /coverage/index.html", {
    x: 0.65, y: 5.1, w: 9.0, h: 0.35, fontSize: 9.5, color: "4B5E7A", fontFace: "Consolas", align: "center"
  });
}

pres.writeFile({ fileName: "QuizMaster_TDD_Apresentacao.pptx" })
  .then(() => console.log("✅ PPTX criado!"))
  .catch(e => console.error("Erro:", e));