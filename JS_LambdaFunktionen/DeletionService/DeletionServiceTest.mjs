import { handler, __setDocClient } from "./DeletionService.mjs";

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

    /* 1) Keine cognito_sub */
    {
        __setDocClient(createMockDocClient({}));

        const res = await handler({});

        if (res.statusCode !== 400) {
            throw new Error("Test 1 fehlgeschlagen: Keine cognito_sub");
        }
    }

    /* 2) cognito_sub direkt im Event */
    {
        let deleteCalled = false;

        __setDocClient({
            send: async () => {
                deleteCalled = true;
                return {};
            }
        });

        const res = await handler({
            cognito_sub: "sub-123"
        });

        if (!deleteCalled) {
            throw new Error("Test 2 fehlgeschlagen: DeleteCommand nicht aufgerufen");
        }

        if (res.statusCode !== 200) {
            throw new Error("Test 2 fehlgeschlagen: statusCode != 200");
        }
    }

    /* 3) cognito_sub aus EventBridge-Event */
    {
        let deleteCalled = false;

        __setDocClient({
            send: async () => {
                deleteCalled = true;
                return {};
            }
        });

        const res = await handler({
            detail: {
                responseElements: {
                    sub: "sub-456"
                }
            }
        });

        if (!deleteCalled) {
            throw new Error("Test 3 fehlgeschlagen: DeleteCommand nicht aufgerufen");
        }

        if (res.statusCode !== 200) {
            throw new Error("Test 3 fehlgeschlagen: statusCode != 200");
        }
    }

    /* 4) DynamoDB-Fehler */
    {
        __setDocClient(createMockDocClient(
            new Error("DynamoDB unavailable")
        ));

        const res = await handler({
            cognito_sub: "sub-error"
        });

        if (res.statusCode !== 500) {
            throw new Error("Test 4 fehlgeschlagen: statusCode != 500");
        }
    }

    return { statusCode: 200 };
}
