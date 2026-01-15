// Diese Lambda-Funktion ermöglicht ein Teil-Update von Mitgliedsdaten.
// Sie erlaubt es, gezielt einzelne Felder wie Name oder Anschrift in der "Members"-Tabelle 
// zu ändern, ohne den gesamten Datensatz überschreiben zu müssen.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // Importiert den Basis-Client für die DynamoDB-Verbindung
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb"; // Importiert Tools für den DocumentClient und dynamische Update-Befehle

// Initialisierung des Standard-DynamoDB-Clients
const client = new DynamoDBClient({}); 

// Erstellung eines Document-Clients zur einfacheren Verarbeitung von JavaScript-Objekten
const docClient = DynamoDBDocumentClient.from(client); 

// Der Handler verarbeitet das eingehende Event (z.B. eine Profiländerung vom Frontend)
export const handler = async (event) => {
    // Prüft, ob das Event als JSON-String (über API Gateway) oder direkt als Objekt ankommt
    const data = typeof event.body === 'string' ? JSON.parse(event.body) : event;

    // Validierung: Ohne die cognito_sub (ID) kann kein Datensatz zugeordnet werden
    if (!data.cognito_sub) {
        return { statusCode: 400, body: JSON.stringify({ message: "ID fehlt" }) };
    }

    // Sicherheitsliste: Nur diese Felder dürfen vom Nutzer oder Admin geändert werden
    const allowedFields = ["v_name", "n_name", "strasse", "haus_nr", "plz", "city"];
    
    // Initialisierung der Variablen für den dynamischen Update-Befehl
    let updateExpression = "SET"; // Startet den DynamoDB Update-String
    let expressionAttributeNames = {}; // Platzhalter für Feldnamen (um reservierte Wörter zu umgehen)
    let expressionAttributeValues = {}; // Platzhalter für die tatsächlichen Werte

    // Filtert alle Keys aus der Anfrage, die in der Erlaubnisliste (allowedFields) stehen
    const fieldsToUpdate = Object.keys(data).filter(key => allowedFields.includes(key));

    // Falls keine gültigen Felder mitgesendet wurden, wird die Anfrage abgebrochen
    if (fieldsToUpdate.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ message: "Keine gültigen Felder zum Ändern gefunden" }) };
    }

    // Baut dynamisch den Update-String und die Platzhalter-Objekte zusammen
    fieldsToUpdate.forEach((key, index) => {
        updateExpression += ` #${key} = :val${index},`; // Fügt z.B. "#v_name = :val0," hinzu
        expressionAttributeNames[`#${key}`] = key; // Mappt Platzhalter auf echten Feldnamen
        expressionAttributeValues[`:val${index}`] = data[key]; // Mappt Platzhalter auf den neuen Wert
    });

    // Entfernt das letzte Komma am Ende des Update-Strings
    updateExpression = updateExpression.slice(0, -1);

    try {
        // Erstellt den Update-Befehl mit den dynamisch generierten Ausdrücken
        const command = new UpdateCommand({
            TableName: "Members", // Ziel-Tabelle in DynamoDB
            Key: { "cognito_sub": data.cognito_sub }, // Identifiziert das Mitglied via ID
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "UPDATED_NEW" // Gibt nur die geänderten Werte als Bestätigung zurück
        });

        // Führt das Update in der Datenbank aus
        await docClient.send(command);
        
        // Rückgabe einer Erfolgsmeldung
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Teil-Update erfolgreich" })
        };
    } catch (error) {
        // Protokolliert den Fehler (z.B. falsche Berechtigungen oder Tabellenname)
        console.error(error);
        
        // Rückgabe einer Fehlermeldung bei Datenbank-Problemen
        return { 
            statusCode: 500, 
            body: JSON.stringify({ message: "Update fehlgeschlagen" }) 
        };
    }
};
