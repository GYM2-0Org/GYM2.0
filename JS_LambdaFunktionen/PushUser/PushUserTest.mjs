// PushUserTest.mjs
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const docMock = mockClient(DynamoDBDocumentClient);

async function runTest() {
  /* 1) Fehlende ID */
  {
    docMock.reset();
    const { handler } = await import("./PushUser.mjs");

    const res = await handler({ body: "{}" });

    if (res.statusCode !== 400) {
      throw new Error("Test 1 fehlgeschlagen: ID fehlt");
    }
  }

  /* 2) Keine gültigen Felder */
  {
    docMock.reset();
    const { handler } = await import("./PushUser.mjs");

    const res = await handler({
      body: JSON.stringify({
        cognito_sub: "abc123",
        foo: "bar",
      }),
    });

    if (res.statusCode !== 400) {
      throw new Error("Test 2 fehlgeschlagen: Ungültige Felder müssen abgelehnt werden");
    }
  }

  /* 3) Gültiges Teil-Update */
  {
    docMock.reset();

    // UpdateCommand muss aufgerufen werden + Expression prüfen
    docMock.on(UpdateCommand).callsFake((input) => {
      // input ist das Command-Input-Objekt (entspricht cmd.input)
      if (!input.UpdateExpression || !input.UpdateExpression.includes("v_name")) {
        throw new Error("UpdateExpression falsch");
      }
      return {};
    });

    const { handler } = await import("./PushUser.mjs");

    const res = await handler({
      body: JSON.stringify({
        cognito_sub: "abc123",
        v_name: "Max",
        city: "Berlin",
      }),
    });

    if (docMock.commandCalls(UpdateCommand).length < 1) {
      throw new Error("Test 3 fehlgeschlagen: Update wurde nicht ausgeführt");
    }

    if (res.statusCode !== 200) {
      throw new Error("Test 3 fehlgeschlagen: Erfolg erwartet");
    }
  }

  /* 4) DynamoDB Fehler */
  {
    docMock.reset();
    docMock.on(UpdateCommand).rejects(new Error("Dynamo down"));

    const { handler } = await import("./PushUser.mjs");

    const res = await handler({
      body: JSON.stringify({
        cognito_sub: "abc123",
        v_name: "Max",
      }),
    });

    if (res.statusCode !== 500) {
      throw new Error("Test 4 fehlgeschlagen: Fehler muss 500 liefern");
    }
  }

  console.log(" Test OK");
}

runTest().catch((e) => {
  console.error(" Test FAIL", e);
  process.exit(1);
});
