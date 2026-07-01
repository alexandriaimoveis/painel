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

async function handleImages(imagens, imovelId) {
  if (!imagens || imagens.length === 0) return;

  const registros = [];
  const erros = [];

  for (const img of imagens) {
    try {
      const novoPath = `${imovelId}/${img.path.split("/").pop()}`;

      const { error: moveError } = await supabase.storage
        .from("imoveis")
        .move(img.path, novoPath);

      if (moveError) {
        erros.push(`Falha ao mover imagem "${img.path}": ${moveError.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("imoveis")
        .getPublicUrl(novoPath);

      registros.push({
        imovel_id: imovelId,
        url: urlData.publicUrl,
        ordem: img.ordem,
        capa: img.capa,
      });
    } catch (err) {
      erros.push(`Erro inesperado ao processar imagem: ${err.message}`);
    }
  }

  if (registros.length > 0) {
    const { error: insertError } = await supabase
      .from("imovel_imagens")
      .insert(registros);

    if (insertError) {
      throw new Error(`Erro ao registrar imagens no banco: ${insertError.message}`);
    }
  }

  if (erros.length > 0) {
    throw new Error(
      `Imóvel salvo, mas ${erros.length} imagem(ns) não puderam ser processadas: ${erros.join(" | ")}`
    );
  }
}

async function handleImageDeletions(ids) {
  if (!ids || ids.length === 0) return;

  const { data: rows, error: fetchError } = await supabase
    .from("imovel_imagens")
    .select("id, url")
    .in("id", ids);

  if (fetchError) {
    throw new Error(`Erro ao buscar imagens para remoção: ${fetchError.message}`);
  }

  const marker = "/object/public/imoveis/";
  const paths = (rows || [])
    .map((row) => {
      const idx = row.url.indexOf(marker);
      return idx !== -1 ? row.url.slice(idx + marker.length) : null;
    })
    .filter(Boolean);

  if (paths.length > 0) {
    const { error: removeError } = await supabase.storage
      .from("imoveis")
      .remove(paths);

    if (removeError) {
      throw new Error(`Erro ao remover arquivos do armazenamento: ${removeError.message}`);
    }
  }

  const { error: deleteError } = await supabase
    .from("imovel_imagens")
    .delete()
    .in("id", ids);

  if (deleteError) {
    throw new Error(`Erro ao remover registros de imagens: ${deleteError.message}`);
  }
}

function buildPayload(raw) {
  return {
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

function translateSupabaseError(message) {
  if (!message) return "Erro desconhecido no banco de dados.";
  if (message.includes("imoveis_codigo_key"))
    return "Código interno já cadastrado. Use um código diferente.";
  if (message.includes("not-null") || message.includes("null value"))
    return "Um campo obrigatório não foi preenchido corretamente.";
  if (message.includes("foreign key"))
    return "Referência inválida (corretor ou proprietário não encontrado).";
  if (message.includes("unique"))
    return "Valor duplicado: um dos campos já está cadastrado.";
  return message;
}

export async function POST(request) {
  try {
    let formData;
    try {
      formData = await request.formData();
    } catch {
      return Response.json(
        { error: "Requisição inválida: não foi possível ler os dados enviados." },
        { status: 400 }
      );
    }

    let raw;
    try {
      raw = JSON.parse(formData.get("data") || "{}");
    } catch {
      return Response.json(
        { error: "Dados do formulário estão em formato inválido (JSON corrompido)." },
        { status: 400 }
      );
    }

    if (!raw.titulo?.trim()) {
      return Response.json({ error: "O título do anúncio é obrigatório." }, { status: 400 });
    }
    if (!raw.tipo) {
      return Response.json({ error: "O tipo do imóvel é obrigatório." }, { status: 400 });
    }
    if (!raw.codigo?.trim()) {
      return Response.json({ error: "O código interno é obrigatório." }, { status: 400 });
    }

    const imagens = raw.imagens || [];
    const payload = buildPayload(raw);

    const { data: imovel, error: imovelError } = await supabase
      .from("imoveis")
      .insert(payload)
      .select("id")
      .single();

    if (imovelError) {
      return Response.json(
        { error: translateSupabaseError(imovelError.message) },
        { status: 400 }
      );
    }

    try {
      await handleImages(imagens, imovel.id);
    } catch (imgError) {
      return Response.json(
        { success: true, imovel_id: imovel.id, warning: imgError.message },
        { status: 207 }
      );
    }

    return Response.json({ success: true, imovel_id: imovel.id });
  } catch (error) {
    console.error("[POST /api/imoveis] Erro inesperado:", error);
    return Response.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    let formData;
    try {
      formData = await request.formData();
    } catch {
      return Response.json(
        { error: "Requisição inválida: não foi possível ler os dados enviados." },
        { status: 400 }
      );
    }

    let raw;
    try {
      raw = JSON.parse(formData.get("data") || "{}");
    } catch {
      return Response.json(
        { error: "Dados do formulário estão em formato inválido (JSON corrompido)." },
        { status: 400 }
      );
    }

    const id = raw.id;
    if (!id) {
      return Response.json({ error: "ID do imóvel não fornecido." }, { status: 400 });
    }

    const isQuickStatusUpdate = raw._action === "toggle_status";

    let payload;
    if (isQuickStatusUpdate) {
      if (!raw.status) {
        return Response.json({ error: "Status não informado." }, { status: 400 });
      }
      payload = { status: raw.status };
    } else {
      if (!raw.titulo?.trim()) {
        return Response.json({ error: "O título do anúncio é obrigatório." }, { status: 400 });
      }
      if (!raw.tipo) {
        return Response.json({ error: "O tipo do imóvel é obrigatório." }, { status: 400 });
      }
      payload = buildPayload(raw);
    }

    const { error: updateError } = await supabase
      .from("imoveis")
      .update(payload)
      .eq("id", id);

    if (updateError) {
      return Response.json(
        { error: translateSupabaseError(updateError.message) },
        { status: 400 }
      );
    }

    if (!isQuickStatusUpdate) {
      const imagens = raw.imagens || [];
      const imagensRemover = raw.imagens_remover || [];
      const warnings = [];

      if (imagensRemover.length > 0) {
        try {
          await handleImageDeletions(imagensRemover);
        } catch (delError) {
          warnings.push(delError.message);
        }
      }

      if (imagens.length > 0) {
        try {
          await handleImages(imagens, id);
        } catch (imgError) {
          warnings.push(imgError.message);
        }
      }

      if (warnings.length > 0) {
        return Response.json(
          { success: true, warning: warnings.join(" | ") },
          { status: 207 }
        );
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/imoveis] Erro inesperado:", error);
    return Response.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
}
