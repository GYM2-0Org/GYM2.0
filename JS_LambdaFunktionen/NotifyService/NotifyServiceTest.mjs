// NotifyServiceTest.mjs
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

/* -------------------------
   Helpers
-------------------------- */
function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/* -------------------------
   Mock Data (DynamoDB low-level format)
-------------------------- */
const inactiveMember = {
  v_name: { S: "Max" },
  last_check_in: { S: daysAgo(45) },
};

const activeMember = {
  v_name: { S: "Anna" },
  last_check_in: { S: daysAgo(10) },
};

const ddbMock = mockClient(DynamoDBClient);
const sesMock = mockClient(SESClient);

async function runTest() {
  /* 1) Keine Members */
  {
    ddbMock.reset();
    sesMock.reset();

    ddbMock.on(ScanCommand).resolves({ Items: [] });

    // Wenn trotzdem Mail gesendet wird -> Test soll failen
    sesMock.on(SendEmailCommand).callsFake(() => {
      throw new Error("Test 1 fehlgeschlagen: Keine Mail erwartet");
    });

    const { handler } = await import("./NotifyService.mjs");
    await handler({});
  }

  /* 2) Aktiver Member */
  {
    ddbMock.reset();
    sesMock.reset();

    ddbMock.on(ScanCommand).resolves({ Items: [activeMember] });

    sesMock.on(SendEmailCommand).callsFake(() => {
      throw new Error("Test 2 fehlgeschlagen: Keine Mail bei aktivem Member");
    });

    const { handler } = await import("./NotifyService.mjs");
    await handler({});
  }

  /* 3) Inaktiver Member */
  {
    ddbMock.reset();
    sesMock.reset();

    ddbMock.on(ScanCommand).resolves({ Items: [inactiveMember] });
    sesMock.on(SendEmailCommand).resolves({ MessageId: "msg-1" });

    const { handler } = await import("./NotifyService.mjs");
    await handler({});

    const calls = sesMock.commandCalls(SendEmailCommand).length;
    if (calls !== 1) {
      throw new Error("Test 3 fehlgeschlagen: Genau eine Mail erwartet");
    }
  }

  /* 4) Fehlende Felder */
  {
    ddbMock.reset();
    sesMock.reset();

    ddbMock.on(ScanCommand).resolves({ Items: [{}] });

    sesMock.on(SendEmailCommand).callsFake(() => {
      throw new Error("Test 4 fehlgeschlagen: Ungültige Member müssen übersprungen werden");
    });

    const { handler } = await import("./NotifyService.mjs");
    await handler({});
  }

    /* 5) SES Fehler */
  {
    ddbMock.reset();
    sesMock.reset();

    ddbMock.on(ScanCommand).resolves({ Items: [inactiveMember] });
    sesMock.on(SendEmailCommand).rejects(new Error("SES down"));

    const { handler } = await import("./NotifyService.mjs");

    let threw = false;
    try {
      await handler({});
    } catch (e) {
      threw = true;
      if (!String(e.message).includes("SES down")) {
        throw new Error("Test 5 fehlgeschlagen: falscher Fehler");
      }
    }

    if (!threw) {
      throw new Error("Test 5 fehlgeschlagen: SES Fehler muss auftreten");
    }
  }


  console.log(" Test OK");
}

runTest().catch((e) => {
  console.error(" Test FAIL", e);
  process.exit(1);
});
