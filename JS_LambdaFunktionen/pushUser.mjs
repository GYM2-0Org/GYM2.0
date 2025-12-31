import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const data = typeof event.body === 'string' ? JSON.parse(event.body) : event;

    if (!data.cognito_sub) {
        return { statusCode: 400, body: JSON.stringify({ message: "ID fehlt" }) };
    }

    const allowedFields = ["v_name", "n_name", "strasse", "haus_nr", "plz", "city"];
    
    let updateExpression = "SET";
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};

    const fieldsToUpdate = Object.keys(data).filter(key => allowedFields.includes(key));

    if (fieldsToUpdate.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ message: "Keine gültigen Felder zum Ändern gefunden" }) };
    }

    fieldsToUpdate.forEach((key, index) => {
        updateExpression += ` #${key} = :val${index},`;
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:val${index}`] = data[key];
    });

    updateExpression = updateExpression.slice(0, -1);

    try {
        const command = new UpdateCommand({
            TableName: "Members",
            Key: { "cognito_sub": data.cognito_sub },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "UPDATED_NEW"
        });

        await docClient.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Teil-Update erfolgreich" })
        };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ message: "Update fehlgeschlagen" }) };
    }
};
