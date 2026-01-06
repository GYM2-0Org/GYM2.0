import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient();
const doc = DynamoDBDocumentClient.from(client);

const INVENTORY_TABLE = "Inventory";

//Damit das Frontend die aktuellen Produkte hat, wird in der DB alles einmal abgelesen
export const handler = async () => {
    const result = await doc.send(
        new ScanCommand({
            TableName: INVENTORY_TABLE,
        })
    );

    return {
        statusCode: 200,
        body: JSON.stringify(result.Items) //Rückgabe als Liste
    };
};

