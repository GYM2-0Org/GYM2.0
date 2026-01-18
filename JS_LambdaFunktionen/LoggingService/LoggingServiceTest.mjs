// LoggingServiceTest.mjs
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const docMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

function assertNotErrorResponse(res, msg) {
  if (res && typeof res.statusCode === "number" && res.statusCode >= 400) {
    throw new Error(msg);
  }
}

async function runTest() {
  /* 1) Keine Orders */
  {
    docMock.reset();
    s3Mock.reset();

    docMock.on(ScanCommand).resolves({ Items: [] });

    s3Mock.on(PutObjectCommand).callsFake((input) => {
      const body = input?.Body?.toString?.() ?? String(input?.Body ?? "");
      if (!body.startsWith("order_id,")) {
        throw new Error("CSV-Header fehlt");
      }
      return {};
    });

    const { handler } = await import("./LoggingService.mjs");
    const res = await handler();

    // ✅ akzeptiert auch "kein statusCode", solange kein Fehlerstatus
    assertNotErrorResponse(res, "Test 1 fehlgeschlagen: unerwarteter Fehlerstatus");
  }

  /* 2) Mehrere Orders → korrektes CSV */
  {
    docMock.reset();
    s3Mock.reset();

    const orders = [
      { order_id: "1", produkt_id: "A", p_name: "Cola", preis: 2, member_id: "M1", order_date: "2024-01-01" },
      { order_id: "2", produkt_id: "B", p_name: "Fanta", preis: 2.5, member_id: "M2", order_date: "2024-01-02" },
    ];

    docMock.on(ScanCommand).resolves({ Items: orders });

    s3Mock.on(PutObjectCommand).callsFake((input) => {
      const body = input?.Body?.toString?.() ?? String(input?.Body ?? "");
      if (!body.includes("Cola,2,M1")) {
        throw new Error("CSV-Inhalt fehlerhaft (Cola)");
      }
      if (!body.includes("Fanta,2.5,M2")) {
        throw new Error("CSV-Inhalt fehlerhaft (Fanta)");
      }
      return {};
    });

    const { handler } = await import("./LoggingService.mjs");
    const res = await handler();

    // ✅ akzeptiert auch fehlendes statusCode
    assertNotErrorResponse(res, "Test 2 fehlgeschlagen: unerwarteter Fehlerstatus");

    // Falls eure Lambda ein file zurückgibt, prüfen wir es – wenn nicht, ist es auch ok
    if (res?.file && !res.file.endsWith(".csv")) {
      throw new Error("Test 2 fehlgeschlagen: file endet nicht auf .csv");
    }
  }

  /* 3) DynamoDB-Fehler */
  {
    docMock.reset();
    s3Mock.reset();

    docMock.on(ScanCommand).rejects(new Error("DynamoDB down"));
    s3Mock.on(PutObjectCommand).resolves({});

    const { handler } = await import("./LoggingService.mjs");
    let res;
    try {
      res = await handler();
    } catch (e) {
      // Falls eure Lambda wirft statt 500 zu returnen, akzeptieren wir das auch
      if (!String(e.message).includes("DynamoDB down")) {
        throw e;
      }
      res = { statusCode: 500 };
    }

    if (!res || res.statusCode !== 500) {
      throw new Error("Test 3 fehlgeschlagen: DynamoDB-Fehler");
    }
  }

  /* 4) S3-Fehler */
  {
    docMock.reset();
    s3Mock.reset();

    docMock.on(ScanCommand).resolves({ Items: [] });
    s3Mock.on(PutObjectCommand).rejects(new Error("S3 unavailable"));

    const { handler } = await import("./LoggingService.mjs");
    let res;
    try {
      res = await handler();
    } catch (e) {
      if (!String(e.message).includes("S3 unavailable")) {
        throw e;
      }
      res = { statusCode: 500 };
    }

    if (!res || res.statusCode !== 500) {
      throw new Error("Test 4 fehlgeschlagen: S3-Fehler");
    }
  }

  console.log(" Test OK");
}

runTest().catch((e) => {
  console.error(" Test FAIL", e);
  process.exit(1);
});
