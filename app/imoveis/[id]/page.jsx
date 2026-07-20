'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, BedDouble, Bath, Square, Car, Layers, FileText, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Sidebar from "../../components/sidebar/page"

export default function VisualizarImovel({ params }) {
  const router = useRouter()
  const { id } = use(params)
  
  const [imovel, setImovel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchImovel() {
      try {
        const { data, error } = await supabase
          .from('imoveis')
          .select(`
            *,
            imovel_imagens (url, capa)
          `)
          .eq('id', id)
          .single()

        if (error) throw error
        setImovel(data)
      } catch (err) {
        console.error('Erro ao buscar imóvel:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchImovel()
  }, [id])

  // Componente de carregamento mantendo a Sidebar na tela
  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-zinc-50">
        <div className="w-72 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-zinc-900 animate-spin" />
            <p className="text-sm font-medium text-zinc-500">Buscando dados na Alexandria...</p>
          </div>
        </div>
      </div>
    )
  }

  // Componente de erro mantendo a Sidebar na tela
  if (!imovel) {
    return (
      <div className="flex h-screen overflow-hidden bg-zinc-50">
        <div className="w-72 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-zinc-600 font-medium">Imóvel não encontrado em nosso banco de dados.</p>
          <button onClick={() => router.back()} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  const imagens = imovel.imovel_imagens 
    ? [...imovel.imovel_imagens].sort((a, b) => (b.capa ? 1 : 0) - (a.capa ? 1 : 0))
    : []

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* 1. MANTÉM A SUA SIDEBAR AQUI TAMBÉM */}
      <div className="w-72 flex-shrink-0">
        <Sidebar />
      </div>

      {/* 2. CONTEÚDO DA CONSULTA DO IMÓVEL */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="mx-auto max-w-5xl p-6">
          
          {/* Botão Voltar */}
          <button 
            onClick={() => router.back()} 
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          {/* Cabeçalho do Imóvel */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="bg-zinc-900 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider">
                  Ref: {imovel.codigo || imovel.id}
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider ${
                  imovel.status === 'disponivel' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {imovel.status}
                </span>
              </div>
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight">{imovel.titulo}</h1>
              <p className="text-zinc-500 flex items-center gap-1 mt-1 text-sm">
                <MapPin className="w-4 h-4 text-zinc-400" /> {imovel.bairro}, {imovel.cidade} - {imovel.estado}
              </p>
            </div>

            {/* Setor Financeiro */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm text-left md:text-right min-w-[220px]">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Valores de Negociação</p>
              {imovel.preco_venda && (
                <p className="text-xl font-black text-zinc-900 mt-1">
                  Venda: R$ {Number(imovel.preco_venda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              )}
              {imovel.preco_aluguel && (
                <p className="text-lg font-bold text-zinc-700 mt-0.5">
                  Aluguel: R$ {Number(imovel.preco_aluguel).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                </p>
              )}
              {(imovel.valor_condominio || imovel.valor_iptu) && (
                <div className="text-xs text-zinc-400 mt-2 border-t border-zinc-100 pt-2 flex flex-col gap-0.5">
                  {imovel.valor_condominio > 0 && <p>Condomínio: R$ {Number(imovel.valor_condominio).toLocaleString('pt-BR')}</p>}
                  {imovel.valor_iptu > 0 && <p>IPTU: R$ {Number(imovel.valor_iptu).toLocaleString('pt-BR')}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Galeria de Imagens */}
          {imagens.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="md:col-span-2 relative h-[340px] rounded-3xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-sm">
                <Image src={imagens[0].url} alt="Capa" fill className="object-cover" priority />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-4 h-full">
                {imagens.slice(1, 3).map((img, idx) => (
                  <div key={idx} className="relative h-[162px] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-sm">
                    <Image src={img.url} alt={`Foto ${idx + 2}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fichas Técnicas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <InfoBox icon={<BedDouble className="w-5 h-5" />} title="Quartos / Suítes" value={`${imovel.quartos || 0} (${imovel.suites || 0} suítes)`} />
            <InfoBox icon={<Bath className="w-5 h-5" />} title="Banheiros" value={imovel.banheiros || 0} />
            <InfoBox icon={<Square className="w-5 h-5" />} title="Área Construída" value={`${imovel.area_construida || 0} m²`} />
            <InfoBox icon={<Car className="w-5 h-5" />} title="Vagas de Garagem" value={imovel.vagas_garagem || 0} />
          </div>

          {/* Descrição e Diferenciais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <h3 className="text-lg font-bold text-zinc-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-zinc-400" /> Descrição do Imóvel
                </h3>
                <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line">
                  {imovel.descricao || "Nenhuma descrição fornecida para este anúncio."}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm h-fit">
              <h3 className="text-lg font-bold text-zinc-900 mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5 text-zinc-400" /> Diferenciais
              </h3>
              {imovel.diferenciais && imovel.diferenciais.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {imovel.diferenciais.map((item, index) => (
                    <span key={index} className="bg-zinc-100 text-zinc-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-200">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 text-xs">Nenhum diferencial listado.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function InfoBox({ icon, title, value }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      <div className="p-2.5 rounded-xl bg-zinc-50 text-zinc-600 border border-zinc-100">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{title}</p>
        <p className="text-sm font-bold text-zinc-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}