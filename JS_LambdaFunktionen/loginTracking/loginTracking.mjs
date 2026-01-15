// Diese Lambda-Funktion dient zur Aktualisierung der Nutzeraktivität in der Datenbank.
// Sobald sich ein Nutzer einloggt oder den Automaten nutzt, wird dieser Service aufgerufen,
// um den Zeitstempel "last_check_in" in der DynamoDB-Tabelle "Members" zu aktualisieren.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // Importiert den Basis-Client für die DynamoDB-Verbindung
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb"; // Importiert Tools für den DocumentClient und Update-Befehle

// Initialisierung des Standard-DynamoDB-Clients
const client = new DynamoDBClient({}); 

// Erstellung eines Document-Clients zur einfacheren Verarbeitung von JavaScript-Objekten
const docClient = DynamoDBDocumentClient.from(client); 

// Der Handler verarbeitet das eingehende Event (z.B. vom API Gateway)
export const handler = async (event) => {
    // Versucht die cognitoId entweder direkt aus dem Event oder aus dem JSON-Body des Requests zu extrahieren
    const userSub = event.cognitoId || (event.body ? JSON.parse(event.body).cognitoId : null);

    // Validierung: Wenn keine ID übermittelt wurde, wird der Vorgang mit einer Fehlermeldung abgebrochen
    if (!userSub) {
        return { 
            statusCode: 400, // HTTP-Status für "Bad Request"
            body: JSON.stringify({ message: "Fehler: cognitoId fehlt im Event!" }) 
        };
    }

    try {
        // Erzeugt einen aktuellen Zeitstempel im ISO-Format (z.B. 2026-01-03T15:00:00Z)
        const now = new Date().toISOString();

        // Bereitet den Update-Befehl für einen bestehenden Datensatz vor
        const command = new UpdateCommand({
            TableName: "Members", // Ziel-Tabelle in DynamoDB
            Key: {
                "cognito_sub": userSub // Suchschlüssel, um das richtige Mitglied zu finden
            },
            // Definiert, welches Attribut geändert werden soll (SET-Operation)
            UpdateExpression: "SET last_check_in = :t",
            // Platzhalter für den eigentlichen Wert des Zeitstempels
            ExpressionAttributeValues: {
                ":t": now
            }
        });

        // Sendet das Update an die DynamoDB und wartet auf die Ausführung
        await docClient.send(command);

        // Rückgabe einer Erfolgsmeldung an den Aufrufer (Frontend/Admin-Dashboard)
        return {
            statusCode: 200, // HTTP-Status für "OK"
            body: JSON.stringify({ 
                message: "Zeitstempel erfolgreich aktualisiert!", 
                updatedUser: userSub 
            })
        };
    } catch (error) {
        // Fehlerbehandlung: Protokolliert den Fehler in CloudWatch
        console.error("Datenbank-Fehler:", error);
        
        // Rückgabe einer Fehlermeldung bei Systemproblemen
        return { 
            statusCode: 500, // HTTP-Status für "Internal Server Error"
            body: JSON.stringify({ error: error.message }) 
        };
    }
};
