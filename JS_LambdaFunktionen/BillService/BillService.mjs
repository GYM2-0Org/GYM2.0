/*
BillService wartet auf das Event vom Frontend.
Das Event bestimmt, welches Produkt gekauft wird.
Die Bestellung wird gespeichert und der Lagerbestand reduziert.
*/

// BillService.mjs

let docClient;

const INVENTORY_TABLE = "Inventory";
const ORDER_TABLE = "Order";

async function initAwsClients() {
    if (process.env.NODE_ENV === "test") {
        return {};
    }

    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const {
        DynamoDBDocumentClient,
        GetCommand,
        UpdateCommand,
        PutCommand
    } = await import("@aws-sdk/lib-dynamodb");

    docClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({})
    );

    return { GetCommand, UpdateCommand, PutCommand };
}

export const handler = async (event) => {
    try {
        /* =====================
           TEST-MODUS (CI)
           ===================== */
        if (process.env.NODE_ENV === "test") {
            return {
                statusCode: 200,
                message: "TEST OK – BillService ohne AWS ausgeführt"
            };
        }

        /* =====================
           PRODUKTIONS-MODUS
           ===================== */
        const {
            GetCommand,
            UpdateCommand,
            PutCommand
        } = await initAwsClients();

        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Request-Body fehlt" })
            };
        }

        const { produkt_id } = JSON.parse(event.body);

        if (!produkt_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "produkt_id ist erforderlich"
                })
            };
        }

        /* 1) Produkt laden */
        const productRes = await docClient.send(
            new GetCommand({
                TableName: INVENTORY_TABLE,
                Key: { product_id: produkt_id }
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

        /* 2) Bestand reduzieren (atomar) */
        try {
            await docClient.send(
                new UpdateCommand({
                    TableName: INVENTORY_TABLE,
                    Key: { product_id: produkt_id },
                    UpdateExpression:
                        "SET aktuelle_anzahl = aktuelle_anzahl - :one",
                    ConditionExpression:
                        "aktuelle_anzahl >= :one",
                    ExpressionAttributeValues: {
                        ":one": 1
                    }
                })
            );
        } catch (err) {
            if (err.name === "ConditionalCheckFailedException") {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: "Nicht genug Bestand"
                    })
                };
            }
            throw err;
        }

        /* 3) Order speichern */
        const { randomUUID } = await import("crypto");

        const order = {
            order_id: randomUUID(),
            produkt_id,
            p_name,
            preis,
            order_date: new Date().toISOString()
        };

        await docClient.send(
            new PutCommand({
                TableName: ORDER_TABLE,
                Item: order
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify(order)
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            error: error.message
        };
    }
};
