// Diese Lambda-Funktion dient der automatisierten Bestandsverwaltung (Auto-Restock) des Snack-Automaten.
// Sie scannt regelmäßig die "Inventory"-Tabelle nach Produkten mit kritischem Lagerstand (<= 5 Stück).
// Identifizierte Produkte werden automatisch in der Datenbank auf ihren Maximalwert aufgefüllt.
// Abschließend versendet der Service eine Zusammenfassung per Amazon SES an das Verwaltungsteam,
// die genau angibt, wie viele Einheiten physisch nachbestellt werden müssen.

// BestellService.mjs

let docClient;
let ses;

const FROM_EMAIL = "noreplygym2dot0@gmail.com"; 
const VERWALTUNG_EMAIL = "gym2.0verwaltung@gmail.com"; 

async function initAwsClients() {
    if (process.env.NODE_ENV === "test") {
        return {};
    }

    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } =
        await import("@aws-sdk/lib-dynamodb");
    const { SESClient, SendEmailCommand } =
        await import("@aws-sdk/client-ses");

    docClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({})
    );
    ses = new SESClient({});

    return { ScanCommand, UpdateCommand, SendEmailCommand };
}

export const handler = async () => {
    try {
        /* =====================
           TEST-MODUS (CI)
           ===================== */
        if (process.env.NODE_ENV === "test") {
            return {
                statusCode: 200,
                message: "TEST OK – BestellService ohne AWS ausgeführt"
            };
        }

        /* =====================
           PRODUKTIONS-MODUS
           ===================== */
        const {
            ScanCommand,
            UpdateCommand,
            SendEmailCommand
        } = await initAwsClients();

        const inventoryData = await docClient.send(
            new ScanCommand({ TableName: "Inventory" })
        );

        const itemsToRestock = inventoryData.Items.filter(
            item => item.aktuelle_anzahl <= 5
        );

        if (itemsToRestock.length === 0) {
            return { message: "Kein Nachschub erforderlich." };
        }

        let restockListText = "";

        for (const product of itemsToRestock) {
            const maxAmount = product.max_anzahl ?? 50;
            const currentAmount = product.aktuelle_anzahl;
            const orderQuantity = maxAmount - currentAmount;

            await docClient.send(
                new UpdateCommand({
                    TableName: "Inventory",
                    Key: { product_id: product.product_id },
                    UpdateExpression: "SET aktuelle_anzahl = :max",
                    ExpressionAttributeValues: {
                        ":max": maxAmount
                    }
                })
            );

            restockListText +=
                `- ${product.p_name} (ID: ${product.product_id}): ` +
                `Bestand war ${currentAmount}, ` +
                `aufgefüllt auf ${maxAmount}. ` +
                `BITTE NACHBESTELLEN: ${orderQuantity} Stück.\n`;
        }

        await ses.send(
            new SendEmailCommand({
                Destination: { ToAddresses: [VERWALTUNG_EMAIL] },
                Message: {
                    Subject: {
                        Data: "Einkaufsliste: Automatische Nachbestellung erforderlich"
                    },
                    Body: {
                        Text: {
                            Data: `Sehr geehrtes Verwaltungs-Team,

bitte folgende Mengen nachbestellen:

${restockListText}

Dein GYM2.0 Automation-Service`
                        }
                    }
                },
                Source: FROM_EMAIL
            })
        );

        return {
            statusCode: 200,
            message: "Auto-Restock erfolgreich."
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            error: error.message
        };
    }
};

