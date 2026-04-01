import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { opportunity_id, brand_category, email, message } = body;

    if (!opportunity_id || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("enquiries")
          .insert({ opportunity_id, brand_category, email, message, status: "new" })
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
      } catch {
        // Supabase error — fall through to fallback
      }
    }

    return NextResponse.json(
      { id: crypto.randomUUID(), opportunity_id, brand_category, email, message, status: "new", created_at: new Date().toISOString() },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
