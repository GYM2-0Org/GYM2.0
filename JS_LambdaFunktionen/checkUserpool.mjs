import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto"; 

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const attributes = event.request.userAttributes;

    try {
        const command = new PutCommand({
            TableName: "Members",
            Item: {
                "cognito_sub": attributes.sub,
                "v_name": attributes.given_name || "",
                "n_name": attributes.family_name || "",
                "email": attributes.email,
                "strasse": attributes.address || "", 
                "haus_nr": attributes["custom:haus_nr"] || "",
                "plz": attributes["custom:plz"] || "",
                "city": attributes["custom:city"] || "",
                "monats_kosten": 0,
                "last_check_in": "Registriert am " + new Date().toISOString(),
                "member_id": randomUUID() 
            }
        });

        await docClient.send(command);
        console.log("Mitglied erfolgreich angelegt. UUID:", attributes.sub);

        return event;

    } catch (error) {
        console.error("Fehler beim Schreiben in die Tabelle Members:", error);
        return event;
    }
};
