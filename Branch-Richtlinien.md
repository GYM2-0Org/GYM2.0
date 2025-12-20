# Bennenung von Branches


## 1. Grundprinzipien

- Branch-Namen sollen klar und verständlich sein
- Sie sollen den Zweck des Branches direkt erkennbar machen
- Jeder Branch sollte sich eindeutig einem Thema, z.B.: Feature, Bugfix oder Refactor, zuordnen lassen



## 2. Namenskonvention

  Branch-Typen:

 - Feature-Branches: Neue Funktionen oder Klassen, etc. entwickeln
 - Bugfix-Branches: Fehler beheben, die im Code gefunden wurden
 - Refactor-Branches: Code sauberer gestalten oder umbauen, ohne neue Features hinzuzufügen
 - Testing: Für das Testen von diversen Codes

 
     --> Präfix: Branch-Typ/Komponente/#\[Issue-ID\]/Task

  Komponenten:

 - frontend : Frontend-Entwicklung
 - datenbank : Datenbank-Entwicklung
 - lambda : Lambda-Funktion-Entwicklung
 - wiki : Wiki Dokumentation

  Beispiele: 
- Feature-Branch: feature/frontend/#81/html
- Bugfix-Branch: bugfix/lambda/#99/kauf-funktion
- Refactor-Branch: refactor/datenbank/#97/datrentyp-snpassung
- Testing-Branch: testing/lambda/#477/funktions-testing



## 3. Branch-Namen Regeln

 1. Keine Leerzeichen, Sonderzeichen außer -
 2. Wörter durch - trennen (kein \_ oder Leerzeichen)
 3. Alles klein schreiben
 4. Kurz und aussagekräftig schreiben (max. 10 Wörter -\> ideal)
 5. Issue-ID muss dabei stehen, Issue-ID einfügen, z. B.: feature/tmtv/#123/user-login
