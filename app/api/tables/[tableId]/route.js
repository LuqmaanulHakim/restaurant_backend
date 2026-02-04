import { db } from "../../../../lib/firebaseAdmin";
import { success, error } from "../../../../lib/response";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const tableId = params.tableId;

    if (!tableId) throw new Error("Table ID is required");

    // Check active sessions for table
    const sessionSnap = await db
      .collection("sessions")
      .where("tableId", "==", tableId)
      .where("status", "==", "active")
      .get();

    // No active session → table available
    if (sessionSnap.empty) {
      return success({
        tableId,
        status: "available",
        currentOrder: null
      });
    }

    // Process ALL active sessions
    const allSessions = sessionSnap.docs.map(doc => ({
      sessionId: doc.id,
      ...doc.data()
    }));

    // Get orders for all sessions
    const ordersSnap = await db
      .collection("orders")
      .where("sessionId", "in", allSessions.map(s => s.sessionId))
      .get();

    // Get all order items
    const orderIds = ordersSnap.docs.map(doc => doc.id);
    let allItems = [];

    if (orderIds.length > 0) {
      const itemsSnap = await db
        .collection("order_items")
        .where("orderId", "in", orderIds)
        .get();

      allItems = itemsSnap.docs.map(doc => ({
        itemId: doc.id,
        orderId: doc.data().orderId,
        ...doc.data()
      }));
    }

    // Aggregate data by session/order
    const orders = ordersSnap.docs.map(orderDoc => {
      const orderItems = allItems.filter(i => i.orderId === orderDoc.id);
      const total = orderItems.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0);

      return {
        orderId: orderDoc.id,
        sessionId: orderDoc.data().sessionId,
        items: orderItems,
        total
      };
    });

    // Final response
    return success({
      tableId,
      status: "occupied",
      sessions: allSessions.map(session => ({
        sessionId: session.sessionId,
        customer: {
          name: session.customerName,
          phone: session.customerPhone
        },
        orders: orders.filter(o => o.sessionId === session.sessionId)
      })),
      totalOrders: orders.length
    });

  } catch (err) {
    console.error(err);
    return error(err.message || "Failed to get table info", 500);
  }
}