/*
BillService wartet auf das Event getriggert vom Frontend.
Das Event bestimmt per Knopfdruck, welches Produkt von welchem Member gekauft wird.
Die Bestellung wird gespeichert und der Lagerbestand reduziert.
*/

const { DynamoDBClient } = import("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    UpdateCommand,
    PutCommand,
    GetCommand
} = import("@aws-sdk/lib-dynamodb");
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient();
const doc = DynamoDBDocumentClient.from(client);

const INVENTORY_TABLE = "Inventory";
const ORDER_TABLE = "Order";
const MEMBER_TABLE = "Members";

export const handler = async (event) => {

    //produkt_id vom Frontend
    const { produkt_id } = JSON.parse(event.body);

    //Produktdaten aus Inventory lesen
    const productRes = await doc.send(
        new GetCommand({
            TableName: INVENTORY_TABLE,
            Key: { produkt_id }
        })
    );

    if (!productRes.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Produkt nicht gefunden" })
        };
    }

    const p_name = productRes.Item.p_name;
    const preis = productRes.Item.preis;

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
und für den Überblick der Kauf inklusive aller wichtigen Details (Preis, Datum ect.)
gespeichert
*/
