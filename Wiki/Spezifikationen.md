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

### Member Data

| attribut        | datentyp | beschreibung                         | schlüssel / besonderheit        |
|-----------------|----------|--------------------------------------|---------------------------------|
| member_id       | integer   | eindeutige mitglieds-id              | primary key, auto_increment      |
| v_name          | varchar(50)   | vorname des mitglieds                | not null                        |
| n_name          | varchar(50)    | nachname des mitglieds               | not null                        |
| strasse         | varchar(50)    | strassenname                         | not null                        |
| hausnr          | varchar(50)    | hausnummer                           | not null                        |
| plz             | varchar(50)    | postleitzahl                         | not null                        |
| stadt           | varchar(50)   | wohnort                              | not null                        |
| email           | varchar(50)    | login- und kontaktadresse            | unique, not null                |
| last_check_in   | datetime | letzter login / check-in             | automatic, not null           |
| monats_kosten   | decimal  | aktuelle monatliche kosten           | calculated, not null             |

### Lager

| attribut           | datentyp | beschreibung                    | schlüssel / besonderheit        |
|--------------------|----------|---------------------------------|---------------------------------|
| produkt_id         | integer   | eindeutige produkt-id           | primary key, auto_increment       |
| produkt_name       | varchar(50)    | name des produkts               | not null                        |
| aktuelle_anzahl    | integer  | aktueller lagerbestand          | not null                        |
| marke              | varchar(50)    | hersteller / marke              | not null                        |
| preis              | decimal  | einzelpreis                     | not null                        |
| max_anzahl         | integer  | maximaler lagerbestand          | not null                        |
| icon               | varchar(250)    | icon-url aus storage-bucket     | s3/bucket, not null             |

## Schnittstellen (Lambda zu DynamoDB und umgekehrt)
- Lambda <-> DynamoDB: Die Lambda nutzt das AWS SDK (DocumentClient), um mit der Datenbank zu kommunizieren (Query).
- .................
