import { getActiveOrders } from "../../../../services/order.service";
import { success,  error } from "../../../../lib/response";

export async function GET() {
  try {
    const orders = await getActiveOrders();
    return success(orders, "Active orders fetched");
  } catch (err) {
    console.error(err);
    return error("Failed to fetch orders", 500);
  }
}