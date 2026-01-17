import { handler, __setDocClient } from "./CheckProducts.mjs";

/* -------------------------
   Mock Factory
-------------------------- */
function createMockDocClient(response) {
    return {
        send: async () => {
            if (response instanceof Error) {
                throw response;
            }
            return response;
        }
    };
}

/* -------------------------
   Tests
-------------------------- */
export async function runTest() {

    /* 1) Erfolgreicher Scan mit Produkten */
    {
        __setDocClient(createMockDocClient({
            Items: [
                { product_id: "1", p_name: "Cola", preis: 2 },
                { product_id: "2", p_name: "Fanta", preis: 2.5 }
            ]
        }));

        const res = await handler();

        if (res.statusCode !== 200) {
            throw new Error("Test 1 fehlgeschlagen: statusCode != 200");
        }

        const items = JSON.parse(res.body);
        if (items.length !== 2) {
            throw new Error("Test 1 fehlgeschlagen: falsche Anzahl Produkte");
        }
    }

    /* 2) Erfolgreicher Scan ohne Produkte */
    {
        __setDocClient(createMockDocClient({
            Items: []
        }));

        const res = await handler();

        if (res.statusCode !== 200) {
            throw new Error("Test 2 fehlgeschlagen: statusCode != 200");
        }

        const items = JSON.parse(res.body);
        if (!Array.isArray(items) || items.length !== 0) {
            throw new Error("Test 2 fehlgeschlagen: Array leer erwartet");
        }
    }

    /* 3) DynamoDB-Fehler */
    {
        __setDocClient(createMockDocClient(
            new Error("DynamoDB down")
        ));

        const res = await handler();

        if (res.statusCode !== 500) {
            throw new Error("Test 3 fehlgeschlagen: statusCode != 500");
        }
    }

    return { statusCode: 200 };
}
