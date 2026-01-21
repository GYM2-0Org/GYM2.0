# Gym 2.0

Warum noch ein Gym mit Personal, wenn man 24/7 mit einfachen technischen Mitteln ein Studio betreten kann?
Durch einfaches Webdesign und lauffähigen Containern ist diese Applikation ein Allrounder für die Fitness-Szene!

GYM 2.0 revolutioniert das klassische Fitnessstudio-Konzept durch vollständige Automatisierung. Mitglieder tätigen Einkäufe bequem online, können sich selbstständig anmelden und die Automaten für Snacks/Getränke verwalten automatisch den Lagerbestand über das System.
# Allgemeines
* [Teamspezifisches](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/Teamspezifisches.md)
* [Organisatorisches](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/Organisatorisches.md)
* [Meeting Protokolle](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/Meeting_Protokolle.md)

# Regeln
* [Teamregeln](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/Teamregeln.md)
* [Code Konventionen](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/Code_Konventionen.md)
* [Issue Template](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/Issue-Template.md)
* [Pull Request Template](https://github.com/GYM2-0Org/GYM2.0/blob/main/.github/pull_request_template.md)
* [Definition of Ready](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/DefOfReady.md)
* [Definition of Done](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/Definition_of_Done.md)
* [Branches Richtlinien](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/Branch-Richtlinien.md)
* [How to Test](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/Testregeln.md)

# Projekt
* [Projektdetails](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/Projektdetails.md)
* [Spezifikationen](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/Spezifikationen.md)
* [Anleitung AWS Lambda](Wiki/Anleitungen/LambdaDoku.pdf)
* [Anleitung API Gateway](Wiki/Anleitungen/APIGatewayDoku.pdf)
* [Anleitung Amazon Eventbridge](Wiki/Anleitungen/EventbridgeDoku.pdf)
* [Anleitung Amazon Simple Email Service (SES)](Wiki/Anleitungen/SESDoku.pdf)
* [Anleitung AWS Amplify](Wiki/Anleitungen/AWS%20Amplify%20Anleitung.pdf)
* [Anleitung AWS Cognito](Wiki/Anleitungen/AWS%20Cognito.pdf)
* [Anleitung DynamoDB](Wiki/Anleitungen/DynamoDB-Anleitung.pdf)
* [Pipeline-Dokumentation](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/PipelineDoku.md)
* [Vorgehen fürs lokale Testen](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/VorgehenLokalerTests.md)

## Funktionen
* Mitglieder können jederzeit das Studio anhand ihrer Logingaten betreten. Es erfolgt eine Eingabe und nach einer Sicherheitsprüfung kann man das Gym betreten.
* Bevor es einen Login gibt, könne sich Mitglieder im Studio registrieren.
* Mitglieder können Einkäufe tätigen für Snacks/Getränke. Diese werden separat vom Zahlungsanbieter verwaltet.
* Am Ende des Monats gibt es eine Übersicht an Snacks/Getränke, die verkauft wurden. Diese wird als CSV-Datei gespeichert und dies kann der Verwalter entsprechend einsehen. 

## Skizze
![ProjektSkizze](https://github.com/GYM2-0Org/GYM2.0/blob/main/Wiki/ProjektSkizze.png)

