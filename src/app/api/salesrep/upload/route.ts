import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const salesRepId = formData.get("salesRepId")?.toString();
  const docType = formData.get("type")?.toString() || "id_card";

  if (!file || !salesRepId) {
    return NextResponse.json({ error: "الملف ومعرف المندوب مطلوبان" }, { status: 400 });
  }

  const supabase = await createClient();
  const fileName = `salesrep/${salesRepId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("clinic-assets")
    .upload(fileName, file, { contentType: file.type, upsert: true });

  if (error || !data) {
    return NextResponse.json({ error: "فشل رفع الملف" }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from("clinic-assets").getPublicUrl(data.path);

  const doc = await prisma.salesRepDocument.create({
    data: { salesRepId, type: docType, url: publicUrl },
  });

  return NextResponse.json({ success: true, url: publicUrl, id: doc.id });
}
