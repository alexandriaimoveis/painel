import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function parseMoney(value) {
  if (!value) return null
  const normalized = String(value).replace(/\./g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isNaN(n) ? null : n
}

function parseNumberValue(value) {
  if (!value) return null
  const n = Number(String(value).replace(',', '.'))
  return Number.isNaN(n) ? null : n
}

function cleanCep(cep) {
  return String(cep || '').replace(/\D/g, '').slice(0, 8)
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const raw = JSON.parse(formData.get('data') || '{}')
    const files = formData.getAll('files')

    const payload = {
      codigo: (raw.codigo || '').trim(),
      tipo: raw.tipo,
      finalidade: raw.finalidade,
      status: raw.status || 'disponivel',
      preco_venda: parseMoney(raw.preco_venda),
      preco_aluguel: parseMoney(raw.preco_aluguel),
      valor_condominio: parseMoney(raw.valor_condominio),
      valor_iptu: parseMoney(raw.valor_iptu),
      cep: cleanCep(raw.cep),
      logradouro: (raw.logradouro || '').trim(),
      numero: (raw.numero || '').trim() || null,
      complemento: (raw.complemento || '').trim() || null,
      bairro: (raw.bairro || '').trim(),
      cidade: (raw.cidade || '').trim(),
      estado: raw.estado,
      area_total: parseNumberValue(raw.area_total),
      area_construida: parseNumberValue(raw.area_construida),
      quartos: Number(raw.quartos || 0),
      suites: Number(raw.suites || 0),
      banheiros: Number(raw.banheiros || 0),
      vagas_garagem: Number(raw.vagas_garagem || 0),
      andar: raw.andar ? Number(raw.andar) : null,
      total_andares: raw.total_andares ? Number(raw.total_andares) : null,
      aceita_pets: !!raw.aceita_pets,
      mobiliado: !!raw.mobiliado,
      semi_mobiliado: !!raw.semi_mobiliado,
      piscina: !!raw.piscina,
      churrasqueira: !!raw.churrasqueira,
      area_servico: !!raw.area_servico,
      varanda: !!raw.varanda,
      portaria_24h: !!raw.portaria_24h,
      academia: !!raw.academia,
      salao_festas: !!raw.salao_festas,
      titulo: (raw.titulo || '').trim(),
      descricao: (raw.descricao || '').trim() || null,
      destaque: !!raw.destaque,
      corretor_id: raw.corretor_id ? Number(raw.corretor_id) : null,
    }

    const { data: imovel, error: imovelError } = await supabase
      .from('imoveis')
      .insert(payload)
      .select('id, codigo')
      .single()

    if (imovelError) {
      return Response.json({ error: imovelError.message }, { status: 400 })
    }

    const imagens = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file || typeof file === 'string') continue

      const ext = file.name.split('.').pop()
      const filePath = `${imovel.id}/${Date.now()}-${i}.${ext}`
      const arrayBuffer = await file.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('imoveis')
        .upload(filePath, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        return Response.json({ error: uploadError.message }, { status: 400 })
      }

      const { data: publicUrlData } = supabase.storage
        .from('imoveis')
        .getPublicUrl(filePath)

      imagens.push({
        imovel_id: imovel.id,
        url: publicUrlData.publicUrl,
        ordem: i,
        capa: i === 0,
      })
    }

    if (imagens.length > 0) {
      const { error: imagensError } = await supabase
        .from('imovel_imagens')
        .insert(imagens)

      if (imagensError) {
        return Response.json({ error: imagensError.message }, { status: 400 })
      }
    }

    return Response.json({
      success: true,
      imovel_id: imovel.id,
    })
  } catch (error) {
    return Response.json(
      { error: error.message || 'Erro interno ao cadastrar imóvel.' },
      { status: 500 }
    )
  }
}