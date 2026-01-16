# GitHub Actions Pipeline – Test & Deploy All JS Lambdas

## Überblick

Diese GitHub-Actions-Pipeline dient dem **automatisierten Testen und Deployen mehrerer AWS-Lambda-Funktionen** (JavaScript / Node.js), die in einem Monorepo organisiert sind.  
Jede Lambda-Funktion wird **isoliert getestet**, anschließend **über OIDC sicher mit AWS verbunden** und danach **in AWS Lambda aktualisiert**.

Die Pipeline folgt dem Prinzip:

> **Kein Deployment ohne erfolgreichen Test**

---
# Aufbau
### Berechtigungen:
Die CI/CD-Pipeline hat per AWS read und write Berechtigungen erhalten. Umgekehrt gibt Github einen Zugriffstoken vom Repo zu AWS.
Die entsprechende Berechtigung wurden auch demnach erteilt.
### Voraussetzung der Struktur:
Damit die Pipeline problemlos die Funktionen mit ihren Tests findet, muss jeder Backend Entwickler sich an die Ordnerstruktur halten:

```
 JS_LambdaFunktionen/
  |_[Funktionsname]/
    |_[Funktionsname].mjs
    |_test.json
```
### Jobdefinitionen:
Die Pipeline umfasst einen Job "deploy-lambdas", der sowohl testing als auch deployment für unser Projekt übernimmt.
Alle Funktionen werden im Repo aufgerufen und bei erfolgreichen Tests in AWS deployed. Dabei findet der Aufruf als sogenannte "matrix" statt.
>Die Matrix-Strategie listet die Lambda-Funktionen, die dann parallel in der Pipeline laufen werden.

Damit das Deployment in AWS-Lambda stattfinden kann stehen die dafür benötigten Credentials (Region, Rolle) in der Pipeline.

>Der Job läuft auf einem GitHub-gehosteten Ubuntu-Runner.

### Ablauf
1. Repo auschecken
```
- uses: actions/checkout@v4
```
2. Node.js einrichten
```
- uses: actions/setup-node@v4
  with:
    node-version: 18
```
3. Lambda Test
```
- name: Run Lambda Test
  env:
  NODE_ENV: test
  run: (siehe Pipeline)
```
4. AWS Credential per OICD aufrufen
```
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::<ACCOUNT_ID>:role/GithubPipeline
    aws-region: eu-north-1
    audience: sts.amazonaws.com
```
5. Lambda zippen
```
- name: Zip Lambda
     run: zip ${{ matrix.name }}.zip ${{ matrix.file }}
```
6. Deployment bei Push
```
- name: Deploy Lambda
  if: github.event_name == 'push'
  run: |
  aws lambda update-function-code \
  --function-name ${{ matrix.name }} \
  --zip-file fileb://${{ matrix.name }}.zip
```