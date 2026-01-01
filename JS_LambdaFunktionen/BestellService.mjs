import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async () => {
    try {
        const inventoryData = await docClient.send(new ScanCommand({
            TableName: "Inventory"
        }));

        const itemsToRestock = inventoryData.Items.filter(item => 
            item.aktuelle_anzahl <= 5 
        );

        console.log(`${itemsToRestock.length} Produkte müssen nachbestellt werden.`);

        for (const product of itemsToRestock) {
            await docClient.send(new UpdateCommand({
                TableName: "Inventory",
                Key: { "product_id": product.product_id },
                UpdateExpression: "SET aktuelle_anzahl = :max",
                ExpressionAttributeValues: {
                    ":max": product.max_anzahl || 50 
                }
            }));
            console.log(`Produkt ${product.p_name} (ID: ${product.product_id}) wurde nachbestellt.`);
        }

        return { message: "Auto-Restock erfolgreich abgeschlossen" };

    } catch (error) {
        console.error("Fehler beim Auto-Restock Job:", error);
    }
};
