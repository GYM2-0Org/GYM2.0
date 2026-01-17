import { handler, __setDocClient } from "./BillService.mjs";

/* -------------------------
   Simple Mock Factory
-------------------------- */
function createMockDocClient(responses) {
    return {
        send: async (command) => {
            const name = command.constructor.name;

            if (!responses[name]) {
                throw new Error(`Unexpected command: ${name}`);
            }

            const res = responses[name];
            if (res instanceof Error) {
                throw res;
            }

            return res;
        }
    };
}

/* -------------------------
   Tests
-------------------------- */
export async function runTest() {

    /* 1) Fehlender Body */
    {
        const res = await handler({});
        if (res.statusCode !== 400) {
            throw new Error("Test 1 fehlgeschlagen: Body fehlt");
        }
    }

    /* 2) Fehlende produkt_id */
    {
        const res = await handler({ body: "{}" });
        if (res.statusCode !== 400) {
            throw new Error("Test 2 fehlgeschlagen: produkt_id fehlt");
        }
    }

    /* 3) Produkt nicht gefunden */
    {
        __setDocClient(createMockDocClient({
            GetCommand: {}
        }));

        const res = await handler({
            body: JSON.stringify({ produkt_id: "X" })
        });

        if (res.statusCode !== 404) {
            throw new Error("Test 3 fehlgeschlagen: Produkt nicht gefunden");
        }
    }

    /* 4) Kein Bestand */
    {
        __setDocClient(createMockDocClient({
            GetCommand: {
                Item: {
                    produkt_id: "A",
                    p_name: "Cola",
                    preis: 2,
                    aktuelle_anzahl: 0
                }
            }
        }));

        const res = await handler({
            body: JSON.stringify({ produkt_id: "A" })
        });

        if (res.statusCode !== 400) {
            throw new Error("Test 4 fehlgeschlagen: Bestand 0");
        }
    }

    /* 5) Erfolgreicher Kauf */
    {
        __setDocClient(createMockDocClient({
            GetCommand: {
                Item: {
                    produkt_id: "B",
                    p_name: "Fanta",
                    preis: 2.5,
                    aktuelle_anzahl: 5
                }
            },
            UpdateCommand: {},
            PutCommand: {}
        }));

        const res = await handler({
            body: JSON.stringify({ produkt_id: "B" })
        });

        if (res.statusCode !== 200) {
            throw new Error("Test 5 fehlgeschlagen: Kauf nicht erfolgreich");
        }

        const order = JSON.parse(res.body);
        if (!order.order_id || order.produkt_id !== "B") {
            throw new Error("Test 5 fehlgeschlagen: Order inkorrekt");
        }
    }

    return { statusCode: 200 };
}
