import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const userSub = event.cognitoId || (event.body ? JSON.parse(event.body).cognitoId : null);

    if (!userSub) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ message: "Fehler: cognitoId fehlt im Event!" }) 
        };
    }

    try {
        const now = new Date().toISOString();

        const command = new UpdateCommand({
            TableName: "Members",
            Key: {
                "cognito_sub": userSub 
            },
            UpdateExpression: "SET last_check_in = :t",
            ExpressionAttributeValues: {
                ":t": now
            }
        });

        await docClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: "Zeitstempel erfolgreich aktualisiert!", 
                updatedUser: userSub 
            })
        };
    } catch (error) {
        console.error("Datenbank-Fehler:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.message }) 
        };
    }
};
