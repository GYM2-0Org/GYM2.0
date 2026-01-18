// BillServiceTest.mjs
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const docMock = mockClient(DynamoDBDocumentClient);

async function runTest() {
  docMock.reset();

  /* 1) Fehlender Body */
  {
    const { handler } = await import("./BillService.mjs");
    const res = await handler({});
    if (res.statusCode !== 400) throw new Error("Test 1 fehlgeschlagen: Body fehlt");
  }

  /* 2) Fehlende produkt_id */
  {
    const { handler } = await import("./BillService.mjs");
    const res = await handler({ body: "{}" });
    if (res.statusCode !== 400) throw new Error("Test 2 fehlgeschlagen: produkt_id fehlt");
  }

  /* 3) Produkt nicht gefunden */
  {
    docMock.reset();
    docMock.on(GetCommand).resolves({}); // Item fehlt -> 404

    const { handler } = await import("./BillService.mjs");
    const res = await handler({ body: JSON.stringify({ produkt_id: "X" }) });

    if (res.statusCode !== 404) throw new Error("Test 3 fehlgeschlagen: Produkt nicht gefunden");
  }

  /* 4) Kein Bestand */
  {
    docMock.reset();
    docMock.on(GetCommand).resolves({
      Item: { produkt_id: "A", p_name: "Cola", preis: 2, aktuelle_anzahl: 0 },
    });

    const { handler } = await import("./BillService.mjs");
    const res = await handler({ body: JSON.stringify({ produkt_id: "A" }) });

    if (res.statusCode !== 400) throw new Error("Test 4 fehlgeschlagen: Bestand 0");
  }

  /* 5) Erfolgreicher Kauf */
  {
    docMock.reset();

    docMock.on(GetCommand).resolves({
      Item: { produkt_id: "B", p_name: "Fanta", preis: 2.5, aktuelle_anzahl: 5 },
    });
    docMock.on(UpdateCommand).resolves({});
    docMock.on(PutCommand).resolves({});

    const { handler } = await import("./BillService.mjs");
    const res = await handler({ body: JSON.stringify({ produkt_id: "B" }) });

    if (res.statusCode !== 200) throw new Error("Test 5 fehlgeschlagen: Kauf nicht erfolgreich");

    const order = JSON.parse(res.body);
    if (!order.order_id || order.produkt_id !== "B") {
      throw new Error("Test 5 fehlgeschlagen: Order inkorrekt");
    }
  }

  console.log(" Test OK");
}

runTest().catch((e) => {
  console.error(" Test FAIL", e);
  process.exit(1);
});
