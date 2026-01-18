# 1. Frontend-Komponente (HTML, Amplify, Cognito)

## Funktionale Anforderungen
- Als Nutzer möchte ich mich über eine Weboberfläche sicher registrieren und einloggen können (AWS Cognito)
- Als Nutzer möchte ich was kaufen können (Snacks, Getränke, etc.)
- Als Nutzer möchte ich meine Mitgliedschaft kündigen können
- Als Admin möchte ich meine Gesamteinnahmen sehen
- Als Admin möchte ich Nutzer Benachrichtigen können (Events, Erinnerungen)
- Als Admin möchte ich einen automatisierten Bestellservice am Snackautomaten

## Schnittstellen (Frontend zu AWS Services)
- Frontend <-> API Gateway: Kommunikation erfolgt über RESTful HTTPS-Requests. Alle Anfragen sind mit dem Cognito-JWT im Header signiert.
- Frontend <-> Cognito: Direkte Integration über das AWS SDK/Amplify für Login, Registrierung und Token-Erneuerung.
- Frontend <-> Amplify: Hosting der statischen Assets (HTML, CSS, JS) und CI/CD-Pipeline.

# 2. Backend-Komponente (Lambda, API Gateway)

## Logik-Spezifikationen
- Authorizer: Das API Gateway validiert das JWT von Cognito, bevor die Lambda-Funktion ausgeführt wird (Security-Layer).
- CRUD-Logik: Lambda-Funktionen verarbeiten Geschäftslogik (z. B. Bestandsprüfung vor Kauf, Berechnung der Einnahmen).
- Automatisierung (EventBridge): Ein Cron-Job triggert den einige Lambda-Funktionen regelmäßig, um den Lagerstand zu prüfen.
- Benachrichtigungs-Logik: Integration von Amazon SES für den automatisierten Versand von E-Mails.

## Schnittstellen (API Gateway zu Lambda und umgekehrt)
- API Gateway <-> Lambda: API Gateway triggert (löst aus) die Lambda-Funktion asynchron/synchron und übergibt das event-Objekt inklusive User-Context.
- Lambda <-> SES: Der `BestellService` nutzt den `SendEmailCommand`, um Berichte an die Verwaltung zu senden, etc..

## API-Endpunkte (REST)
- POST: /buy
- POST: /user/push-user
- GET: /products
- DELETE: /user

# 3. Datenbank-Komponente (DynamoDB)

## Datenbankschema

### Members-Table

| Attribut | Typ | Beschreibung |
|--------|-----|--------------|
| cognito_sub | String | Eindeutige Cognito-User-ID (PK) |
| member_id | String | Interne Mitgliedsnummer (UUID)|
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
  "member_id": "060f0934-a21d-4439-b850-b327ff6b3e10",
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
| produkt_id         | String   | eindeutige produkt-id (UUID)          |
| p_name       | String   | name des produkts               |
| aktuelle_anzahl    | Number  | aktueller lagerbestand          |
| marke              | String   | hersteller / marke              | 
| preis              | Number  | einzelpreis                     |
| max_anzahl         | Number  | maximaler lagerbestand          |
| icon               | String   | icon-url aus storage-bucket     |

### Beispiel-Item

{
   "produkt_id": "8b68e248-e9d7-4e62-8d13-6dde1347c6e1",
   "p_name" : "Harzer Käse",
   "aktuelle_anzahl" : "2",
   "marke" : "Milbani",
   "preis" : "3.99",
   "max_anzahl" : "20",
   "icon" : "xxx.com"

}

### Order-Table

| Attribut           | Typ | Beschreibung                    |
|--------------------|----------|---------------------------------|
| order_id           | String   | eindeutige Order-id      (UUID)       |
| produkt_id         | String   | eindeutige produkt-id    (UUID)       |
| p_name       | String   | name des produkts               |
| preis              | Number  | einzelpreis                     |
|member_id           | String  | Member-ID               (UUID)         |
| order_date         | String  | Datum (ISO-8601 empfohlen)      |

{ 
   "order_id" : "5bbf8683-9a52-4309-bb93-00b6d83332eb"
   "produkt_id": "8b68e248-e9d7-4e62-8d13-6dde1347c6e1",
   "p_name" : "Harzer Käse",
   "preis" : "3.99",
   "member_id": "060f0934-a21d-4439-b850-b327ff6b3e10",
   "order_date" : "2025-01-12"

}

## Schnittstellen (Lambda zu DynamoDB und umgekehrt)
- Lambda <-> DynamoDB: Die Lambda nutzt das AWS SDK (DocumentClient), um mit der Datenbank zu kommunizieren (Query).
- Berechtigungen: Zugriff erfolgt über IAM-Rollen nach dem Prinzip der geringsten Rechte (Least Privilege), beschränkt auf spezifische Tabellen-ARNs.
