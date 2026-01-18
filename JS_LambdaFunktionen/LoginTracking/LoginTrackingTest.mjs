// LoginTrackingTest.mjs
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const docMock = mockClient(DynamoDBDocumentClient);

/* -------------------------
   Helpers
-------------------------- */
function withRequest(event = {}) {
  // Damit der Handler NIE an event.request.userAttributes crasht
  return {
    request: { userAttributes: {} },
    ...event,
    request: {
      ...(event.request || {}),
      userAttributes: {
        ...((event.request && event.request.userAttributes) || {}),
      },
    },
  };
}

/* -------------------------
   Base Events
-------------------------- */
const cognitoEvent = withRequest({
  request: { userAttributes: { sub: "cognito-sub-1" } },
});

const apiEvent = withRequest({
  cognitoId: "api-sub-1",
});

const bodyEvent = withRequest({
  body: JSON.stringify({ cognitoId: "body-sub-1" }),
});

async function runTest() {
  /* 1) Keine User-ID */
  {
    docMock.reset();
    docMock.on(UpdateCommand).callsFake(() => {
      throw new Error("UpdateCommand darf hier nicht aufgerufen werden");
    });

    const { handler } = await import("./LoginTracking.mjs");

    // bewusst ohne sub, aber mit request/userAttributes -> kein Crash
    const res = await handler(withRequest({}));

    // Handler gibt Event zurück
    if (!res || !res.request || !res.request.userAttributes) {
      throw new Error("Test 1 fehlgeschlagen: Event-Struktur fehlt");
    }
  }

  /* 2) Cognito Post-Auth */
  {
    docMock.reset();
    docMock.on(UpdateCommand).resolves({});

    const { handler } = await import("./LoginTracking.mjs");
    const res = await handler(cognitoEvent);

    if (docMock.commandCalls(UpdateCommand).length < 1) {
      throw new Error("Test 2 fehlgeschlagen: UpdateCommand nicht aufgerufen");
    }
    if (res !== cognitoEvent) {
      throw new Error("Test 2 fehlgeschlagen: Event nicht zurückgegeben");
    }
  }

  /* 3) API Event */
  {
    docMock.reset();
    docMock.on(UpdateCommand).resolves({});

    const { handler } = await import("./LoginTracking.mjs");
    const event = withRequest({ cognitoId: "api-sub-1" });
    const res = await handler(event);

    if (docMock.commandCalls(UpdateCommand).length < 1) {
      throw new Error("Test 3 fehlgeschlagen: UpdateCommand nicht aufgerufen");
    }
    if (res !== event) {
      throw new Error("Test 3 fehlgeschlagen: Event nicht zurückgegeben");
    }
  }

  /* 4) body Event */
  {
    docMock.reset();
    docMock.on(UpdateCommand).resolves({});

    const { handler } = await import("./LoginTracking.mjs");
    const event = withRequest({ body: JSON.stringify({ cognitoId: "body-sub-1" }) });
    const res = await handler(event);

    if (docMock.commandCalls(UpdateCommand).length < 1) {
      throw new Error("Test 4 fehlgeschlagen: UpdateCommand nicht aufgerufen");
    }
    if (res !== event) {
      throw new Error("Test 4 fehlgeschlagen: Event nicht zurückgegeben");
    }
  }

  /* 5) DynamoDB-Fehler */
  {
    docMock.reset();
    docMock.on(UpdateCommand).rejects(new Error("DynamoDB down"));

    const { handler } = await import("./LoginTracking.mjs");
    const res = await handler(cognitoEvent);

    if (res !== cognitoEvent) {
      throw new Error("Test 5 fehlgeschlagen: Event muss trotz Fehler zurückgegeben werden");
    }
  }

  console.log(" Test OK");
}

runTest().catch((e) => {
  console.error(" Test FAIL", e);
  process.exit(1);
});
