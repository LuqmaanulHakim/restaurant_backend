import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function success(data, message = "Success", status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    {
      status,
      headers: corsHeaders,
    }
  );
}

export function error(message = "Error", status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
      headers: corsHeaders,
    }
  );
}

/**
 * For CORS preflight requests
 */
export function options() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
