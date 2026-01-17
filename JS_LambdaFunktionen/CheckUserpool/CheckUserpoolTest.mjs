import { handler, __setDocClient } from "./checkUserpool.mjs";

/* -------------------------
   Mock Factory
-------------------------- */
function createMockDocClient(expectPut = true) {
    return {
        send: async (command) => {
            if (!expectPut) {
                throw new Error("PutCommand darf hier nicht aufgerufen werden");
            }
            return {};
        }
    };
}

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
                ...overrides
            }
        }
    };
}

/* -------------------------
   Tests
-------------------------- */
export async function runTest() {

    /* 1) Fehlende userAttributes */
    {
        __setDocClient(createMockDocClient(false));

        const event = { request: {} };
        const res = await handler(event);

        if (res !== event) {
            throw new Error("Test 1 fehlgeschlagen: Event muss unverändert zurückgegeben werden");
        }
    }

    /* 2) Fehlende Pflichtfelder */
    {
        __setDocClient(createMockDocClient(false));

        const event = baseEvent({ sub: undefined });
        const res = await handler(event);

        if (res !== event) {
            throw new Error("Test 2 fehlgeschlagen: Ungültige Attribute");
        }
    }

    /* 3) Erfolgreiches Schreiben */
    {
        let putCalled = false;

        __setDocClient({
            send: async () => {
                putCalled = true;
                return {};
            }
        });

        const event = baseEvent();
        const res = await handler(event);

        if (!putCalled) {
            throw new Error("Test 3 fehlgeschlagen: PutCommand wurde nicht aufgerufen");
        }

        if (res !== event) {
            throw new Error("Test 3 fehlgeschlagen: Event nicht zurückgegeben");
        }
    }

    /* 4) DynamoDB-Fehler */
    {
        __setDocClient({
            send: async () => {
                throw new Error("DynamoDB down");
            }
        });

        const event = baseEvent();
        const res = await handler(event);

        if (res !== event) {
            throw new Error("Test 4 fehlgeschlagen: Event muss trotz Fehler zurückgegeben werden");
        }
    }

    return { statusCode: 200 };
}
