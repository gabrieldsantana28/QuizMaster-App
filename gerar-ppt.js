import pptxgen from "pptxgenjs";

const pptx = new pptxgen();

const slide = pptx.addSlide();

slide.addText("QuizMaster", {
  x: 1,
  y: 1,
  w: 4,
  h: 0.5,
  fontSize: 24,
  bold: true
});

slide.addText("Apresentação do Projeto", {
  x: 1,
  y: 2,
  w: 5,
  h: 0.5,
  fontSize: 16
});

await pptx.writeFile({
  fileName: "QuizMaster_TDD_Apresentacao.pptx"
});

console.log("PowerPoint gerado com sucesso!");