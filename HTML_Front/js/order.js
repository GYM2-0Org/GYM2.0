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
                produkt_id: product_id
            })
        });

        if (!response.ok) {
            throw new Error("Fehler beim Aufruf der Lambda-Funktion");
        }

        const result = await response.json();
        var text = document.getElementById("orderText");
        text.innerHTML= `
            <span class="success">
                Kauf erfolgreich.<br>
                Bitte entnehmen sie ihr Produkt<br><br>
            </span>
        `;
        window.location.href = "order.html";
        setTimeout(() => {
            window.location.href = "snackMaschine.html";
        }, 10000);
    } catch (error) {
        var text = document.getElementById("orderText");
        text.innerHTML= `
            <span class="error">
                Kauf fehlgeschlagen.<br>
                Der Gewählte Produkttyp ist nicht mehr vorhanden<br><br>
            </span>
        `;
        window.location.href = "order.html";
        console.error("Fehler:", error);
        setTimeout(() => {
            window.location.href = "snackMaschine.html";
        }, 10000);
    }
}
