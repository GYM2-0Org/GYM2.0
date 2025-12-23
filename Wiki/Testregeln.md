# Testregeln

Damit am Ende alles einwandfrei läuft, müssen alle relevanten Code-Segmente getestet werden, bevor sie in den main-Branch gemerged werden.
Um sicherzustellen, dass alles ordnungsgemäß getestet wird, müssen folgende Punkte beachtet werden:

## 1. Lambda-Funktionen (Controller)

- Da Amplify oft Lambda-Funktionen als "Controller" nutzt, muss jeder produktive Lambda-Handler eine eigene Testdatei besitzen.
- Es werden mindestens alle Handler-Logiken getestet, die über das API Gateway aufgerufen werden.

## 2. Validierung von API Gateway & Cognito-Kontext

- Tests müssen das API-Gateway-Event simulieren, wobei insbesondere die Cognito-Claims (User-Identität/Gruppen), korrekte HTTP-Statuscodes
  (2xx, 4xx, 5xx) und das exakte Response-Format (JSON-Body & Header) geprüft werden.

## 3. Datenbank-Interaktion (DynamoDB)

- Datenbankzugriffe müssen über Mocks (z. B. aws-sdk-client-mock) validiert werden.
- Es muss explizit getestet werden, wie der Lambda-Handler reagiert, wenn die Datenbank ein ResourceNotFoundException oder ConditionalCheckFailedException zurückgibt.

## 4. Lokale Ausführung & CI-Pflicht

- Vor jedem Pull Request müssen alle Tests lokal erfolgreich durchlaufen; der Merge in den main-Branch wird durch die automatisierte
  CI/CD-Pipeline bei Fehlschlägen verhindert (angezeigt).

## 5. Namenskonventionen & Struktur

- Testdateien liegen direkt bei der Funktion (z. B. src/functions/xyz/xyz.test.ts)
- Testnamen müssen den Business-Fall und den Security-Kontext beschreiben, z. B.: shouldAllowUpdateWhenUserIsOwner
