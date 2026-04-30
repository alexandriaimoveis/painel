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

  const diferenciais = useMemo(() => ([
    { key: 'piscina', label: 'Piscina' },
    { key: 'churrasqueira', label: 'Churrasqueira' },
    { key: 'varanda', label: 'Varanda' },
    { key: 'academia', label: 'Academia' },
    { key: 'salao_festas', label: 'Salão de Festas' },
    { key: 'portaria_24h', label: 'Portaria 24h' },
    { key: 'area_servico', label: 'Área de Serviço' },
    { key: 'mobiliado', label: 'Mobiliado' },
    { key: 'semi_mobiliado', label: 'Semi-Mobiliado' },
    { key: 'aceita_pets', label: 'Aceita Pets' },
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

    <div className="flex">
      <div className="flex-1/12">
        <Sidebar />
      </div>

      <div className="flex-10/12">

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
                Diferenciais
              </h2>

              <div className="flex flex-wrap gap-3">
                {diferenciais.map(item => {
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