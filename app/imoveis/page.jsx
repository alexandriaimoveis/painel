'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import Sidebar from "../components/sidebar/page";

const tiposImovel = [
  'casa', 'apartamento', 'cobertura', 'terreno', 'chacara', 
  'sitio', 'comercial', 'galpao', 'loja', 'sala'
]

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

const LISTA_DIFERENCIAIS = [
  { key: 'academia', label: 'Academia' }, { key: 'adega', label: 'Adega' }, { key: 'alarme', label: 'Alarme' },
  { key: 'aquecedor', label: 'Aquecedor' }, { key: 'ar_condicionado', label: 'Ar Condicionado' },
  { key: 'area_lazer', label: 'Área de Lazer' }, { key: 'area_verde', label: 'Área Verde' },
  { key: 'arm_cozinha', label: 'Armários Cozinha' }, { key: 'arm_embutido', label: 'Armários Embutidos' },
  { key: 'banheira', label: 'Banheira' }, { key: 'bicicletario', label: 'Bicicletário' },
  { key: 'brinquedoteca', label: 'Brinquedoteca' }, { key: 'campo_futebol', label: 'Campo de Futebol' },
  { key: 'canil', label: 'Canil' }, { key: 'casa_caseiro', label: 'Casa de Caseiro' },
  { key: 'cerca_eletrica', label: 'Cerca Elétrica' }, { key: 'churrasqueira', label: 'Churrasqueira' },
  { key: 'closet', label: 'Closet' }, { key: 'copa', label: 'Copa' }, { key: 'cozinha_americana', label: 'Cozinha Americana' },
  { key: 'cozinha_gourmet', label: 'Cozinha Gourmet' }, { key: 'dep_empregados', label: 'Dep. Empregados' },
  { key: 'deposito', label: 'Depósito' }, { key: 'despensa', label: 'Despensa' },
  { key: 'elevador', label: 'Elevador' }, { key: 'escritorio', label: 'Escritório' },
  { key: 'esgoto', label: 'Esgoto' }, { key: 'espaco_gourmet', label: 'Espaço Gourmet' },
  { key: 'estacionamento', label: 'Estacionamento' }, { key: 'gas_encanado', label: 'Gás Encanado' },
  { key: 'gerador', label: 'Gerador' }, { key: 'hidromassagem', label: 'Hidromassagem' },
  { key: 'home_theater', label: 'Home Theater' }, { key: 'interfone', label: 'Interfone' },
  { key: 'internet', label: 'Internet' }, { key: 'jardim', label: 'Jardim' },
  { key: 'lareira', label: 'Lareira' }, { key: 'lavabo', label: 'Lavabo' },
  { key: 'lavanderia', label: 'Lavanderia' }, { key: 'mezanino', label: 'Mezanino' },
  { key: 'mobiliado', label: 'Mobiliado' }, { key: 'piscina', label: 'Piscina' },
  { key: 'piso_elevado', label: 'Piso Elevado' }, { key: 'playground', label: 'Playground' },
  { key: 'portaria_24h', label: 'Portaria 24h' }, { key: 'quadra_esportiva', label: 'Quadra Esportiva' },
  { key: 'quintal', label: 'Quintal' }, { key: 'sacada', label: 'Sacada' },
  { key: 'salao_festas', label: 'Salão de Festas' }, { key: 'salao_jogos', label: 'Salão de Jogos' },
  { key: 'sauna', label: 'Sauna' }, { key: 'varanda_gourmet', label: 'Varanda Gourmet' }
];

const MAPA_VISIBILIDADE = {
  apartamento: ['elevador', 'portaria_24h', 'sacada', 'salao_festas', 'academia', 'piscina', 'gas_encanado', 'playground', 'bicicletario', 'interfone', 'lavanderia'],
  casa: ['quintal', 'churrasqueira', 'piscina', 'canil', 'jardim', 'alarme', 'cerca_eletrica', 'casa_caseiro', 'copa', 'despensa', 'lareira'],
  terreno: ['esgoto', 'area_verde', 'cerca_eletrica', 'deposito'],
  comercial: ['estacionamento', 'ar_condicionado', 'gerador', 'interfone', 'alarme', 'piso_elevado', 'mezanino', 'escritorio'],
};

const DIFERENCIAIS_GERAIS = ['internet', 'ar_condicionado', 'mobiliado', 'dep_empregados'];

const baseState = {
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
  titulo: '', 
  descricao: '', 
  destaque: false, 
  corretor_id: '',
}

const difState = LISTA_DIFERENCIAIS.reduce((acc, item) => {
  acc[item.key] = false;
  return acc;
}, {});

const initialState = { ...baseState, ...difState };

export default function NovoImovelPage() {
  const [form, setForm] = useState(initialState)
  const [corretores, setCorretores] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadCorretores() {
      const { data } = await supabase.from('corretores').select('id, nome').eq('ativo', true).order('nome')
      setCorretores(data || [])
    }
    loadCorretores()
  }, [])

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const diferenciaisExibidos = useMemo(() => {
    if (!form.tipo) return [];
    const permitidos = MAPA_VISIBILIDADE[form.tipo] || [];
    return LISTA_DIFERENCIAIS.filter(item => 
      permitidos.includes(item.key) || DIFERENCIAIS_GERAIS.includes(item.key)
    );
  }, [form.tipo]);

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const payload = { ...form };
      const diferenciaisMap = {};
      
      LISTA_DIFERENCIAIS.forEach(item => {
        diferenciaisMap[item.key] = payload[item.key];
        delete payload[item.key];
      });

      const finalData = { ...payload, diferenciais: diferenciaisMap };

      const body = new FormData()
      body.append('data', JSON.stringify(finalData))
      files.forEach(file => body.append('files', file))

      const response = await fetch('/api/imoveis', { method: 'POST', body })
      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Erro ao cadastrar imóvel.')

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
      <div className="w-56 flex-shrink-0"><Sidebar /></div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900">Cadastrar novo imóvel</h1>
            <p className="text-zinc-500">Preencha os dados abaixo para publicar o anúncio.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8 pb-20">
            
            <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">1. Identificação</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Título do Anúncio *" value={form.titulo} onChange={v => setField('titulo', v)} required placeholder="Ex: Apartamento decorado no Centro" />
                </div>
                <Field label="Código Interno *" value={form.codigo} onChange={v => setField('codigo', v)} required placeholder="Ex: AP001" />
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Corretor Responsável</label>
                  <select className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-200" value={form.corretor_id} onChange={e => setField('corretor_id', e.target.value)}>
                    <option value="">Selecione um corretor...</option>
                    {corretores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Tipo de Imóvel *</label>
                  <select className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-200" value={form.tipo} onChange={e => setField('tipo', e.target.value)} required>
                    <option value="">Selecione o tipo...</option>
                    {tiposImovel.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Finalidade *</label>
                  <select className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-200" value={form.finalidade} onChange={e => setField('finalidade', e.target.value)} required>
                    <option value="venda">Venda</option>
                    <option value="aluguel">Aluguel</option>
                    <option value="venda_aluguel">Venda ou Aluguel</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">2. Valores</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Field label="Venda (R$)" value={form.preco_venda} onChange={v => setField('preco_venda', v)} placeholder="0,00" />
                <Field label="Aluguel (R$)" value={form.preco_aluguel} onChange={v => setField('preco_aluguel', v)} placeholder="0,00" />
                <Field label="Condomínio (R$)" value={form.valor_condominio} onChange={v => setField('valor_condominio', v)} placeholder="0,00" />
                <Field label="IPTU (R$)" value={form.valor_iptu} onChange={v => setField('valor_iptu', v)} placeholder="0,00" />
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">3. Localização</h2>
              <div className="grid gap-6 md:grid-cols-3">
                <Field label="CEP *" value={form.cep} onChange={v => setField('cep', v)} required />
                <div className="md:col-span-2">
                  <Field label="Logradouro *" value={form.logradouro} onChange={v => setField('logradouro', v)} required />
                </div>
                <Field label="Número" value={form.numero} onChange={v => setField('numero', v)} />
                <Field label="Bairro *" value={form.bairro} onChange={v => setField('bairro', v)} required />
                <Field label="Cidade *" value={form.cidade} onChange={v => setField('cidade', v)} required />
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Estado *</label>
                  <select className="w-full rounded-xl border border-zinc-300 px-4 py-3" value={form.estado} onChange={e => setField('estado', e.target.value)} required>
                    {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">4. Características</h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <Field label="Área Total (m²)" value={form.area_total} onChange={v => setField('area_total', v)} />
                <Field label="Área Útil (m²)" value={form.area_construida} onChange={v => setField('area_construida', v)} />
                
                {['apartamento', 'sala', 'cobertura'].includes(form.tipo) && (
                  <>
                    <Field label="Andar" value={form.andar} onChange={v => setField('andar', v)} />
                    <Field label="Total de Andares" value={form.total_andares} onChange={v => setField('total_andares', v)} />
                  </>
                )}

                <Stepper label="Quartos" value={form.quartos} onChange={v => setField('quartos', v)} />
                <Stepper label="Suítes" value={form.suites} onChange={v => setField('suites', v)} />
                <Stepper label="Banheiros" value={form.banheiros} onChange={v => setField('banheiros', v)} />
                <Stepper label="Vagas Garagem" value={form.vagas_garagem} onChange={v => setField('vagas_garagem', v)} />
              </div>
            </section>

            {form.tipo && (
              <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">5. Diferenciais e Comodidades</h2>
                <div className="flex flex-wrap gap-3">
                  {diferenciaisExibidos.map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setField(item.key, !form[item.key])}
                      className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                        form[item.key] 
                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' 
                        : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">6. Conteúdo do Anúncio</h2>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">Descrição Detalhada</label>
                  <textarea 
                    className="min-h-[200px] w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-200" 
                    value={form.descricao} 
                    onChange={e => setField('descricao', e.target.value)}
                    placeholder="Fale sobre o imóvel, acabamentos, localização próxima, etc..."
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    checked={form.destaque} 
                    onChange={e => setField('destaque', e.target.checked)} 
                  />
                  <span className="text-sm font-semibold text-zinc-800">Colocar este imóvel em destaque na página inicial</span>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">7. Fotos</h2>
              <div className="group relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:bg-zinc-100">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="absolute inset-0 cursor-pointer opacity-0" 
                  onChange={e => setFiles(Array.from(e.target.files || []))} 
                />
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-900">Clique ou arraste as fotos aqui</p>
                  <p className="text-xs text-zinc-500">JPG, PNG ou WEBP (A primeira foto será a capa)</p>
                </div>
              </div>
              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {files.map((f, i) => (
                    <div key={i} className="rounded-lg bg-zinc-200 p-2 text-[10px] truncate text-zinc-600">
                      {i === 0 ? '⭐ CAPA: ' : ''}{f.name}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="flex items-center justify-end gap-4 border-t pt-8">
              <button 
                type="button" 
                onClick={() => window.history.back()}
                className="rounded-xl px-6 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="rounded-xl bg-zinc-900 px-10 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-800 disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Salvar e Publicar Imóvel'}
              </button>
            </div>
            
            {message && (
              <div className={`mt-4 rounded-xl p-4 text-center text-sm font-medium ${message.includes('Erro') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {message}
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, required = false, placeholder = "" }) {
  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
      <input 
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-200 transition" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        required={required} 
        placeholder={placeholder} 
      />
    </div>
  )
}

function Stepper({ label, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
      <div className="flex items-center gap-1">
        <button 
          type="button" 
          className="flex h-12 w-12 items-center justify-center rounded-l-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200" 
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          -
        </button>
        <div className="flex h-12 w-12 items-center justify-center border-y border-zinc-300 font-semibold">
          {value}
        </div>
        <button 
          type="button" 
          className="flex h-12 w-12 items-center justify-center rounded-r-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200" 
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}