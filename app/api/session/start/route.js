import { startSession } from "../../../../services/session.service";
import { success, error } from "../../../../lib/response";

export async function POST(req) {
  try {
    const body = await req.json();
    const { tableId, customerName } = body;

    const session = await startSession(tableId, customerName);

    return success(session, "Session started successfully");
  } catch (err) {
    console.error(err);
    return error(err.message || "Failed to start session", 500);
  }
}