import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  
    const sub = event.cognito_sub || event.detail?.responseElements?.sub;

    if (!sub) {
        console.error("Fehler: Keine cognito_sub im Event gefunden.");
        return { statusCode: 400, message: "Keine ID vorhanden." };
    }

    try {
        const command = new DeleteCommand({
            TableName: "Members",
            Key: {
                "cognito_sub": sub
            }
        });

        await docClient.send(command);
        console.log(`Datenbank-Eintrag für User ${sub} wurde erfolgreich gelöscht.`);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Datenbank-Eintrag erfolgreich gelöscht." })
        };

    } catch (error) {
        console.error("Fehler beim Löschen aus DynamoDB:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Fehler beim Löschen aus der Datenbank." })
        };
    }
};
