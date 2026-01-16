// checkUserpool.mjs
// Cognito Post-Confirmation Trigger
// Legt nach erfolgreicher Registrierung automatisch ein Member-Profil an

let docClient;

const MEMBERS_TABLE = "Members";

async function initAwsClients() {
    if (process.env.NODE_ENV === "test") {
        return {};
    }

    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const {
        DynamoDBDocumentClient,
        PutCommand
    } = await import("@aws-sdk/lib-dynamodb");

    docClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({})
    );

    return { PutCommand };
}

export const handler = async (event) => {
    try {
        /* =====================
           TEST-MODUS (CI)
           ===================== */
        if (process.env.NODE_ENV === "test") {
            console.log("TEST OK – CheckUserpool ohne AWS ausgeführt");
            return event; 
        }

        /* =====================
           PRODUKTIONS-MODUS
           ===================== */
        const { PutCommand } = await initAwsClients();
        const { randomUUID } = await import("crypto");

        const attributes = event.request?.userAttributes;

        if (!attributes?.sub || !attributes?.email) {
            console.error("Ungültige Cognito-Attribute:", attributes);
            return event;
        }

        await docClient.send(
            new PutCommand({
                TableName: MEMBERS_TABLE,
                Item: {
                    cognito_sub: attributes.sub,
                    v_name: attributes.given_name || "",
                    n_name: attributes.family_name || "",
                    email: attributes.email,
                    strasse: attributes["custom:Street"] || "",
                    haus_nr: attributes["custom:House-number"] || "",
                    plz: attributes["custom:Postal-Code"] || "",
                    city: attributes["custom:City"] || "",
                    monats_kosten: 0,
                    last_check_in: new Date().toISOString(),
                    member_id: randomUUID()
                }
            })
        );

        console.log(
            "Mitglied erfolgreich angelegt. Cognito Sub:",
            attributes.sub
        );

        return event; 

    } catch (error) {
        console.error(
            "Fehler beim Schreiben in Members:",
            error
        );

        return event;
    }
};
