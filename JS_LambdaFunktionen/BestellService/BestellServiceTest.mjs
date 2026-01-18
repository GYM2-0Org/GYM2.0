// BestellServiceTest.mjs
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Mocks VOR dem Import der Lambda initialisieren!
const docMock = mockClient(DynamoDBDocumentClient);
const sesMock = mockClient(SESClient);

async function runTest() {
  docMock.reset();
  sesMock.reset();

  // Scan -> Testdaten (mind. 1 Item <= 5)
  docMock.on(ScanCommand).resolves({
    Items: [
      { product_id: "p-1", p_name: "Protein Bar", aktuelle_anzahl: 3, max_anzahl: 10 },
      { product_id: "p-2", p_name: "Water", aktuelle_anzahl: 8, max_anzahl: 10 },
    ],
  });

  // Update -> ok
  docMock.on(UpdateCommand).resolves({});

  // SES SendEmail -> ok
  sesMock.on(SendEmailCommand).resolves({ MessageId: "test-message-id" });

  //  Handler erst JETZT importieren (damit Mocks schon aktiv sind)
  const { handler } = await import("./BestellService.mjs");

  const result = await handler();

  if (!result || result.statusCode >= 400) {
    throw new Error("BestellService Test fehlgeschlagen");
  }

  console.log(" Test OK", result);
}

runTest().catch((e) => {
  console.error(" Test FAIL", e);
  process.exit(1);
});
