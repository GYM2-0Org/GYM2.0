import {
    DynamoDBClient,
    ScanCommand
} from "@aws-sdk/client-dynamodb";
import {
    SESClient,
    SendEmailCommand
} from "@aws-sdk/client-ses";

const db = new DynamoDBClient({});
const ses = new SESClient({});

const FROM = "noreply@gym2dot0.com"; // verifizierte SES-Mail

export const handler = async () => {
    const today = new Date();

    // 1) Alle Member lesen
    const result = await db.send(
        new ScanCommand({
            TableName: "Members"
        })
    );

    for (const item of result.Items ?? []) {
        const email = item.email.S;
        const name = item.v_name.S;
        const lastCheckIn = new Date(item.last_check_in.S);

        const diffDays =
            (today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24);

        // nur wenn länger als 30 Tage inaktiv
        if (diffDays <= 30) continue;

        // 2) E-Mail senden
        await ses.send(
            new SendEmailCommand({
                Destination: { ToAddresses: [email] },
                Message: {
                    Subject: { Data: "Kurze Erinnerung" },
                    Body: {
                        Text: {
                            Data: `Hallo ${name},

wir haben gesehen, dass du seit einiger Zeit nicht aktiv warst.
Wir würden uns freuen, dich wiederzusehen.

Viele Grüße
Dein Team GYM2.0`
                        }
                    }
                },
                Source: FROM
            })
        );
    }

    return { statusCode: 200 };
};
