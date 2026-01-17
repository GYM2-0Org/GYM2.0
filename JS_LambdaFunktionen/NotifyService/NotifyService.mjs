/*
NotifyService
Liest alle Member aus der Tabelle aus und informiert inaktive Mitglieder.
Im SES-Sandbox-Modus wird ausschließlich an eine verifizierte Testadresse gesendet.
*/

import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const REGION = "eu-north-1";

const db = new DynamoDBClient({ region: REGION });
const ses = new SESClient({ region: REGION });

const FROM = "noreplygym2dot0@gmail.com";
const TEST_RECEIVER = "gym2.0verwaltung@gmail.com";
const INACTIVITY_DAYS = 30;


export const handler = async (event) => {
    console.log("NotifyService gestartet", event?.id ?? "manuell");

    const today = new Date();

    // 1) Alle Member lesen
    const result = await db.send(
        new ScanCommand({
            TableName: "Members"
        })
    );

    for (const item of result.Items ?? []) {
        // Pflichtfelder defensiv prüfen
        if (!item.last_check_in?.S || !item.v_name?.S) continue;

        const name = item.v_name.S;
        const lastCheckIn = new Date(item.last_check_in.S);

        const diffDays =
            (today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24);

        // nur wenn länger als X Tage inaktiv
        if (diffDays <= INACTIVITY_DAYS) continue;

        console.log(`Inaktives Mitglied gefunden: ${name} (${diffDays.toFixed(1)} Tage)`);

        // 2) E-Mail senden (Sandbox → Testadresse!)
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
        body: JSON.stringify({ message: "NotifyService erfolgreich ausgeführt" })
    };
};
