import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseNumberValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(String(value).replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

function cleanCep(cep) {
  return String(cep || "")
    .replace(/\D/g, "")
    .slice(0, 8);
}

// async function handleImages(files, imovelId) {
//   const imagens = []
//   for (let i = 0; i < files.length; i++) {
//     const file = files[i]
//     if (!file || typeof file === 'string') continue

//     const ext = file.name.split('.').pop()
//     const filePath = `${imovelId}/${Date.now()}-${i}.${ext}`
//     const arrayBuffer = await file.arrayBuffer()

//     const { error: uploadError } = await supabase.storage
//       .from('imoveis')
//       .upload(filePath, arrayBuffer, { contentType: file.type, upsert: false })

//     if (!uploadError) {
//       const { data: publicUrlData } = supabase.storage.from('imoveis').getPublicUrl(filePath)
//       imagens.push({
//         imovel_id: imovelId,
//         url: publicUrlData.publicUrl,
//         ordem: i,
//         capa: i === 0,
//       })
//     }
//   }
//   if (imagens.length > 0) {
//     await supabase.from('imovel_imagens').insert(imagens)
//   }
// }

// Nova função — só registra no banco as URLs já enviadas pelo frontend
async function handleImages(imagens, imovelId) {
  if (!imagens || imagens.length === 0) return;

  // Move os arquivos de temp/ para a pasta definitiva do imóvel
  const registros = [];
  for (const img of imagens) {
    const novoPath = `${imovelId}/${img.path.split("/").pop()}`;

    await supabase.storage.from("imoveis").move(img.path, novoPath);

    const { data: urlData } = supabase.storage
      .from("imoveis")
      .getPublicUrl(novoPath);

    registros.push({
      imovel_id: imovelId,
      url: urlData.publicUrl,
      ordem: img.ordem,
      capa: img.capa,
    });
  }

  if (registros.length > 0) {
    await supabase.from("imovel_imagens").insert(registros);
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const raw = JSON.parse(formData.get("data") || "{}");
    const files = formData.getAll("files");

    const payload = {
      codigo: (raw.codigo || "").trim(),
      tipo: raw.tipo,
      finalidade: raw.finalidade,
      status: raw.status || "disponivel",
      preco_venda: parseNumberValue(raw.preco_venda),
      preco_aluguel: parseNumberValue(raw.preco_aluguel),
      valor_condominio: parseNumberValue(raw.valor_condominio),
      valor_iptu: parseNumberValue(raw.valor_iptu),
      cep: cleanCep(raw.cep),
      logradouro: (raw.logradouro || "").trim(),
      numero: (raw.numero || "").trim() || null,
      complemento: (raw.complemento || "").trim() || null,
      bairro: (raw.bairro || "").trim(),
      cidade: (raw.cidade || "").trim(),
      estado: raw.estado,
      area_total: parseNumberValue(raw.area_total),
      area_construida: parseNumberValue(raw.area_construida),
      quartos: Number(raw.quartos || 0),
      suites: Number(raw.suites || 0),
      banheiros: Number(raw.banheiros || 0),
      vagas_garagem: Number(raw.vagas_garagem || 0),
      andar: raw.andar ? Number(raw.andar) : null,
      total_andares: raw.total_andares ? Number(raw.total_andares) : null,
      diferenciais: raw.diferenciais || {},
      titulo: (raw.titulo || "").trim(),
      descricao: (raw.descricao || "").trim() || null,
      destaque: !!raw.destaque,
      corretor_id: raw.corretor_id ? Number(raw.corretor_id) : null,
    };

    const { data: imovel, error: imovelError } = await supabase
      .from("imoveis")
      .insert(payload)
      .select("id")
      .single();

    if (imovelError)
      return Response.json({ error: imovelError.message }, { status: 400 });

    await handleImages(files, imovel.id);

    return Response.json({ success: true, imovel_id: imovel.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const formData = await request.formData();
    const raw = JSON.parse(formData.get("data") || "{}");
    // const files = formData.getAll("files");
    const imagens = raw.imagens || [];
    const id = raw.id;

    if (!id) throw new Error("ID do imóvel não fornecido.");

    const isQuickUpdate = Object.keys(raw).length === 2 && raw.status;

    let payload;
    if (isQuickUpdate) {
      payload = { status: raw.status };
    } else {
      payload = {
        codigo: (raw.codigo || "").trim(),
        tipo: raw.tipo,
        finalidade: raw.finalidade,
        status: raw.status || "disponivel",
        preco_venda: parseNumberValue(raw.preco_venda),
        preco_aluguel: parseNumberValue(raw.preco_aluguel),
        valor_condominio: parseNumberValue(raw.valor_condominio),
        valor_iptu: parseNumberValue(raw.valor_iptu),
        cep: cleanCep(raw.cep),
        logradouro: (raw.logradouro || "").trim(),
        numero: (raw.numero || "").trim() || null,
        complemento: (raw.complemento || "").trim() || null,
        bairro: (raw.bairro || "").trim(),
        cidade: (raw.cidade || "").trim(),
        estado: raw.estado,
        area_total: parseNumberValue(raw.area_total),
        area_construida: parseNumberValue(raw.area_construida),
        quartos: Number(raw.quartos || 0),
        suites: Number(raw.suites || 0),
        banheiros: Number(raw.banheiros || 0),
        vagas_garagem: Number(raw.vagas_garagem || 0),
        andar: raw.andar ? Number(raw.andar) : null,
        total_andares: raw.total_andares ? Number(raw.total_andares) : null,
        diferenciais: raw.diferenciais || {},
        titulo: (raw.titulo || "").trim(),
        descricao: (raw.descricao || "").trim() || null,
        destaque: !!raw.destaque,
        corretor_id: raw.corretor_id ? Number(raw.corretor_id) : null,
      };
    }

    const { error: updateError } = await supabase
      .from("imoveis")
      .update(payload)
      .eq("id", id);

    if (updateError)
      return Response.json({ error: updateError.message }, { status: 400 });

    if (files.length > 0) {
      // await handleImages(files, id);
      await handleImagens(imagens, imovel.id);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
