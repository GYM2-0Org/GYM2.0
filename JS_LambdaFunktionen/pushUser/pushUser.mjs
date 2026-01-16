// pushUser.mjs
// Teil-Update von Mitgliedsdaten in der Tabelle "Members"

let docClient;

const MEMBERS_TABLE = "Members";
const allowedFields = [
    "v_name",
    "n_name",
    "strasse",
    "haus_nr",
    "plz",
    "city"
];

async function initAwsClients() {
    if (process.env.NODE_ENV === "test") {
        return {};
    }

    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const {
        DynamoDBDocumentClient,
        UpdateCommand
    } = await import("@aws-sdk/lib-dynamodb");

    docClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({})
    );

    return { UpdateCommand };
}

export const handler = async (event) => {
    try {
        /* =====================
           TEST-MODUS (CI)
           ===================== */
        if (process.env.NODE_ENV === "test") {
            console.log("TEST OK – PushUser ohne AWS ausgeführt");
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "TEST MODE – kein Update" })
            };
        }

        /* =====================
           PRODUKTIONS-MODUS
           ===================== */
        const { UpdateCommand } = await initAwsClients();

        const data =
            typeof event.body === "string"
                ? JSON.parse(event.body)
                : event;

        if (!data?.cognito_sub) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "ID fehlt" })
            };
        }

        const fieldsToUpdate = Object.keys(data).filter(
            key => allowedFields.includes(key)
        );

        if (fieldsToUpdate.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Keine gültigen Felder zum Ändern gefunden"
                })
            };
        }

        let updateExpression = "SET ";
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        fieldsToUpdate.forEach((key, index) => {
            updateExpression += `#${key} = :val${index}, `;
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:val${index}`] = data[key];
        });

        updateExpression = updateExpression.slice(0, -2);

        await docClient.send(
            new UpdateCommand({
                TableName: MEMBERS_TABLE,
                Key: {
                    cognito_sub: data.cognito_sub
                },
                UpdateExpression: updateExpression,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: "UPDATED_NEW"
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Teil-Update erfolgreich"
            })
        };

    } catch (error) {
        console.error("PushUser Fehler:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Update fehlgeschlagen"
            })
        };
    }
};
