# GitHub Actions Pipeline – Test & Deploy All JS Lambdas

## Überblick

Diese GitHub-Actions-Pipeline dient dem **automatisierten Testen mehrerer AWS-Lambda-Funktionen** (JavaScript / Node.js), die in einem Monorepo organisiert sind.  
Jede Lambda-Funktion wird **isoliert getestet**.

Die Pipeline folgt dem Prinzip:

> **Kein Merge ohne erfolgreichen Test**

---
# Aufbau
### Berechtigungen:
Die CI/CD-Pipeline hat read Berechtigungen erhalten um die Main-Lambda-Funktionen zu lesen.
Die entsprechende Berechtigung wurden auch demnach erteilt.
### Voraussetzung der Struktur:
Damit die Pipeline problemlos die Funktionen mit ihren Tests findet, muss jeder Backend Entwickler sich an die Ordnerstruktur halten:

```
 JS_LambdaFunktionen/
  |_[Funktionsname]/
    |_[Funktionsname].mjs
    |_[Funktionsname]Test.mjs
    |_test.json
```
### Jobdefinitionen:
Die Pipeline umfasst einen Job "test-lambdas", der das Testen für unser Projekt übernimmt.
Alle Funktionen werden im Repo aufgerufen und bei erfolgreichen Tests anschießend in den Main gemerged. Dabei findet der Aufruf als sogenannte "matrix" statt.
>Die Matrix-Strategie listet die Lambda-Funktionen, die dann parallel in der Pipeline laufen werden.

>Der Job läuft auf einem GitHub-gehosteten Ubuntu-Runner.

### AWS-Hinweis
Diese Pipeline führt keine Deployments nach AWS durch.

- Änderungen oder neue Lambda-Funktionen müssen nach erfolgreichem Test manuell in AWS übernommen werden
- Es erfolgt keine AWS-Authentifizierung
- Es werden keine Lambda-ZIPs erzeugt oder deployed

### Ablauf
1. Repo auschecken
```
- uses: actions/checkout@v4
```
2. Node.js einrichten
```
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm
    cache-dependency-path: package-lock.json
```
3. Dependencies installieren (Root)
```
- name: Install dependencies (root)
  run: npm ci
```

4. Lambda Test
```
- name: Run Lambda Tests
  working-directory: JS_LambdaFunktionen/${{ matrix.name }}
  env:
    NODE_ENV: test
    AWS_REGION: eu-central-1
    AWS_DEFAULT_REGION: eu-central-1
  run: node ${{ matrix.testFile }}

```

**Hinweis:**
Die gesetzten AWS-Regionen dienen ausschließlich dem lokalen Testkontext (Mocks / SDK-Verhalten) und stellen keine AWS-Verbindung her.