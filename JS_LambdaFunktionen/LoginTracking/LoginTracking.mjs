// Diese Lambda-Funktion dient als Cognito Post-Authentication Trigger.
// Sie aktualisiert den Zeitstempel "last_check_in" in der Tabelle "Members",
// sobald sich ein Nutzer erfolgreich eingeloggt hat.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({}); 
const docClient = DynamoDBDocumentClient.from(client); 

export const handler = async (event) => {
    // ID im Pfad: event.request.userAttributes.sub
    const userSub = event.request.userAttributes.sub;

    // Falls die Funktion per API Gateway getestet wird
    const finalSub = userSub || (event.cognitoId) || (event.body ? JSON.parse(event.body).cognitoId : null);

    if (!finalSub) {
        console.error("Keine User-ID gefunden!");
        return event; // Das Event wird zurückgeben, damit Cognito nicht blockiert
    }

    try {
        const now = new Date().toISOString();

        const command = new UpdateCommand({
            TableName: "Members",
            Key: {
                "cognito_sub": finalSub
            },
            UpdateExpression: "SET last_check_in = :t",
            ExpressionAttributeValues: {
                ":t": now
            }
        });

        await docClient.send(command);
        console.log(`Login-Check-In erfolgreich für User: ${finalSub}`);

        // Rückgabe des ursprünglichen Event-Objekts
        return event; 

    } catch (error) {
        console.error("Datenbank-Fehler beim Login-Tracking:", error);
        
        // Auch im Fehlerfall das Event zurückgeben, damit der Nutzer sich trotzdem einloggen kann
        return event; 
    }
};
