# 1. Frontend-Komponente (HTML, Amplify, Cognito)

## Funktionale Anforderungen
- Als Nutzer möchte ich mich über eine Weboberfläche sicher registrieren und einloggen können (AWS Cognito)
- Als Nutzer möchte ich was kaufen können (Snacks, Getränke, etc.)
- Als Nutzer möchte ich meine Daten jederzeit ändern können
- Als Nutzer möchte ich meine Mitgliedschaft kündigen können
- Als Admin möchte ich meine Gesamteinnahmen sehen
- Als Admin möchte ich Nutzer Benachrichtigen können (Events, Erinnerungen)
- Als Admin möchte ich einen automatisierten Bestellservice am Snackautomaten

## Schnittstellen (Frontend zu AWS Services)
- Frontend <-> API Gateway: Kommunikation erfolgt über RESTful HTTPS-Requests. Alle Anfragen sind mit dem Cognito-JWT im Header signiert.
...............
...............
...............
...............

# 2. Backend-Komponente (Lambda, API Gateway)

## Logik-Spezifikationen
- Authorizer: Das API Gateway validiert das JWT von Cognito, bevor die Lambda-Funktion ausgeführt wird (Security-Layer).
- .............
- .............

## Schnittstellen (API Gateway zu Lambda und umgekehrt)
- API Gateway <-> Lambda: API Gateway triggert (löst aus) die Lambda-Funktion asynchron/synchron und übergibt das event-Objekt inklusive User-Context.
- .............

## API-Endpunkte (REST)
...................
...................
...................
...................

# 3. Datenbank-Komponente (DynamoDB)

## Datenbankschema

### Members-Table

| Attribut | Typ | Beschreibung |
|--------|-----|--------------|----------|
| cognito_sub | String | Eindeutige Cognito-User-ID (PK) |
| member_id | String | Interne Mitgliedsnummer |
| v_name | String | Vorname |
| n_name | String | Nachname |
| email | String | E-Mail-Adresse |
| strasse | String | Straße |
| haus_nr | String | Hausnummer |
| plz | String | Postleitzahl |
| city | String | Stadt |
| monats_kosten | Number | Monatlicher Beitrag |
| last_check_in | String | Letzter Check-in (ISO-8601 empfohlen) |

### Beispiel-Item

{
  "cognito_sub": "first_123",
  "member_id": "1",
  "v_name": "Max",
  "n_name": "Mustermann",
  "email": "maxmuster@gmail.com",
  "strasse": "Maxstrasse",
  "haus_nr": "2",
  "plz": "12345",
  "city": "Musterstadt",
  "monats_kosten": 30,
  "last_check_in": "2025-01-12"
}

### Inventory-Table

| Attribut           | Typ | Beschreibung                    |
|--------------------|----------|---------------------------------|
| produkt_id         | String   | eindeutige produkt-id           |
| p_name       | String   | name des produkts               |
| aktuelle_anzahl    | Number  | aktueller lagerbestand          |
| marke              | String   | hersteller / marke              | 
| preis              | Number  | einzelpreis                     |
| max_anzahl         | Number  | maximaler lagerbestand          |
| icon               | String   | icon-url aus storage-bucket     |

### Beispiel-Item

{
  "produkt_id": "1",
  "p_name" : "Harzer Käse",
  "aktuelle_anzahl" : "2",
  "marke" : "Milbani",
  "preis" : "3.99",
  "max_anzahl" : "20",
  "icon" : "xxx.com"

}

## Schnittstellen (Lambda zu DynamoDB und umgekehrt)
- Lambda <-> DynamoDB: Die Lambda nutzt das AWS SDK (DocumentClient), um mit der Datenbank zu kommunizieren (Query).
- .................
