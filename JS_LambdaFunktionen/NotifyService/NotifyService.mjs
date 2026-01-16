// NotifyService.mjs
// Informiert inaktive Mitglieder per E-Mail (SES Sandbox)

let db;
let ses;

const REGION = "eu-north-1";

const FROM = "noreplygym2dot0@gmail.com";
const TEST_RECEIVER = "gym2.0verwaltung@gmail.com";
const INACTIVITY_DAYS = 30;

async function initAwsClients() {
    if (process.env.NODE_ENV === "test") {
        return {};
    }

    const {
        DynamoDBClient,
        ScanCommand
    } = await import("@aws-sdk/client-dynamodb");

    const {
        SESClient,
        SendEmailCommand
    } = await import("@aws-sdk/client-ses");

    db = new DynamoDBClient({ region: REGION });
    ses = new SESClient({ region: REGION });

    return { ScanCommand, SendEmailCommand };
}

export const handler = async (event) => {
    try {
        /* =====================
           TEST-MODUS (CI)
           ===================== */
        if (process.env.NODE_ENV === "test") {
            return {
                statusCode: 200,
                message: "TEST OK – NotifyService ohne AWS ausgeführt"
            };
        }

        /* =====================
           PRODUKTIONS-MODUS
           ===================== */
        const {
            ScanCommand,
            SendEmailCommand
        } = await initAwsClients();

        console.log(
            "NotifyService gestartet",
            event?.id ?? "manuell"
        );

        const today = new Date();

        /* 1) Alle Member lesen */
        const result = await db.send(
            new ScanCommand({
                TableName: "Members"
            })
        );

        for (const item of result.Items ?? []) {
            // Pflichtfelder defensiv prüfen (Low-Level-Format!)
            if (!item.last_check_in?.S || !item.v_name?.S) continue;

            const name = item.v_name.S;
            const lastCheckIn = new Date(item.last_check_in.S);

            const diffDays =
                (today.getTime() - lastCheckIn.getTime()) /
                (1000 * 60 * 60 * 24);

            if (diffDays <= INACTIVITY_DAYS) continue;

            console.log(
                `Inaktives Mitglied gefunden: ${name} (${diffDays.toFixed(1)} Tage)`
            );

            /* 2) E-Mail senden (SES Sandbox → Testadresse) */
            await ses.send(
                new SendEmailCommand({
                    Source: FROM,
                    Destination: {
                        ToAddresses: [TEST_RECEIVER]
                    },
                    Message: {
                        Subject: {
                            Data: "Wir vermissen dich im GYM 2.0",
                            Charset: "UTF-8"
                        },
                        Body: {
                            Text: {
                                Data: `Hallo ${name},

wir haben gesehen, dass du seit einiger Zeit nicht mehr im Studio warst.
Komm gerne wieder vorbei – wir freuen uns auf dich!

Viele Grüße
Dein Team GYM 2.0`,
                                Charset: "UTF-8"
                            }
                        }
                    }
                })
            );
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "NotifyService erfolgreich ausgeführt"
            })
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            error: error.message
        };
    }
};
