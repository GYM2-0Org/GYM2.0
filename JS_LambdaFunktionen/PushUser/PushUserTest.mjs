import { handler, __setDocClient } from "./pushUser.mjs";

/* -------------------------
   Tests
-------------------------- */
export async function runTest() {

    /* 1) Fehlende ID */
    {
        const res = await handler({ body: "{}" });

        if (res.statusCode !== 400) {
            throw new Error("Test 1 fehlgeschlagen: ID fehlt");
        }
    }

    /* 2) Keine gültigen Felder */
    {
        const res = await handler({
            body: JSON.stringify({
                cognito_sub: "abc123",
                foo: "bar"
            })
        });

        if (res.statusCode !== 400) {
            throw new Error("Test 2 fehlgeschlagen: Ungültige Felder müssen abgelehnt werden");
        }
    }

    /* 3) Gültiges Teil-Update */
    {
        let updateCalled = false;

        __setDocClient({
            send: async (cmd) => {
                updateCalled = true;

                // Sicherheitscheck: nur erlaubte Felder
                if (!cmd.input.UpdateExpression.includes("v_name")) {
                    throw new Error("UpdateExpression falsch");
                }
            }
        });

        const res = await handler({
            body: JSON.stringify({
                cognito_sub: "abc123",
                v_name: "Max",
                city: "Berlin"
            })
        });

        if (!updateCalled) {
            throw new Error("Test 3 fehlgeschlagen: Update wurde nicht ausgeführt");
        }

        if (res.statusCode !== 200) {
            throw new Error("Test 3 fehlgeschlagen: Erfolg erwartet");
        }
    }

    /* 4) DynamoDB Fehler */
    {
        __setDocClient({
            send: async () => {
                throw new Error("Dynamo down");
            }
        });

        const res = await handler({
            body: JSON.stringify({
                cognito_sub: "abc123",
                v_name: "Max"
            })
        });

        if (res.statusCode !== 500) {
            throw new Error("Test 4 fehlgeschlagen: Fehler muss 500 liefern");
        }
    }

    return { statusCode: 200 };
}
