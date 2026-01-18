// CheckProductsTest.mjs
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const docMock = mockClient(DynamoDBDocumentClient);

async function runTest() {
  /* 1) Erfolgreicher Scan mit Produkten */
  {
    docMock.reset();
    docMock.on(ScanCommand).resolves({
      Items: [
        { product_id: "1", p_name: "Cola", preis: 2 },
        { product_id: "2", p_name: "Fanta", preis: 2.5 },
      ],
    });

    const { handler } = await import("./CheckProducts.mjs");
    const res = await handler();

    if (res.statusCode !== 200) {
      throw new Error("Test 1 fehlgeschlagen: statusCode != 200");
    }

    const items = JSON.parse(res.body);
    if (items.length !== 2) {
      throw new Error("Test 1 fehlgeschlagen: falsche Anzahl Produkte");
    }
  }

  /* 2) Erfolgreicher Scan ohne Produkte */
  {
    docMock.reset();
    docMock.on(ScanCommand).resolves({ Items: [] });

    const { handler } = await import("./CheckProducts.mjs");
    const res = await handler();

    if (res.statusCode !== 200) {
      throw new Error("Test 2 fehlgeschlagen: statusCode != 200");
    }

    const items = JSON.parse(res.body);
    if (!Array.isArray(items) || items.length !== 0) {
      throw new Error("Test 2 fehlgeschlagen: Array leer erwartet");
    }
  }

  /* 3) DynamoDB-Fehler */
  {
    docMock.reset();
    docMock.on(ScanCommand).rejects(new Error("DynamoDB down"));

    const { handler } = await import("./CheckProducts.mjs");
    const res = await handler();

    if (res.statusCode !== 500) {
      throw new Error("Test 3 fehlgeschlagen: statusCode != 500");
    }
  }

  console.log(" Test OK");
}

runTest().catch((e) => {
  console.error(" Test FAIL", e);
  process.exit(1);
});
