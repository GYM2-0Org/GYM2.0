// CheckUserpoolTest.mjs
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const docMock = mockClient(DynamoDBDocumentClient);

/* -------------------------
   Base Event
-------------------------- */
function baseEvent(overrides = {}) {
  return {
    request: {
      userAttributes: {
        sub: "cognito-sub-123",
        email: "test@example.com",
        given_name: "Max",
        family_name: "Mustermann",
        "custom:Street": "Teststraße",
        "custom:House-number": "1",
        "custom:Postal-Code": "12345",
        "custom:City": "Teststadt",
        ...overrides,
      },
    },
  };
}

async function runTest() {
  /* 1) Fehlende userAttributes */
  {
    docMock.reset();
    // Wenn hier trotzdem PutCommand kommt -> Test soll failen
    docMock.on(PutCommand).callsFake(() => {
      throw new Error("PutCommand darf hier nicht aufgerufen werden");
    });

    const { handler } = await import("./checkUserpool.mjs");

    const event = { request: {} };
    const res = await handler(event);

    if (res !== event) {
      throw new Error("Test 1 fehlgeschlagen: Event muss unverändert zurückgegeben werden");
    }
  }

  /* 2) Fehlende Pflichtfelder */
  {
    docMock.reset();
    docMock.on(PutCommand).callsFake(() => {
      throw new Error("PutCommand darf hier nicht aufgerufen werden");
    });

    const { handler } = await import("./checkUserpool.mjs");

    const event = baseEvent({ sub: undefined });
    const res = await handler(event);

    if (res !== event) {
      throw new Error("Test 2 fehlgeschlagen: Ungültige Attribute");
    }
  }

  /* 3) Erfolgreiches Schreiben */
  {
    docMock.reset();

    // PutCommand soll passieren
    docMock.on(PutCommand).resolves({});

    const { handler } = await import("./checkUserpool.mjs");

    const event = baseEvent();
    const res = await handler(event);

    // Prüfen, dass PutCommand wirklich gerufen wurde
    if (docMock.commandCalls(PutCommand).length < 1) {
      throw new Error("Test 3 fehlgeschlagen: PutCommand wurde nicht aufgerufen");
    }

    if (res !== event) {
      throw new Error("Test 3 fehlgeschlagen: Event nicht zurückgegeben");
    }
  }

  /* 4) DynamoDB-Fehler */
  {
    docMock.reset();

    docMock.on(PutCommand).rejects(new Error("DynamoDB down"));

    const { handler } = await import("./checkUserpool.mjs");

    const event = baseEvent();
    const res = await handler(event);

    if (res !== event) {
      throw new Error("Test 4 fehlgeschlagen: Event muss trotz Fehler zurückgegeben werden");
    }
  }

  console.log(" Test OK");
}

runTest().catch((e) => {
  console.error(" Test FAIL", e);
  process.exit(1);
});
