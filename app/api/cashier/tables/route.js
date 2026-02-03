import { db } from "../../../../lib/firebaseAdmin";
import { success, error } from "../../../../lib/response";

// GET /api/cashier/tables
export async function GET() {
  try {
    // 1️⃣ Get all active sessions
    const sessionsSnap = await db.collection("sessions")
      .where("status", "==", "active")
      .get();

    const tables = [];

    for (const doc of sessionsSnap.docs) {
      const session = doc.data();
      const sessionId = doc.id;

      // 2️⃣ Get all orders for this session
      const ordersSnap = await db.collection("orders")
        .where("sessionId", "==", sessionId)
        .get();

      const orders = [];
      let tableTotal = 0;

      for (const orderDoc of ordersSnap.docs) {
        const order = orderDoc.data();
        const orderId = orderDoc.id;

        // 3️⃣ Get order items
        const itemsSnap = await db.collection("order_items")
          .where("orderId", "==", orderId)
          .get();

        const items = itemsSnap.docs.map(i => {
          const data = i.data();
          tableTotal += data.price * data.qty;
          return data;
        });

        orders.push({
          orderId,
          status: order.status,
          createdAt: order.createdAt,
          items
        });
      }

      tables.push({
        sessionId,
        tableId: session.tableId,
        customerName: session.customerName,
        customerPhone: session.customerPhone,
        orders,
        total: tableTotal
      });
    }

    return success({ tables }, "Active tables retrieved successfully");

  } catch (err) {
    console.error(err);
    return error(err.message || "Failed to get tables", 500);
  }
}
