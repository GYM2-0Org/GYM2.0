const LAMBDA_URL = "https://h6a15phvcf.execute-api.eu-north-1.amazonaws.com/buy"; // API-Gateway Url

export async function orderSnack(product_id) {
    if (!product_id) {
        alert("Ungültiges Produkt");
        return;
    }
    try {
        const response = await fetch(LAMBDA_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                product_id: product_id
            })
        });

        if (!response.ok) {
            throw new Error("Fehler beim Aufruf der Lambda-Funktion");
        }

        const result = await response.json();

        alert("Bestellung erfolgreich!");
    } catch (error) {
        console.error("Fehler:", error);
        alert("Die Bestellung konnte nicht ausgeführt werden.");
    }
}
