import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

interface SalesRepSessionResponse {
  email: string;
  name: string;
}

export async function GET(): Promise<NextResponse<SalesRepSessionResponse | { error: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const metadata = user.user_metadata;
  const fullName =
    typeof metadata?.full_name === "string"
      ? metadata.full_name
      : typeof metadata?.name === "string"
        ? metadata.name
        : "";

  return NextResponse.json({
    email: user.email,
    name: fullName,
  });
}
