# Definition of Done

Ein Issue gilt als "Done", wenn folgende Kriterien erfüllt sind:

- [ ] Titel nach < Titel >. Ref #< Issue > formatiert?
- [ ] Wurde die Merge Request rebased? (wenn nötig)

### 1. Code & Qualität
- [ ] Die Code-Formatierung wurde eingehalten.
- [ ] Die projektinternen Code-Konventionen wurden umgesetzt.
- [ ] Änderungen wurden betrachtet.

### 2. Entwicklungsprozess
- [ ] Es wurde gemäß der Branch-Richtlinien auf einem eigenen Zweig entwickelt.
- [ ] Alle zum Issue gehörenden Sub-Issues sind vollständig abgearbeitet.

### 3. Validierung
- [ ] Die Funktionsfähigkeit wurde erfolgreich überprüft.
- [ ] Die Abnahmekriterien des Issues wurden vom Team/Entwickler selbst verifiziert.
- [ ] Der Merge-Request wurde nach den Richtlinien geschrieben.

### 5. Testen
- [ ] **Lambda:** Jeder betroffene produktive Handler hat eine eigene Testdatei.
- [ ] **API Gateway:** HTTP-Statuscodes (2xx, 4xx, 5xx) und Response-Inhalte werden validiert.
- [ ] **Cognito:** Tests enthalten simulierte Events mit korrekten Cognito-Claims/Gruppen.
- [ ] **DynamoDB:** DB-Zugriffe sind gemockt (inkl. ResourceNotFound/ConditionalCheck-Fehlern).

### 6. Pipeline & Infrastruktur
- [ ] **Lokal:** `npm test` (oder vergleichbar) lief lokal erfolgreich durch.
- [ ] **CI/CD:** Die automatisierte Pipeline zeigt keine Fehler an.


## Beschreibung:

- [ ] Ist die Beschreibung auf Deutsch? 

<Eigene Beschreibung>
