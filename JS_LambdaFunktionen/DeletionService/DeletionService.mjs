// Diese Lambda-Funktion dient zum Löschen von Mitgliedsdaten aus der Datenbank.
// Sie wird aufgerufen, wenn ein Nutzerkonto entfernt werden soll.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // Importiert den Basis-Client für die DynamoDB-Verbindung
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb"; // Importiert Tools für den DocumentClient und den Lösch-Befehl

// Initialisierung des Standard-DynamoDB-Clients
const client = new DynamoDBClient({}); 

// Erstellung eines Document-Clients zur einfacheren Verarbeitung von JavaScript-Objekten
const docClient = DynamoDBDocumentClient.from(client); 

// Der Handler verarbeitet das eingehende Lösch-Event
export const handler = async (event) => {
  
    // Versucht die cognito_sub (ID) aus verschiedenen Ebenen des Events zu extrahieren
    // (Direktübergabe oder via EventBridge/Post-Deletion-Trigger)
    const sub = event.cognito_sub || event.detail?.responseElements?.sub;

    // Validierung: Ohne die eindeutige ID (Sub) kann kein Löschvorgang durchgeführt werden
    if (!sub) {
        console.error("Fehler: Keine cognito_sub im Event gefunden.");
        return { statusCode: 400, message: "Keine ID vorhanden." };
    }

    try {
        // Bereitet den Delete-Befehl für den spezifischen Datensatz vor
        const command = new DeleteCommand({
            TableName: "Members", // Ziel-Tabelle in DynamoDB
            Key: {
                "cognito_sub": sub // Der Primärschlüssel des zu löschenden Mitglieds
            }
        });

        // Führt den Löschvorgang in der DynamoDB aus
        await docClient.send(command);
        
        // Loggt den Erfolg in CloudWatch für administrative Nachweise
        console.log(`Datenbank-Eintrag für User ${sub} wurde erfolgreich gelöscht.`);
        
        // Rückgabe einer Erfolgsmeldung an das aufrufende System
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Datenbank-Eintrag erfolgreich gelöscht." })
        };

    } catch (error) {
        // Fehlerbehandlung: Protokolliert den Fehler (z.B. Verbindungsprobleme zur DB)
        console.error("Fehler beim Löschen aus DynamoDB:", error);
        
        // Rückgabe einer Fehlermeldung bei Systemproblemen
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Fehler beim Löschen aus der Datenbank." })
        };
    }
};
