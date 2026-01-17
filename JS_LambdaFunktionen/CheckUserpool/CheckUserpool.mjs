// Diese Lambda-Funktion dient als "Post-Confirmation-Trigger" für AWS Cognito.
// Sobald ein Nutzer seine E-Mail bestätigt hat, wird diese Funktion aufgerufen,
// um automatisch ein Profil in der DynamoDB-Tabelle "Members" anzulegen.
// Sie synchronisiert die Identitätsverwaltung (Cognito) mit der Anwendungsdatenbank.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // Importiert den Basis-Client für die DynamoDB-Verbindung
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb"; // Importiert Tools für einfacheres JSON-Handling und Schreibbefehle
import { randomUUID } from "crypto"; // Importiert Modul zur Generierung eindeutiger IDs (UUIDs)

// Initialisierung des Standard-DynamoDB-Clients
const client = new DynamoDBClient({});

// Erstellung eines Document-Clients, um JavaScript-Objekte direkt ohne Typ-Angaben (S, N, etc.) zu speichern
const docClient = DynamoDBDocumentClient.from(client);

// Der Handler ist der Einstiegspunkt, den AWS aufruft, wenn das Event (Nutzerbestätigung) eintritt
export const handler = async (event) => {
    // Extrahiert die Nutzerdaten (E-Mail, Name, etc.) aus dem Cognito-Event-Objekt
    const attributes = event.request.userAttributes;

    try {
        // Erstellt einen neuen Put-Befehl, um Daten in eine Tabelle einzufügen
        const command = new PutCommand({
            TableName: "Members", // Ziel-Tabelle in DynamoDB
            Item: {
                "cognito_sub": attributes.sub,              // Die eindeutige ID des Nutzers aus Cognito
                "v_name": attributes.given_name || "",      // Vorname des Nutzers (Fallback auf leerer String)
                "n_name": attributes.family_name || "",     // Nachname des Nutzers (Fallback auf leerer String)
                "email": attributes.email,                  // Die E-Mail-Adresse des Nutzers
                "strasse": attributes["custom:Street"] || "",        // Standard-Attribut für die Straße
                "haus_nr": attributes["custom:House-number"] || "", // Benutzerdefiniertes Cognito-Attribut für Hausnummer
                "plz": attributes["custom:Postal-Code"] || "",         // Benutzerdefiniertes Cognito-Attribut für Postleitzahl
                "city": attributes["custom:City"] || "",       // Benutzerdefiniertes Cognito-Attribut für die Stadt
                "monats_kosten": 0,                         // Initialwert für die monatlichen Ausgaben
                "last_check_in": "Registriert am " + new Date().toISOString(), // Zeitstempel der Erstanmeldung
                "member_id": randomUUID()                   // Generiert eine zusätzliche interne ID für das Studio
            }
        });

        // Sendet das Item an die DynamoDB und wartet auf den Abschluss (await)
        await docClient.send(command);

        // Log-Ausgabe in CloudWatch zur Überprüfung erfolgreicher Registrierungen
        console.log("Mitglied erfolgreich angelegt. UUID:", attributes.sub);

        // Gibt das Event-Objekt unverändert an Cognito zurück (notwendig für den Erfolg des Triggers)
        return event;

    } catch (error) {
        // Fehlerbehandlung: Protokolliert Fehler beim Schreibvorgang in CloudWatch
        console.error("Fehler beim Schreiben in die Tabelle Members:", error);

        // Gibt das Event trotzdem zurück, damit der Nutzer-Login nicht blockiert wird (Fail-Safe)
        return event;
    }
};
