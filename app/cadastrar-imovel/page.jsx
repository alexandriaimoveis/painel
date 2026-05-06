'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import Sidebar from "../components/sidebar/page";

const initialState = {
  codigo: '',
  tipo: '',
  finalidade: 'venda',
  status: 'disponivel',
  preco_venda: '',
  preco_aluguel: '',
  valor_condominio: '',
  valor_iptu: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: 'MG',
  area_total: '',
  area_construida: '',
  quartos: 0,
  suites: 0,
  banheiros: 0,
  vagas_garagem: 0,
  andar: '',
  total_andares: '',
  aceita_pets: false,
  mobiliado: false,
  semi_mobiliado: false,
  piscina: false,
  churrasqueira: false,
  area_servico: false,
  varanda: false,
  portaria_24h: false,
  academia: false,
  salao_festas: false,
  titulo: '',
  descricao: '',
  destaque: false,
  corretor_id: '',
}

const tiposImovel = [
  'casa',
  'apartamento',
  'cobertura',
  'terreno',
  'chacara',
  'sitio',
  'comercial',
  'galpao',
  'loja',
  'sala',
]

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export default function NovoImovelPage() {
  const [form, setForm] = useState(initialState)
  const [corretores, setCorretores] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadCorretores() {
      const { data } = await supabase
        .from('corretores')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome')
      setCorretores(data || [])
    }
    loadCorretores()
  }, [])

  const diferenciaisCondominio = useMemo(() => ([
    { key: 'adega', label: 'Adega' },
    { key: 'almoxarifado', label: 'Almoxarifado' },
    { key: 'ar_condicionado', label: 'Ar Condicionado' },
    { key: 'area_estar_externa', label: 'Área de Estar Externa' },
    { key: 'area_lazer', label: 'Área de Lazer' },
    { key: 'area_verde', label: 'Área Verde' },
    { key: 'atelier', label: 'Atelier' },
    { key: 'bar', label: 'Bar' },
    { key: 'biblioteca', label: 'Biblioteca' },
    { key: 'bicicletario', label: 'Bicicletário' },
    { key: 'boliche', label: 'Boliche' },
    { key: 'brinquedoteca', label: 'Brinquedoteca' },
    { key: 'campo_de_futebol', label: 'Campo de Futebol' },
    { key: 'canil', label: 'Canil' },
    { key: 'centro_de_estetica', label: 'Centro de Estética' },
    { key: 'cerca_eletrica', label: 'Cerca Elétrica' },
    { key: 'churrasqueira_gourmet', label: 'Churrasqueira Gourmet' },
    { key: 'clube', label: 'Clube' },
    { key: 'coffee_shop', label: 'Coffee Shop' },
    { key: 'cozinha_americana', label: 'Cozinha Americana' },
    { key: 'cozinha_gourmet', label: 'Cozinha Gourmet' },
    { key: 'ducha', label: 'Ducha' },
    { key: 'elevador', label: 'Elevador' },
    { key: 'espaco_gourmet', label: 'Espaço Gourmet' },
    { key: 'estacionamento', label: 'Estacionamento' },
    { key: 'estacionamento_coberto', label: 'Estacionamento Coberto' },
    { key: 'garagem', label: 'Garagem' },
    { key: 'garagem_coberta', label: 'Garagem Coberta' },
    { key: 'hidromassagem', label: 'Hidromassagem' },
    { key: 'home_office', label: 'Home Office' },
    { key: 'horta', label: 'Horta' },
    { key: 'internet', label: 'Internet' },
    { key: 'jardim', label: 'Jardim' },
    { key: 'lavanderia', label: 'Lavanderia' },
    { key: 'lavanderia_coletiva', label: 'Lavanderia Coletiva' },
    { key: 'lounge', label: 'Lounge' },
    { key: 'massagem', label: 'Massagem' },
    { key: 'ofuro', label: 'Ofurô' },
    { key: 'parque', label: 'Parque' },
    { key: 'patio', label: 'Pátio' },
    { key: 'permite_animais', label: 'Permite Animais' },
    { key: 'pet_place', label: 'Pet Place' },
    { key: 'pier', label: 'Píer' },
    { key: 'piscina', label: 'Piscina' },
    { key: 'piscina_adulto', label: 'Piscina Adulto' },
    { key: 'piscina_aquecida', label: 'Piscina Aquecida' },
    { key: 'piscina_climatizada', label: 'Piscina Climatizada' },
    { key: 'piscina_coberta', label: 'Piscina Coberta' },
    { key: 'piscina_coberta_climatizada', label: 'Piscina Coberta Climatizada' },
    { key: 'piscina_coberta_com_raia', label: 'Piscina Coberta com Raia' },
    { key: 'piscina_com_hidromassagem', label: 'Piscina com Hidromassagem' },
    { key: 'piscina_com_raia', label: 'Piscina com Raia' },
    { key: 'piscina_infantil', label: 'Piscina Infantil' },
    { key: 'pista_de_atletismo', label: 'Pista de Atletismo' },
    { key: 'pista_de_bicicross', label: 'Pista de Bicicross' },
    { key: 'pista_de_caminhada', label: 'Pista de Caminhada' },
  ]), [])

  const diferenciaisUnidade = useMemo(() => ([
  { key: 'academia', label: 'Academia' },
  { key: 'alarme', label: 'Alarme' },
  { key: 'aquecedor', label: 'Aquecedor' },
  { key: 'aquecimento', label: 'Aquecimento' },
  { key: 'aquecimento_a_gas', label: 'Aquecimento a Gás' },
  { key: 'ar_condicionado', label: 'Ar Condicionado' },
  { key: 'area_de_servico', label: 'Área de Serviço' },
  { key: 'arm_cozinha', label: 'Arm.cozinha' },
  { key: 'arm_embutido', label: 'Arm.embutido' },
  { key: 'banheira', label: 'Banheira' },
  { key: 'bar', label: 'Bar' },
  { key: 'biblioteca', label: 'Biblioteca' },
  { key: 'carpete', label: 'Carpete' },
  { key: 'casa_de_caseiro', label: 'Casa de Caseiro' },
  { key: 'casa_de_fundo', label: 'Casa de Fundo' },
  { key: 'cerca', label: 'Cerca' },
  { key: 'churrasqueira', label: 'Churrasqueira' },
  { key: 'closet', label: 'Closet' },
  { key: 'copa', label: 'Copa' },
  { key: 'cozinha', label: 'Cozinha' },
  { key: 'cozinha_americana', label: 'Cozinha Americana' },
  { key: 'cozinha_gourmet', label: 'Cozinha Gourmet' },
  { key: 'cozinha_independente', label: 'Cozinha Independente' },
  { key: 'dependencia_de_empregados', label: 'Dependência de Empregados' },
  { key: 'deposito', label: 'Depósito' },
  { key: 'despensa', label: 'Despensa' },
  { key: 'ducha', label: 'Ducha' },
  { key: 'escritorio', label: 'Escritório' },
  { key: 'esgoto', label: 'Esgoto' },
  { key: 'espelhos_dagua', label: "Espelhos D'água" },
  { key: 'fogao', label: 'Fogão' },
  { key: 'fogao_eletrico', label: 'Fogão Elétrico' },
  { key: 'freezer', label: 'Freezer' },
  { key: 'frente_para_o_mar', label: 'Frente para o Mar' },
  { key: 'gas_encanado', label: 'Gás Encanado' },
  { key: 'gas_natural', label: 'Gás Natural' },
  { key: 'geladeira', label: 'Geladeira' },
  { key: 'geminada', label: 'Geminada' },
  { key: 'grama', label: 'Grama' },
  { key: 'hidromassagem', label: 'Hidromassagem' },
  { key: 'home_theater', label: 'Home Theater' },
  { key: 'interfone', label: 'Interfone' },
  { key: 'internet_wireless', label: 'Internet / Wireless' },
  { key: 'isolamento_acustico', label: 'Isolamento Acústico' },
  { key: 'jacuzzi', label: 'Jacuzzi' },
  { key: 'lareira', label: 'Lareira' },
  { key: 'lavabo', label: 'Lavabo' },
  { key: 'lustres', label: 'Lustres' },
  { key: 'mezanino', label: 'Mezanino' },
  { key: 'mobiliado', label: 'Mobiliado' },
  { key: 'perto_de_escolas', label: 'Perto de Escolas' },
  { key: 'perto_de_shopping_center', label: 'Perto de Shopping Center' },
  { key: 'perto_de_transporte_publico', label: 'Perto de Transporte Público' },
  { key: 'perto_de_vias_de_access', label: 'Perto de Vias de Acesso' },
  { key: 'piscina', label: 'Piscina' },
  { key: 'piso_de_madeira', label: 'Piso de Madeira' },
  { key: 'piso_elevado', label: 'Piso Elevado' },
  { key: 'piso_frio', label: 'Piso Frio' },
  { key: 'piso_laminado', label: 'Piso Laminado' },
  { key: 'porao', label: 'Porão' },
  { key: 'proximo_a_hospitais', label: 'Próximo a Hospitais' },
  { key: 'quarto_empregados', label: 'Quarto Empregados' },
  { key: 'quintal', label: 'Quintal' },
  { key: 'sacada', label: 'Sacada' },
  { key: 'sala_de_estar', label: 'Sala de Estar' },
  { key: 'sala_de_jantar', label: 'Sala de Jantar' },
  { key: 'sauna', label: 'Sauna' },
  { key: 'seguranca_na_rua', label: 'Segurança Na Rua' },
  { key: 'semi_mobiliado', label: 'Semi Mobiliado' },
  { key: 'servicos_publicos_essenciais', label: 'Serviços Públicos Essenciais' },
  { key: 'sotao', label: 'Sotão' },
  { key: 'terraco', label: 'Terraço' },
  { key: 'teto_rebaixado', label: 'Teto Rebaixado' },
  { key: 'varanda', label: 'Varanda' },
  { key: 'varanda_com_churrasqueira', label: 'Varanda com Churrasqueira' },
  { key: 'varanda_fechada_com_vidro', label: 'Varanda Fechada com Vidro' },
  { key: 'varanda_gourmet', label: 'Varanda Gourmet' },
  { key: 'varanda_integrada_com_a_cozinha', label: 'Varanda Integrada com a Cozinha' },
  { key: 'vista_exterior', label: 'Vista Exterior' },
  { key: 'vista_para_a_montanha', label: 'Vista para a Montanha' },
  { key: 'wc_empregados', label: 'Wc Empregados' },
]), [])

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const body = new FormData()
      body.append('data', JSON.stringify(form))
      files.forEach(file => body.append('files', file))

      const response = await fetch('/api/imoveis', {
        method: 'POST',
        body,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao cadastrar imóvel.')
      }

      setMessage('Imóvel cadastrado com sucesso!')
      setForm(initialState)
      setFiles([])
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <div className="w-72 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-black">
        <div className="mx-auto max-w-6xl p-6">
          <h1 className="mb-6 text-2xl font-semibold text-zinc-800">Novo imóvel</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">
                Identificação
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Título do anúncio *</label>
                  <input
                    className="w-full rounded-xl border px-4 py-3"
                    value={form.titulo}
                    onChange={e => setField('titulo', e.target.value)}
                    required
                    placeholder="Ex: Casa ampla com quintal em Vila Nova"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Código *</label>
                  <input
                    className="w-full rounded-xl border px-4 py-3"
                    value={form.codigo}
                    onChange={e => setField('codigo', e.target.value)}
                    required
                    placeholder="Ex: IMV001"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Corretor</label>
                  <select
                    className="w-full rounded-xl border px-4 py-3"
                    value={form.corretor_id}
                    onChange={e => setField('corretor_id', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {corretores.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Tipo de imóvel *</label>
                  <select
                    className="w-full rounded-xl border px-4 py-3"
                    value={form.tipo}
                    onChange={e => setField('tipo', e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {tiposImovel.map(tipo => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Finalidade *</label>
                  <select
                    className="w-full rounded-xl border px-4 py-3"
                    value={form.finalidade}
                    onChange={e => setField('finalidade', e.target.value)}
                    required
                  >
                    <option value="venda">Venda</option>
                    <option value="aluguel">Aluguel</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">
                Valores
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Preço de venda (R$)" value={form.preco_venda} onChange={v => setField('preco_venda', v)} />
                <Field label="Preço de aluguel (R$/mês)" value={form.preco_aluguel} onChange={v => setField('preco_aluguel', v)} />
                <Field label="Condomínio (R$)" value={form.valor_condominio} onChange={v => setField('valor_condominio', v)} />
                <Field label="IPTU anual (R$)" value={form.valor_iptu} onChange={v => setField('valor_iptu', v)} />
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">
                Localização
              </h2>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="CEP *" value={form.cep} onChange={v => setField('cep', v)} required />
                <div className="md:col-span-2">
                  <Field label="Logradouro *" value={form.logradouro} onChange={v => setField('logradouro', v)} required />
                </div>
                <Field label="Número" value={form.numero} onChange={v => setField('numero', v)} />
                <Field label="Complemento" value={form.complemento} onChange={v => setField('complemento', v)} />
                <Field label="Bairro *" value={form.bairro} onChange={v => setField('bairro', v)} required />
                <div className="md:col-span-2">
                  <Field label="Cidade *" value={form.cidade} onChange={v => setField('cidade', v)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Estado *</label>
                  <select
                    className="w-full rounded-xl border px-4 py-3"
                    value={form.estado}
                    onChange={e => setField('estado', e.target.value)}
                    required
                  >
                    {estados.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">
                Características
              </h2>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Área total (m²)" value={form.area_total} onChange={v => setField('area_total', v)} />
                <Field label="Área construída (m²)" value={form.area_construida} onChange={v => setField('area_construida', v)} />
                <Field label="Andar" value={form.andar} onChange={v => setField('andar', v)} />
                <Stepper label="Quartos" value={form.quartos} onChange={v => setField('quartos', v)} />
                <Stepper label="Suítes" value={form.suites} onChange={v => setField('suites', v)} />
                <Stepper label="Banheiros" value={form.banheiros} onChange={v => setField('banheiros', v)} />
                <Stepper label="Vagas de garagem" value={form.vagas_garagem} onChange={v => setField('vagas_garagem', v)} />
                <Field label="Total de andares" value={form.total_andares} onChange={v => setField('total_andares', v)} />
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">
                Diferenciais - Condomínio
              </h2>

              <div className="flex flex-wrap gap-3">
                {diferenciaisCondominio.map(item => {
                  const active = !!form[item.key]
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => setField(item.key, !active)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${active
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-300 bg-zinc-50 text-zinc-700'
                        }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">
                Diferenciais - Unidade
              </h2>

              <div className="flex flex-wrap gap-3">
                {diferenciaisCondominio.map(item => {
                  const active = !!form[item.key]
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => setField(item.key, !active)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${active
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-300 bg-zinc-50 text-zinc-700'
                        }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">
                Descrição
              </h2>

              <label className="mb-1 block text-sm font-medium">Descrição do imóvel</label>
              <textarea
                className="min-h-[140px] w-full rounded-xl border px-4 py-3"
                value={form.descricao}
                onChange={e => setField('descricao', e.target.value)}
                placeholder="Descreva os pontos fortes do imóvel, localização, acabamentos..."
              />

              <label className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.destaque}
                  onChange={e => setField('destaque', e.target.checked)}
                />
                Imóvel em destaque
              </label>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">
                Fotos do imóvel
              </h2>

              <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-stone-50 px-6 text-center">
                <span className="text-lg">Clique para selecionar as fotos</span>
                <span className="mt-2 text-sm text-zinc-500">
                  JPG, PNG ou WEBP — a primeira foto será a capa
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={e => setFiles(Array.from(e.target.files || []))}
                />
              </label>

              {files.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                  {files.map((file, index) => (
                    <li key={file.name + index}>
                      {index === 0 ? 'Capa • ' : ''}{file.name}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-zinc-900 px-6 py-3 text-white disabled:opacity-60"
              >
                {loading ? 'Salvando...' : 'Salvar imóvel'}
              </button>

              {message && <p className="text-sm text-zinc-700">{message}</p>}
            </div>
          </form>
        </div>

      </div>
    </div>

  )
}

function Field({ label, value, onChange, required = false }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        className="w-full rounded-xl border px-4 py-3"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
      />
    </div>
  )
}

function Stepper({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="h-10 w-10 rounded-xl border"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          -
        </button>
        <span className="min-w-6 text-center">{value}</span>
        <button
          type="button"
          className="h-10 w-10 rounded-xl border"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}