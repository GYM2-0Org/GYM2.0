/*
BillService wartet auf das Event getriggert vom Frontend.
Das Event bestimmt per Knopfdruck, welches Produkt gekauft wird.
Die Bestellung wird gespeichert und der Lagerbestand reduziert.
*/

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    UpdateCommand,
    PutCommand
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(client);

const INVENTORY_TABLE = "Inventory";
const ORDER_TABLE = "Order";

export const handler = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Request-Body fehlt" })
        };
    }

    // Frontend -> Backend Mapping
    const { produkt_id } = JSON.parse(event.body);
    const product_id = produkt_id;

    if (!product_id) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "produkt_id ist erforderlich"
            })
        };
    }

    // 1) Produkt laden
    const productRes = await doc.send(
        new GetCommand({
            TableName: INVENTORY_TABLE,
            Key: { product_id }
        })
    );

    if (!productRes.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Produkt nicht gefunden" })
        };
    }

    const { p_name, preis, aktuelle_anzahl } = productRes.Item;

    if (aktuelle_anzahl < 1) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Nicht genug Bestand" })
        };
    }

    // 2) Bestand reduzieren (atomar)
    try {
        await doc.send(
            new UpdateCommand({
                TableName: INVENTORY_TABLE,
                Key: { product_id },
                UpdateExpression: "SET aktuelle_anzahl = aktuelle_anzahl - :one",
                ConditionExpression: "aktuelle_anzahl >= :one",
                ExpressionAttributeValues: {
                    ":one": 1
                }
            })
        );
    } catch (err) {
        if (err.name === "ConditionalCheckFailedException") {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Nicht genug Bestand" })
            };
        }
        throw err;
    }

    // 3) Order schreiben
    const order = {
        order_id: randomUUID(),   // PK
        produkt_id,
        p_name,
        preis,
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
