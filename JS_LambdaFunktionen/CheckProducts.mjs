import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient();
const doc = DynamoDBDocumentClient.from(client);

const INVENTORY_TABLE = "Inventory";

// Die Funktion liefert auf Abfrage des Frontends oder einer Eventbridge die aktuellen Produkte

export const handler = async (event) => {
    const result = await doc.send(
        new ScanCommand({
            TableName: INVENTORY_TABLE,
        })
    );

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(result.Items)
    };

};

