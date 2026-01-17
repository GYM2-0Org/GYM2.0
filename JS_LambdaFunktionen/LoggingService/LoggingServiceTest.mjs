import { handler, __setClients } from "./LoggingService.mjs";

/* -------------------------
   Mock Factories
-------------------------- */
function createMockDocClient(itemsOrError) {
    return {
        send: async () => {
            if (itemsOrError instanceof Error) {
                throw itemsOrError;
            }
            return { Items: itemsOrError };
        }
    };
}

function createMockS3(expectBodyCheck = null, error = null) {
    return {
        send: async (command) => {
            if (error) {
                throw error;
            }

            if (expectBodyCheck) {
                expectBodyCheck(command.input.Body);
            }

            return {};
        }
    };
}

/* -------------------------
   Tests
-------------------------- */
export async function runTest() {

    /* 1) Keine Orders */
    {
        __setClients({
            docClient: createMockDocClient([]),
            s3: createMockS3((body) => {
                if (!body.startsWith("order_id,")) {
                    throw new Error("CSV-Header fehlt");
                }
            })
        });

        const res = await handler();

        if (res.statusCode !== 200) {
            throw new Error("Test 1 fehlgeschlagen: statusCode != 200");
        }
    }

    /* 2) Mehrere Orders → korrektes CSV */
    {
        const orders = [
            {
                order_id: "1",
                produkt_id: "A",
                p_name: "Cola",
                preis: 2,
                member_id: "M1",
                order_date: "2024-01-01"
            },
            {
                order_id: "2",
                produkt_id: "B",
                p_name: "Fanta",
                preis: 2.5,
                member_id: "M2",
                order_date: "2024-01-02"
            }
        ];

        __setClients({
            docClient: createMockDocClient(orders),
            s3: createMockS3((body) => {
                if (!body.includes("Cola,2,M1")) {
                    throw new Error("CSV-Inhalt fehlerhaft");
                }
                if (!body.includes("Fanta,2.5,M2")) {
                    throw new Error("CSV-Inhalt fehlerhaft");
                }
            })
        });

        const res = await handler();

        if (res.statusCode !== 200 || !res.file.endsWith(".csv")) {
            throw new Error("Test 2 fehlgeschlagen: CSV-Export");
        }
    }

    /* 3) DynamoDB-Fehler */
    {
        __setClients({
            docClient: createMockDocClient(
                new Error("DynamoDB down")
            ),
            s3: createMockS3()
        });

        const res = await handler();

        if (res.statusCode !== 500) {
            throw new Error("Test 3 fehlgeschlagen: DynamoDB-Fehler");
        }
    }

    /* 4) S3-Fehler */
    {
        __setClients({
            docClient: createMockDocClient([]),
            s3: createMockS3(null,
                new Error("S3 unavailable")
            )
        });

        const res = await handler();

        if (res.statusCode !== 500) {
            throw new Error("Test 4 fehlgeschlagen: S3-Fehler");
        }
    }

    return { statusCode: 200 };
}
