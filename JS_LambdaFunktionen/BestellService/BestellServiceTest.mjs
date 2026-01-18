// BestellServiceTest.mjs
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

import { handler } from "./BestellService.mjs";

// Mocks: DocumentClient + SES
const docMock = mockClient(DynamoDBDocumentClient);
const sesMock = mockClient(SESClient);

async function runTest() {
  docMock.reset();
  sesMock.reset();

  // 1) ScanCommand: liefere Test-Inventar zurück (mind. 1 Item <= 5 damit Update+Mail-Pfad getestet wird)
  docMock.on(ScanCommand).resolves({
    Items: [
      {
        product_id: "p-1",
        p_name: "Protein Bar",
        aktuelle_anzahl: 3,
        max_anzahl: 10,
      },
      {
        product_id: "p-2",
        p_name: "Water",
        aktuelle_anzahl: 8,
        max_anzahl: 10,
      },
    ],
  });

  // 2) UpdateCommand: immer ok
  docMock.on(UpdateCommand).resolves({});

  // 3) SES Mail senden: ok
  sesMock.on(SendEmailCommand).resolves({ MessageId: "test-message-id" });

  const result = await handler();

  if (!result || result.statusCode >= 400) {
    throw new Error("BestellService Test fehlgeschlagen");
  }

  console.log("✅ Test OK", result);
}

runTest().catch((e) => {
  console.error("❌ Test FAIL", e);
  process.exit(1);
});
