const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");

const { appendToSheet, readSheet } = require("./utils");

// const flowSecundario = addKeyword(["2", "siguiente"]).addAnswer([
//   "📄 Aquí tenemos el flujo secundario",
// ]);

const flowHistory = addKeyword("Historial").addAnswer(
  "Este es el flujo historial",
  null,
  async (ctx, ctxFn) => {
    const response = await readSheet("Hoja 1!A1:C10");
    console.log(response);
  }
);

const flowPrincipal = addKeyword(["hola", "gastos", "ver"])
  .addAnswer("🙌 Hola bienvenido a tus gastos")
  .addAnswer("Nombre del gasto", { capture: true }, async (ctx, ctxFn) => {
    await ctxFn.state.update({ name: ctx.body });
  })
  .addAnswer("Monto del gasto", { capture: true }, async (ctx, ctxFn) => {
    await ctxFn.state.update({ amount: ctx.body });
  })
  .addAnswer("Categoria del gasto", { capture: true }, async (ctx, ctxFn) => {
    await ctxFn.state.update({ category: ctx.body });
  })
  .addAnswer(
    "Tus datos fueron registrados correctamente",
    null,
    async (ctx, ctxFn) => {
      const name = ctxFn.state.get("name");
      const amount = ctxFn.state.get("amount");
      const category = ctxFn.state.get("category");

      await appendToSheet([[name, amount, category]])
    }
  );

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flowPrincipal, flowHistory]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
