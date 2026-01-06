import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const db = new DynamoDBClient({});

export const handler = async (event) => {
    const { month } = event.queryStringParameters; // z.B. 2025-12

    const res = await db.send(
        new QueryCommand({
            TableName: "payment_logs",
            IndexName: "month_key-index",
            KeyConditionExpression: "month_key = :m",
            ExpressionAttributeValues: { ":m": { S: month } }
        })
    );

    let total = 0;

    for (const item of res.Items ?? []) {
        total += Number(item.price_cents.N) * Number(item.quantity.N);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            month,
            total_cents: total
        })
    };
};
