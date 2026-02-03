import { updateOrderStatus } from "../../../../../services/order.service";
import { success, error } from "../../../../../lib/response";

export async function POST(req, { params }) {
  try {
    const { orderId } = await params;

    const body = await req.json();
    const { status } = body;

    if (!status) {
      throw new Error("Missing 'status' in request body");
    }

    const result = await updateOrderStatus(orderId, status);

    return success(result, "Order status updated via POST");
  } catch (err) {
    console.error(err);
    return error(err.message || "Failed to update status", 500);
  }
}
