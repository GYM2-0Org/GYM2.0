# Code-Konventionen 

## 1. Allgemeines & Sprache

- Alle technischen Begriffe (Klassen, Funktionen, Methoden, Variablen) werden ausschließlich in englischer Sprache formuliert.
- Kommentare im Code werden deutsch, kurz und prägnant verfasst, um die Lesbarkeit für alle Teammitglieder zu maximieren.
- Als Basis-Styleguide dient der [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html).

## 2. Benennung & Rollen (Serverless)

- Lambda-Handler: Dateien werden funktionsbezogen benannt (z. B. `registerUser.ts`, `processCheckIn.ts`).
- DTOs (Data Transfer Objects): - Eingehende Datenpakete enden auf `DtoIn` (z. B. `UserRegisterDtoIn`).
- Ausgehende Datenpakete enden auf `DtoOut` (z. B. `WorkoutHistoryDtoOut`).
- Entities: Strukturen, die 1-zu-1 der Ablage in der DynamoDB entsprechen, enden auf `Entity`.
- Variablen: Es wird konsequent `const` genutzt. `let` ist nur bei notwendigen Neuzuweisungen erlaubt; `var` ist untersagt.

## 3. Methoden- & Funktionsrichtlinien

Funktionen innerhalb der Lambdas folgen einem klaren CRUD-Schema, um die Intention des Codes sofort ersichtlich zu machen:

- Read-Befehle: Beginnen mit `get...` oder `find...` (z. B. `getMemberStatus`).
- Create-Befehle: Beginnen mit `create...` oder `add...` (z. B. `createWorkoutEntry`).
- Update-Befehle: Beginnen mit `update...` (z. B. `updateUserWeight`).
- Delete-Befehle: Beginnen mit `remove...` oder `delete...` (z. B. `removeCheckIn`).

## 4. Zeitformen & Datentypen

- Datum & Zeit: Alle Zeitstempel werden im ISO-8601 Format (UTC) als String gespeichert und verarbeitet. Erzeugung via `new Date().toISOString()`.
- DynamoDB-Typen: Für numerische Werte (z. B. Gewichte, Wiederholungen) ist der Datentyp `Number` zwingend erforderlich (keine Strings für Zahlen verwenden).
- Wrapper: Wo möglich, werden für komplexe Rückgaben strukturierte Objekte statt einfacher Datentypen genutzt.

## 5. Git-Commit Richtlinien

Jeder Commit muss eindeutig einem Issue zugeordnet werden können:

- Format: `<Prägnante Änderungen auf Deutsch>. Ref #<Issue-Nummer>`
- Beispiel: `Login-Validierung für AWS Cognito implementiert. Ref #12`
- Sprache: Die Commit-Nachrichten werden auf Deutsch verfasst.
