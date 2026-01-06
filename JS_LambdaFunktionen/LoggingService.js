/*
Das LoggingService wird per EventBridge aufgerufen.
Dabei wird ab dem 1. des Monats alle Einträge der Logtabelle als CSV in einem Bucket exportiert
*/
const { DynamoDBDocumentClient, ScanCommand } = import("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = import("@aws-sdk/client-dynamodb");
const { S3Client, PutObjectCommand } = import("@aws-sdk/client-s3");

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient());
const s3 = new S3Client();

const ORDER_TABLE = "Orders";
const EXPORT_BUCKET = "amzn-my-export-bucket-gym2-0";

exports.handler = async () => {
    // 1) Alle Orders holen
    const result = await ddb.send(new ScanCommand({ TableName: ORDER_TABLE }));

    const rows = result.Items || [];

    // 2) CSV bauen
    const header = "order_id,produkt_id,p_name,preis,member_id,order_date\n";
    const csv = header + rows.map(r =>
        `${r.order_id},${r.produkt_id},${r.p_name},${r.preis},${r.member_id},${r.order_date}`
    ).join("\n");

    const key = `exports/orders_${new Date().toISOString().slice(0,7)}.csv`;

    // 3) nach S3 schreiben
    await s3.send(
        new PutObjectCommand({
            Bucket: EXPORT_BUCKET,
            Key: key,
            Body: csv,
            ContentType: "text/csv"
        })
    );

    return { file: key };
};
// Der entsprechende Einttrag wird in S3 gespeichert und die Funktion war erfolgreich
