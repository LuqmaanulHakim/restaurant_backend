import { db } from "../../../../lib/firebaseAdmin";
import { success, error } from "../../../../lib/response";

export async function GET(req, { params }) {
    try {
        // Await params in Next.js 15
        const { orderId } = await params;
        
        if (!orderId) throw new Error("Order ID is required");

        const orderDoc = await db.collection("orders").doc(orderId).get();
        if (!orderDoc.exists) throw new Error("Order not found");

        const orderData = orderDoc.data();

        // Get all items for this order
        const itemsSnap = await db
            .collection("order_items")
            .where("orderId", "==", orderId)
            .get();

        const items = itemsSnap.docs.map(doc => {
            const data = doc.data();
            return {
                itemId: doc.id,
                menuId: data.menuId,
                name: data.name,
                price: data.price,
                qty: data.qty,
                specialRequest: data.specialRequest,
                status: data.status
            };
        });

        return success({
            orderId,
            status: orderData.status,
            items
        });
    } catch (err) {
        console.error(err);
        return error(err.message || "Failed to fetch order", 500);
    }
}