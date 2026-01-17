// Diese Lambda-Funktion dient der automatisierten Bestandsverwaltung (Auto-Restock) des Snack-Automaten.
// Sie scannt regelmäßig die "Inventory"-Tabelle nach Produkten mit kritischem Lagerstand (<= 5 Stück).
// Identifizierte Produkte werden automatisch in der Datenbank auf ihren Maximalwert aufgefüllt.
// Abschließend versendet der Service eine Zusammenfassung per Amazon SES an das Verwaltungsteam,
// die genau angibt, wie viele Einheiten physisch nachbestellt werden müssen.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; 
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"; 
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"; 

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({})); 
const ses = new SESClient({});

// Konfiguration der E-Mail-Adressen (In SES verifiziert)
const FROM_EMAIL = "noreplygym2dot0@gmail.com"; 
const VERWALTUNG_EMAIL = "gym2.0verwaltung@gmail.com"; 

export const handler = async () => {
    try {
        // 1) Liest den aktuellen Warenbestand ein
        const inventoryData = await docClient.send(new ScanCommand({
            TableName: "Inventory"
        }));

        // 2) Filtert Produkte mit Bestand <= 5
        const itemsToRestock = inventoryData.Items.filter(item => 
            item.aktuelle_anzahl <= 5 
        );

        if (itemsToRestock.length === 0) {
            console.log("Bestände sind ausreichend.");
            return { message: "Kein Nachschub erforderlich." };
        }

        let restockListText = ""; 

        // 3) Bestand in DB aktualisieren und Nachbestellmenge berechnen
        for (const product of itemsToRestock) {
            const maxAmount = product.max_anzahl || 50;
            const currentAmount = product.aktuelle_anzahl;
            
            // BERECHNUNG: Differenz für den physischen Einkauf
            const orderQuantity = maxAmount - currentAmount;

            await docClient.send(new UpdateCommand({
                TableName: "Inventory",
                Key: { "product_id": product.product_id }, 
                UpdateExpression: "SET aktuelle_anzahl = :max",
                ExpressionAttributeValues: {
                    ":max": maxAmount 
                }
            }));

            // Dokumentation für die E-Mail mit exakter Nachfüll-Info
            restockListText += `- ${product.p_name} (ID: ${product.product_id}): `;
            restockListText += `Bestand war ${currentAmount}, aufgefüllt auf ${maxAmount}. `;
            restockListText += ⁠ BITTE NACHBESTELLEN: ${orderQuantity} Stück.\n ⁠;
            
            console.log(⁠ Produkt ${product.p_name} aufgefüllt. Bedarf: ${orderQuantity} ⁠);
        }

        // 4) Versand der detaillierten Liste an die Verwaltung
        await ses.send(
            new SendEmailCommand({
                Destination: { ToAddresses: [VERWALTUNG_EMAIL] },
                Message: {
                    Subject: { Data: "Einkaufsliste: Automatische Nachbestellung erforderlich" },
                    Body: {
                        Text: {
                            Data: `Sehr geehrtes Verwaltungs-Team,

der Bestands-Check hat ergeben, dass Produkte im Automaten aufgefüllt werden müssen. 
Bitte besorgen Sie folgende Mengen, um die Fächer wieder komplett zu füllen:

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
            message: "Auto-Restock erfolgreich. Einkaufsliste wurde versendet." 
        };

    } catch (error) {
        console.error("Fehler beim Auto-Restock Job:", error);
        return { statusCode: 500, error: error.message };
    }
};
