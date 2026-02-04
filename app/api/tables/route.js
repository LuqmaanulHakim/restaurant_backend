import { db } from "../../../lib/firebaseAdmin";
import { success, error } from "../../../lib/response";

export async function GET() {
  try {
    const tablesSnap = await db.collection("tables").get();
    const results = [];

    for (const tableDoc of tablesSnap.docs) {
      const tableId = tableDoc.id;
      const tableData = tableDoc.data();

      // Get all active sessions for this table
      const sessionSnap = await db
        .collection("sessions")
        .where("tableId", "==", tableId)
        .where("status", "==", "active")
        .get();

      let tableOrders = [];
      let tableTotal = 0;
      let customers = [];

      if (!sessionSnap.empty) {
        for (const sessionDoc of sessionSnap.docs) {
          const sessionData = sessionDoc.data();
          customers.push({
            name: sessionData.customerName,
            phone: sessionData.customerPhone
          });

          // Get all orders for this session
          const orderSnap = await db
            .collection("orders")
            .where("sessionId", "==", sessionDoc.id)
            .get();

          for (const orderDoc of orderSnap.docs) {
            const itemsSnap = await db
              .collection("order_items")
              .where("orderId", "==", orderDoc.id)
              .get();

            const items = itemsSnap.docs.map(doc => doc.data());
            const orderTotal = items.reduce(
              (sum, i) => sum + i.price * i.qty,
              0
            );

            tableTotal += orderTotal;

            tableOrders.push({
              orderId: orderDoc.id,
              total: orderTotal
            });
          }
        }
      }

      results.push({
        tableId,
        capacity: tableData.capacity,
        status: sessionSnap.empty ? "available" : "active",
        customers,      // array of all customers at this table
        orders: tableOrders,
        tableTotal
      });
    }

    return success(results);

  } catch (err) {
    console.error(err);
    return error(err.message || "Failed to fetch tables", 500);
  }
}