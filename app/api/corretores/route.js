import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function uploadFoto(file) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `fotos/${fileName}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("corretores")
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("corretores").getPublicUrl(filePath);

  return publicUrl;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const raw = JSON.parse(formData.get("data") || "{}");
    const file = formData.get("file");

    let foto_url = "";
    if (file && typeof file !== "string") {
      foto_url = await uploadFoto(file);
    }

    let insertPayload = { ...raw };
    delete insertPayload.id; 
    
    if (foto_url) {
      insertPayload.foto_url = foto_url;
    }

    const { data, error } = await supabase
      .from("corretores")
      .insert([insertPayload]) // Envia o payload limpo
      .select();

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const formData = await request.formData();
    const raw = JSON.parse(formData.get("data") || "{}");
    const file = formData.get("file");
    const id = raw.id;

    if (!id) throw new Error("ID não fornecido.");

    let updatePayload = { ...raw };
    delete updatePayload.id;
    delete updatePayload.created_at;

    if (file && typeof file !== "string") {
      updatePayload.foto_url = await uploadFoto(file);
    }

    const { error } = await supabase
      .from("corretores")
      .update(updatePayload)
      .eq("id", id);

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}