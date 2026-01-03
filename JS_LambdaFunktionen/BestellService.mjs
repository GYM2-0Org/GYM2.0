// Diese Lambda-Funktion dient der automatisierten Bestandsverwaltung (Auto-Restock) des Snack-Automaten.
// Sie scannt regelmäßig die "Inventory"-Tabelle nach Produkten mit kritischem Lagerstand (<= 5 Stück).
// Identifizierte Produkte werden automatisch in der Datenbank auf ihren Maximalwert aufgefüllt.
// Abschließend versendet der Service eine Zusammenfassung per Amazon SES an das Verwaltungsteam,
// damit die physische Nachbestellung in die Wege geleitet werden kann.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // Importiert den Basis-Client für die DynamoDB-Verbindung
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"; // Importiert Tools für Tabellen-Scans und gezielte Updates
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"; // Importiert den Client für den E-Mail-Versand via Amazon SES

// Initialisierung der AWS-Clients (DocumentClient für vereinfachtes Datenhandling)
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({})); 
const ses = new SESClient({});

// Konfiguration der E-Mail-Adressen (In SES verifiziert)
const FROM_EMAIL = "noreply@gym2dot0.com"; 
const VERWALTUNG_EMAIL = "verwaltung@gym2dot0.com"; 

// Der Handler führt den Bestands-Check und den anschließenden Benachrichtigungsprozess aus
export const handler = async () => {
    try {
        // 1) Liest den gesamten aktuellen Warenbestand aus der Tabelle "Inventory" ein
        const inventoryData = await docClient.send(new ScanCommand({
            TableName: "Inventory"
        }));

        // 2) Filtert Produkte heraus, deren aktuelle Anzahl den Schwellenwert von 5 unterschreitet
        const itemsToRestock = inventoryData.Items.filter(item => 
            item.aktuelle_anzahl <= 5 
        );

        // Falls alle Bestände ausreichend sind, wird der Prozess hier beendet
        if (itemsToRestock.length === 0) {
            console.log("Bestände sind ausreichend. Keine Nachbestellung nötig.");
            return { message: "Kein Nachschub erforderlich." };
        }

        let restockListText = ""; // Variable zum Sammeln der aufgefüllten Artikel für den E-Mail-Text

        // 3) Iteriert durch alle kritischen Produkte, um sie in der DB zu aktualisieren
        for (const product of itemsToRestock) {
            const newAmount = product.max_anzahl || 50; // Nutzt den hinterlegten Max-Wert oder Standard (50)

            // Führt das Update für das spezifische Produkt in der DynamoDB aus
            await docClient.send(new UpdateCommand({
                TableName: "Inventory",
                Key: { "product_id": product.product_id }, // Identifikation über die eindeutige Produkt-ID
                UpdateExpression: "SET aktuelle_anzahl = :max",
                ExpressionAttributeValues: {
                    ":max": newAmount 
                }
            }));

            // Dokumentiert die Änderung für die E-Mail-Zusammenfassung
            restockListText += `- ${product.p_name} (ID: ${product.product_id}): Auf ${newAmount} Stück aufgefüllt.\n`;
            console.log(`Produkt ${product.p_name} wurde aufgefüllt.`);
        }

        // 4) Versendet die Benachrichtigung an das Produktverwaltungs-Team via SES
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

        // Gibt eine Erfolgsmeldung für das CloudWatch-Monitoring zurück
        return { 
            statusCode: 200, 
            message: "Auto-Restock und Produktverwaltung-Benachrichtigung erfolgreich abgeschlossen." 
        };

    } catch (error) {
        // Fehlerbehandlung: Protokolliert auftretende Fehler beim DB-Zugriff oder E-Mail-Versand
        console.error("Fehler beim Auto-Restock Job:", error);
        return { statusCode: 500, error: error.message };
    }
};
