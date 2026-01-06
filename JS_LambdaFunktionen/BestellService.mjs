import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; 
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"; 
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"; 

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({})); 
const ses = new SESClient({});

const FROM_EMAIL = "noreply@gym2dot0.com"; 
const VERWALTUNG_EMAIL = "verwaltung@gym2dot0.com"; 

export const handler = async () => {
    try {
        const inventoryData = await docClient.send(new ScanCommand({
            TableName: "Inventory"
        }));

        const itemsToRestock = inventoryData.Items.filter(item => 
            item.aktuelle_anzahl <= 5 
        );

        if (itemsToRestock.length === 0) {
            console.log("Bestände sind ausreichend. Keine Nachbestellung nötig.");
            return { message: "Kein Nachschub erforderlich." };
        }

        let restockListText = ""; 

        for (const product of itemsToRestock) {
            const newAmount = product.max_anzahl || 50; 

            await docClient.send(new UpdateCommand({
                TableName: "Inventory",
                Key: { "product_id": product.product_id },
                UpdateExpression: "SET aktuelle_anzahl = :max",
                ExpressionAttributeValues: {
                    ":max": newAmount 
                }
            }));

            restockListText += `- ${product.p_name} (ID: ${product.product_id}): Auf ${newAmount} Stück aufgefüllt.\n`;
            console.log(`Produkt ${product.p_name} wurde aufgefüllt.`);
        }

        await ses.send(
            new SendEmailCommand({
                Destination: { ToAddresses: [VERWALTUNG_EMAIL] },
                Message: {
                    Subject: { Data: "Automatisches Lager-Update: Nachbestellung erforderlich" },
                    Body: {
                        Text: {
                            Data: `Sehr geehrtes Produktverwaltungs-Team,

folgende Produkte im Automaten haben den Schwellenwert unterschritten und wurden automatisch auf den Maximalwert gesetzt. Diese müssten daher nachbestellt und bis aufs Maximum aufgestockt werden:

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
            message: "Auto-Restock und Produktverwaltung-Benachrichtigung erfolgreich abgeschlossen." 
        };

    } catch (error) {
        console.error("Fehler beim Auto-Restock Job:", error);
        return { statusCode: 500, error: error.message };
    }
};
