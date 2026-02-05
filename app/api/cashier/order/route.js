import { db } from "../../../../lib/firebaseAdmin";
import { success, error } from "../../../../lib/response";

export async function GET() {
  try {
    const ordersSnap = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    const results = [];

    for (const orderDoc of ordersSnap.docs) {
      const orderId = orderDoc.id;
      const orderData = orderDoc.data();

      // 1️⃣ session
      const sessionDoc = await db
        .collection("sessions")
        .doc(orderData.sessionId)
        .get();

      if (!sessionDoc.exists) continue;

      const sessionData = sessionDoc.data();

      // 2️⃣ items
      const itemsSnap = await db
        .collection("order_items")
        .where("orderId", "==", orderId)
        .get();

      const items = itemsSnap.docs.map(doc => ({
        itemId: doc.id,
        ...doc.data()
      }));

      const orderTotal = items.reduce(
        (sum, i) => sum + i.price * i.qty,
        0
      );

      // 3️⃣ order status (derived)
      let orderStatus = "pending";
      if (items.every(i => i.status === "served")) {
        orderStatus = "served";
      } else if (items.some(i => i.status === "cooked")) {
        orderStatus = "cooked";
      }

      results.push({
        orderId,
        sessionId: orderData.sessionId,
        sessionStatus: sessionData.status,
        tableId: sessionData.tableId,

        customer: {
          name: sessionData.customerName,
          phone: sessionData.customerPhone
        },

        items,
        orderStatus,
        orderTotal,

        createdAt: orderData.createdAt
      });
    }

    return success(results);

  } catch (err) {
    console.error(err);
    return error(err.message || "Failed to fetch cashier orders", 500);
  }
}
