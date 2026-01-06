#### **AWS Lambda**
AWS Lambda führt den Code automatisch als Reaktion auf Ereignisse aus und skaliert dynamisch. AWS Lambda ist zudem ein serverloser Computing Dienst, wodurch man deutlich weniger Code schreiben muss im Vergleich zu einem serverabhängigen Dienst.  
Darüberhinaus zahlen Kunden nur für die tatsächliche Rechenzeit, was es kosteneffizient macht.

In Bezug zu unserem Projekt verwenden wir AWS Lambda für die folgenden Lambda-Funktionen: BestellService, BillService, CheckUserpool, DeletionService, LoginTracking, LoggingService, NotifyService, PushUser

Allgemeine Syntax einer Lambda-Funktion: export const handler = async (event) => { ...auszuführender Code...}

Die einzelnen Lambda-Funktionen sind im Code ausführlich dokumentiert.
#### **API Gateway**
Durch das API Gateway kann man HTTP-Anfragen des Frontends verarbeiten und bestimmten Lambda-Funktionen zuweisen. Diese Lambda-Funktionen werden durch zu ihnen zugewiesenen Routen aufgerufen.  
Zu allererst erstellt man eine API und gibt ihr einen bestimmten Namen (bei uns: GYM2.0). Dann erstellt man in dieser API Routen, die durch das Frontend aufgerufen werden können. Hierzu geht man in den Reiter Routes und klickt auf Erstellen. Schließlich wählt man die Methode aus (z.B. POST, DELETE, etc.) und gibt den Pfad an (z.B. /user/check-userpool).

In Bezug zu unserem Projekt verwenden wir das API Gateway für die folgenden Lambda-Funktionen: BillService, CheckUserpool, DeletionService, LoginTracking, PushUser
                                                                                           
| Methode | Pfadname | Beschreibung |
|--------|-----|--------------|
| POST | /buy | Tätigt den Kauf eines Produktes |
| POST | /user/check-userpool | Speichert den neu registrierten Benutzer in der Datenbank|
| POST | /user/push-user | Ändert bestimmte Daten des Benutzers |
| POST | /user/login-tracking | Setzt die Zeit des Attributs last_check_in auf die aktuelle Zeit des Logins |
| DELETE | /user | Löscht den Benutzer aus der Datenbank |

#### **Amazon Eventbridge (CloudWatchEvents)**
Amazon Eventbridge automatisiert einige Funktionen des Softwareprojekts, in Hinsicht auf einige Lambda-Funktionen. Durch Eventbridge wird ein sogenannter Scheduler eingestellt, der die Lambda-Funktionen in einem bestimmten Zeitintervall (z.B. 12 hours) regelmäßig aufruft.  
Um bestimmte Lambda-Funktionen automatisiert aufrufen zu können, muss man bei der Lambda-Funktion einen Eventbridge-Auslöser hinzufügen. Dort erstellt man dann eine neue Regel, gibt der Regel einen Namen und eine Beschreibung, sowie das Zeitintervall (Syntax: rate(xx hours) an.

In Bezug zu unserem Projekt verwenden wir Eventbridge als Trigger für die folgenden Lambda-Funktionen: BestellService, LoggingService, NotifyService.

Der Bestell-Service wird im Hintergrund alle 12 Stunden aufgerufen, um zu prüfen ob bestimmte Produkte des Automaten nachbestellt werden müssen und wenn es welche gibt, dann werden automatisiert E-Mails an die Produktverwaltung des Gyms gesendet.  
Der Logging-Service wird im Hintergrund alle 24 Stunden aufgerufen und überprüft das Datum und ab einem bestimmten Richtwert (jeden 1. des Monats)
werden die entsprechenden Einträge der Log-Tabelle als CSV exportiert und in einem Bucket gespeichert.  
Der Notify-Service wird im Hintergrund alle 24 Stunden aufgerufen und überprüft ob Mitglieder innerhalb eines Monats mindestens 1-mal das Studio
besucht haben. Sollte das nicht der Fall sein, wird eine Erinnerungs-Mail geschickt.

#### **Amazon Simple Email**
Durch den Amazon Simple Email Service wird von einer angegeben Quelle eine E-Mail an einen bestimmten Empfänger gesendet.  
Man hinterlegt beim Amazon Simple Email Service seine E-Mail und bestätigt anschließend diese. Daraufhin kann man diese E-Mail in Lambda-Funktionen
verwenden, indem man den SES Client importiert. Dabei kann der Inhalt der E-Mail und der Empfänger im Code festgelegt werden.

In Bezug zu unserem Projekt verwenden wir den Amazon Simple Email Service in folgenden Lambda-Funktionen: BestellService, NotifyService.
