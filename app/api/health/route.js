import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: "200",
    message: "Backend API is running smoothly.",
    time: new Date().toISOString()
 });
}