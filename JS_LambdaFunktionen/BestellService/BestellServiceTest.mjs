import { handler } from "./BestellService.mjs";

async function runTest() {
  const result = await handler({ __test: true });

  if (!result || result.statusCode >= 400) {
    throw new Error("BestellService Test fehlgeschlagen");
  }

  console.log("✅ Test OK", result);
}

runTest().catch((e) => {
  console.error("❌ Test FAIL", e);
  process.exit(1);
});
