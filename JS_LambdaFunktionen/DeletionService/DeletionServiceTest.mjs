// DeletionServiceTest.mjs
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const docMock = mockClient(DynamoDBDocumentClient);

async function runTest() {
  /* 1) Keine cognito_sub */
  {
    docMock.reset();
    // Falls DeleteCommand doch kommt -> egal, Handler sollte vorher 400 liefern
    docMock.on(DeleteCommand).resolves({});

    const { handler } = await import("./DeletionService.mjs");

    const res = await handler({});
    if (res.statusCode !== 400) {
      throw new Error("Test 1 fehlgeschlagen: Keine cognito_sub");
    }
  }

  /* 2) cognito_sub direkt im Event */
  {
    docMock.reset();
    docMock.on(DeleteCommand).resolves({});

    const { handler } = await import("./DeletionService.mjs");

    const res = await handler({ cognito_sub: "sub-123" });

    if (docMock.commandCalls(DeleteCommand).length < 1) {
      throw new Error("Test 2 fehlgeschlagen: DeleteCommand nicht aufgerufen");
    }
    if (res.statusCode !== 200) {
      throw new Error("Test 2 fehlgeschlagen: statusCode != 200");
    }
  }

  /* 3) cognito_sub aus EventBridge-Event */
  {
    docMock.reset();
    docMock.on(DeleteCommand).resolves({});

    const { handler } = await import("./DeletionService.mjs");

    const res = await handler({
      detail: {
        responseElements: {
          sub: "sub-456",
        },
      },
    });

    if (docMock.commandCalls(DeleteCommand).length < 1) {
      throw new Error("Test 3 fehlgeschlagen: DeleteCommand nicht aufgerufen");
    }
    if (res.statusCode !== 200) {
      throw new Error("Test 3 fehlgeschlagen: statusCode != 200");
    }
  }

  /* 4) DynamoDB-Fehler */
  {
    docMock.reset();
    docMock.on(DeleteCommand).rejects(new Error("DynamoDB unavailable"));

    const { handler } = await import("./DeletionService.mjs");

    const res = await handler({ cognito_sub: "sub-error" });

    if (res.statusCode !== 500) {
      throw new Error("Test 4 fehlgeschlagen: statusCode != 500");
    }
  }

  console.log(" Test OK");
}

runTest().catch((e) => {
  console.error(" Test FAIL", e);
  process.exit(1);
});
