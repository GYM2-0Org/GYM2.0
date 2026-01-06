/*
BillService wartet auf das Event getriggert vom Frontend. Das Event bestimmt per Knopfdruck, welches Produkt von welchem Member gekauft wird.
Die Abwicklung eines Zahlungsadienstes wird simuliert. Danach wird die Bestellung in der Order Tabelle gespeichert und der Lagerbestand reduziert.
*/
const { DynamoDBClient } = import("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, PutCommand } = import("@aws-sdk/lib-dynamodb");
import { v4 as uuidv4 } from "uuid";


const client = new DynamoDBClient();
const doc = DynamoDBDocumentClient.from(client);

const INVENTORY_TABLE = 'Inventory';
const ORDER_TABLE = 'Order';
const MEMBER_TABLE = 'Members';


export const handler = async (event) => {
    const { produkt_id, p_name, preis, member_id } = JSON.parse(event.body);

    // 1) Lagerbestand atomar reduzieren
    try {
        await doc.send(
            new UpdateCommand({
                TableName: INVENTORY_TABLE,
                Key: { produkt_id },
                UpdateExpression: "SET aktuelle_anzahl = aktuelle_anzahl - :one",
                ConditionExpression: "aktuelle_anzahl > :zero",
                ExpressionAttributeValues: {
                    ":one": 1,
                    ":zero": 0
                },
                ReturnValues: "UPDATED_NEW"
            })
        );
        //Für den Fall dass es kein Bestand des Produktes gibt, erfolgt die entsprechende Ausgabe
    } catch (err) {
        if (err.name === "ConditionalCheckFailedException") {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Nicht genug Bestand" })
            };
        }
        throw err;
    }

    // Nach erfolgreicher Übermittlung wird eine Logzeile erstellt und in der Log-Datenbank vermerkt
    // 2) Order / Log schreiben
    const order = {
        order_id: uuidv4(),
        produkt_id,
        p_name,
        preis,
        member_id,
        order_date: new Date().toISOString()
    };

    // Eintrag in DB
    await doc.send(
        new PutCommand({
            TableName: ORDER_TABLE,
            Item: order
        })
    );

    return {
        statusCode: 200,
        body: JSON.stringify(order)
    };
};
/*
Nach der Funktion ist dann der Bestand entsprechend angepasst
und für den Überblick der Kauf inklusive aller wichtigen Details (Preis, Datum, MemberId, ect.)
gespeichert
*/

