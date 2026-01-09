import { orderSnack } from "./order.js";
const PRODUCTS_URL = "https://h6a15phvcf.execute-api.eu-north-1.amazonaws.com/products";
document.addEventListener("DOMContentLoaded", loadProducts);

export async function loadProducts() {
    const res = await fetch(PRODUCTS_URL, { cache: "no-store" });
    const products = await res.json();

    const container = document.getElementById("products");
    container.innerHTML = "";

    products.forEach(p => {
        const btn = document.createElement("button");
        btn.className = "Snack-button";
        btn.innerHTML = `
            <img src=p.icon>
            <span>${p.p_name}</span>
            <p>${p.preis} €</p>
        `;

        btn.addEventListener("click", () => orderSnack(p.produkt_id));
        container.appendChild(btn);
    });
}
