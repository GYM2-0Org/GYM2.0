import { handler, __setClients } from "./NotifyService.mjs";

/* -------------------------
   Helpers
-------------------------- */
function daysAgo(days) {
    return new Date(
        Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();
}

/* -------------------------
   Mock Data
-------------------------- */
const inactiveMember = {
    v_name: { S: "Max" },
    last_check_in: { S: daysAgo(45) }
};

const activeMember = {
    v_name: { S: "Anna" },
    last_check_in: { S: daysAgo(10) }
};

/* -------------------------
   Tests
-------------------------- */
export async function runTest() {

    /* 1) Keine Members */
    {
        let mailSent = false;

        __setClients(
            {
                send: async () => ({ Items: [] })
            },
            {
                send: async () => {
                    mailSent = true;
                }
            }
        );

        await handler({});

        if (mailSent) {
            throw new Error("Test 1 fehlgeschlagen: Keine Mail erwartet");
        }
    }

    /* 2) Aktiver Member */
    {
        let mailSent = false;

        __setClients(
            {
                send: async () => ({
                    Items: [activeMember]
                })
            },
            {
                send: async () => {
                    mailSent = true;
                }
            }
        );

        await handler({});

        if (mailSent) {
            throw new Error("Test 2 fehlgeschlagen: Keine Mail bei aktivem Member");
        }
    }

    /* 3) Inaktiver Member */
    {
        let mailCount = 0;

        __setClients(
            {
                send: async () => ({
                    Items: [inactiveMember]
                })
            },
            {
                send: async () => {
                    mailCount++;
                }
            }
        );

        await handler({});

        if (mailCount !== 1) {
            throw new Error("Test 3 fehlgeschlagen: Genau eine Mail erwartet");
        }
    }

    /* 4) Fehlende Felder */
    {
        let mailSent = false;

        __setClients(
            {
                send: async () => ({
                    Items: [{}]
                })
            },
            {
                send: async () => {
                    mailSent = true;
                }
            }
        );

        await handler({});

        if (mailSent) {
            throw new Error("Test 4 fehlgeschlagen: Ungültige Member müssen übersprungen werden");
        }
    }

    /* 5) SES Fehler */
    {
        __setClients(
            {
                send: async () => ({
                    Items: [inactiveMember]
                })
            },
            {
                send: async () => {
                    throw new Error("SES down");
                }
            }
        );

        const res = await handler({});

        if (res.statusCode !== 500) {
            throw new Error("Test 5 fehlgeschlagen: SES Fehler muss 500 liefern");
        }
    }

    return { statusCode: 200 };
}
