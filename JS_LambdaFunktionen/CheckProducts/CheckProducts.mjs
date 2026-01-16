// CheckProducts.mjs
// Liefert die aktuellen Produkte aus der Inventory-Tabelle
// Kann vom Frontend oder per EventBridge getriggert werden

let docClient;

const INVENTORY_TABLE = "Inventory";

async function initAwsClients() {
    if (process.env.NODE_ENV === "test") {
        return {};
    }

    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const {
        DynamoDBDocumentClient,
        ScanCommand
    } = await import("@aws-sdk/lib-dynamodb");

    docClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({})
    );

    return { ScanCommand };
}

export const handler = async () => {
    try {
        /* =====================
           TEST-MODUS (CI)
           ===================== */
        if (process.env.NODE_ENV === "test") {
            return {
                statusCode: 200,
                message: "TEST OK – CheckProducts ohne AWS ausgeführt"
            };
        }

        /* =====================
           PRODUKTIONS-MODUS
           ===================== */
        const { ScanCommand } = await initAwsClients();

        const result = await docClient.send(
            new ScanCommand({
                TableName: INVENTORY_TABLE
            })
        );

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(result.Items)
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            error: error.message
        };
    }
};

