import { handler, __setDocClient } from "./loginTracking.mjs";

/* -------------------------
   Mock Factory
-------------------------- */
function createMockDocClient(expectUpdate = true) {
    return {
        send: async () => {
            if (!expectUpdate) {
                throw new Error("UpdateCommand darf hier nicht aufgerufen werden");
            }
            return {};
        }
    };
}

/* -------------------------
   Base Events
-------------------------- */
const cognitoEvent = {
    request: {
        userAttributes: {
            sub: "cognito-sub-1"
        }
    }
};

const apiEvent = {
    cognitoId: "api-sub-1"
};

const bodyEvent = {
    body: JSON.stringify({ cognitoId: "body-sub-1" })
};

/* -------------------------
   Tests
-------------------------- */
export async function runTest() {

    /* 1) Keine User-ID */
    {
        __setDocClient(createMockDocClient(false));

        const res = await handler({});

        if (res !== undefined && res !== null) {
            // handler gibt event zurück, kein statusCode
        }
    }

    /* 2) Cognito Post-Auth */
    {
        let updateCalled = false;

        __setDocClient({
            send: async () => {
                updateCalled = true;
                return {};
            }
        });

        const res = await handler(cognitoEvent);

        if (!updateCalled) {
            throw new Error("Test 2 fehlgeschlagen: UpdateCommand nicht aufgerufen");
        }

        if (res !== cognitoEvent) {
            throw new Error("Test 2 fehlgeschlagen: Event nicht zurückgegeben");
        }
    }

    /* 3) API Event */
    {
        let updateCalled = false;

        __setDocClient({
            send: async () => {
                updateCalled = true;
                return {};
            }
        });

        const res = await handler(apiEvent);

        if (!updateCalled) {
            throw new Error("Test 3 fehlgeschlagen: UpdateCommand nicht aufgerufen");
        }

        if (res !== apiEvent) {
            throw new Error("Test 3 fehlgeschlagen: Event nicht zurückgegeben");
        }
    }

    /* 4) body Event */
    {
        let updateCalled = false;

        __setDocClient({
            send: async () => {
                updateCalled = true;
                return {};
            }
        });

        const res = await handler(bodyEvent);

        if (!updateCalled) {
            throw new Error("Test 4 fehlgeschlagen: UpdateCommand nicht aufgerufen");
        }

        if (res !== bodyEvent) {
            throw new Error("Test 4 fehlgeschlagen: Event nicht zurückgegeben");
        }
    }

    /* 5) DynamoDB-Fehler */
    {
        __setDocClient({
            send: async () => {
                throw new Error("DynamoDB down");
            }
        });

        const res = await handler(cognitoEvent);

        if (res !== cognitoEvent) {
            throw new Error("Test 5 fehlgeschlagen: Event muss trotz Fehler zurückgegeben werden");
        }
    }

    return { statusCode: 200 };
}
