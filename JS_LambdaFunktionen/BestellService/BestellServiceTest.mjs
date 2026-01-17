import { handler } from "./BestellService.mjs";

export async function runTest() {
  // Minimaler Smoke-Test ohne AWS

  const result = await handler({
    __test: true
  });

  if (!result || result.statusCode >= 400) {
    throw new Error("BestellService Test fehlgeschlagen");
  }

  return result;
}
