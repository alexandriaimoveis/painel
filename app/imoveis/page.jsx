'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import Sidebar from "../components/sidebar/page";
import { User } from 'lucide-react';
import imageCompression from 'browser-image-compression';

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`${enabled ? 'bg-zinc-900' : 'bg-zinc-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
    >
      <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
    </button>
  )
}

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
  { key: 'academia', label: 'Academia' },
  { key: 'acesso_deficientes', label: 'Acesso para Deficientes' },
  { key: 'adega', label: 'Adega' },
  { key: 'agua', label: 'Água' },
  { key: 'alarme', label: 'Alarme' },
  { key: 'almoxarifado', label: 'Almoxarifado' },
  { key: 'aquecedor', label: 'Aquecedor' },
  { key: 'aquecimento_central', label: 'Aquecimento Central' },
  { key: 'aquecimento_solar', label: 'Aquecimento Solar' },
  { key: 'ar_condicionado', label: 'Ar Condicionado' },
  { key: 'area_lazer', label: 'Área de Lazer' },
  { key: 'area_servico', label: 'Área de Serviço' },
  { key: 'area_verde', label: 'Área Verde / Parque' },
  { key: 'armario_banheiro', label: 'Armário Banheiro' },
  { key: 'armario_closet', label: 'Armário Closet' },
  { key: 'armario_corredor', label: 'Armário Corredor' },
  { key: 'armario_cozinha', label: 'Armário Cozinha' },
  { key: 'armario_dormitorio', label: 'Armário Dormitório' },
  { key: 'armario_escritorio', label: 'Armário Escritório' },
  { key: 'armario_area_servico', label: 'Armário Área de Serviço' },
  { key: 'banheira', label: 'Banheira' },
  { key: 'banheiro_auxiliar', label: 'Banheiro Auxiliar' },
  { key: 'banheiro_empregada', label: 'Banheiro Empregada' },
  { key: 'bicicletario', label: 'Bicicletário' },
  { key: 'brinquedoteca', label: 'Brinquedoteca' },
  { key: 'boca_lobo', label: 'Boca de Lobo' },
  { key: 'cabine_primaria', label: 'Cabine Primária' },
  { key: 'calcetamento', label: 'Calcetamento' },
  { key: 'cameras_seguranca', label: 'Câmeras de Segurança' },
  { key: 'campo_futebol', label: 'Campo de Futebol' },
  { key: 'canal_internet', label: 'Canal Internet' },
  { key: 'canil', label: 'Canil' },
  { key: 'casa_caseiro', label: 'Casa de Caseiro' },
  { key: 'catraca_eletronica', label: 'Catraca Eletrônica' },
  { key: 'cerca_eletrica', label: 'Cerca Elétrica' },
  { key: 'churrasqueira', label: 'Churrasqueira' },
  { key: 'cinema', label: 'Cinema' },
  { key: 'clube', label: 'Clube' },
  { key: 'closet', label: 'Closet' },
  { key: 'com_cerca', label: 'Com Cerca' },
  { key: 'copa', label: 'Copa' },
  { key: 'cozinha', label: 'Cozinha' },
  { key: 'cozinha_americana', label: 'Cozinha Americana' },
  { key: 'cozinha_independente', label: 'Cozinha Independente' },
  { key: 'cozinha_gourmet', label: 'Cozinha Gourmet' },
  { key: 'decorado', label: 'Decorado' },
  { key: 'dep_empregados', label: 'Dep. Empregados' },
  { key: 'deposito', label: 'Depósito' },
  { key: 'despensa', label: 'Despensa' },
  { key: 'edicula', label: 'Edícula' },
  { key: 'elevador', label: 'Elevador' },
  { key: 'elevador_servico', label: 'Elevador de Serviço' },
  { key: 'energia_eletrica', label: 'Energia Elétrica' },
  { key: 'entrada_servico_independente', label: 'Entrada de Serviço Independente' },
  { key: 'entrada_lateral', label: 'Entrada Lateral' },
  { key: 'escritorio', label: 'Escritório / Home Office' },
  { key: 'esgoto', label: 'Esgoto' },
  { key: 'espaco_gourmet', label: 'Espaço Gourmet' },
  { key: 'espaco_zen', label: 'Espaço Zen' },
  { key: 'estacionamento', label: 'Estacionamento Rotativo' },
  { key: 'estacionamento_visitantes', label: 'Estacionamento Visitantes' },
  { key: 'estrada_asfaltada', label: 'Estrada Asfaltada' },
  { key: 'frente_mar', label: 'Frente para o Mar' },
  { key: 'gas_encanado', label: 'Gás Encanado' },
  { key: 'gerador', label: 'Gerador' },
  { key: 'guarita', label: 'Guarita' },
  { key: 'guias_sarjetas', label: 'Guias e Sarjetas' },
  { key: 'hidromassagem', label: 'Hidromassagem' },
  { key: 'home_theater', label: 'Home Theater' },
  { key: 'horta', label: 'Horta' },
  { key: 'iluminacao_publica', label: 'Iluminação Pública' },
  { key: 'infraestrutura_internet', label: 'Infraestrutura Internet' },
  { key: 'interfone', label: 'Interfone' },
  { key: 'internet', label: 'Internet' },
  { key: 'jardim', label: 'Jardim' },
  { key: 'lago', label: 'Lago' },
  { key: 'lareira', label: 'Lareira' },
  { key: 'lavabo', label: 'Lavabo' },
  { key: 'lavanderia', label: 'Lavanderia' },
  { key: 'lavanderia_coletiva', label: 'Lavanderia Coletiva' },
  { key: 'luminarias', label: 'Luminárias' },
  { key: 'mezanino', label: 'Mezanino' },
  { key: 'mobiliado', label: 'Mobiliado' },
  { key: 'muro', label: 'Muro' },
  { key: 'panti_house', label: 'Panti House / Ofurô' },
  { key: 'pasto', label: 'Pasto' },
  { key: 'perto_escolas', label: 'Perto de Escolas' },
  { key: 'perto_hospitais', label: 'Perto de Hospitais' },
  { key: 'perto_shopping', label: 'Perto de Shopping Center' },
  { key: 'perto_transporte', label: 'Perto de Transporte Público' },
  { key: 'perto_vias_acesso', label: 'Perto de Vias de Acesso' },
  { key: 'piscina', label: 'Piscina' },
  { key: 'piscina_adulto', label: 'Piscina Adulto' },
  { key: 'piscina_aquecida', label: 'Piscina Aquecida' },
  { key: 'piscina_coberta', label: 'Piscina Coberta com Raia' },
  { key: 'piscina_infantil', label: 'Piscina Infantil' },
  { key: 'piso_elevado', label: 'Piso Elevado' },
  { key: 'piso_frio', label: 'Piso Frio' },
  { key: 'piso_laminado', label: 'Piso Laminado' },
  { key: 'piso_madeira', label: 'Piso de Madeira' },
  { key: 'pista_cooper', label: 'Pista de Cooper' },
  { key: 'playground', label: 'Playground' },
  { key: 'pomar', label: 'Pomar' },
  { key: 'portao_eletronico', label: 'Portão Eletrônico' },
  { key: 'portaria_24h', label: 'Portaria 24h' },
  { key: 'quadra_esportiva', label: 'Quadra Esportiva' },
  { key: 'quadra_tennis', label: 'Quadra de Tênis' },
  { key: 'quintal', label: 'Quintal' },
  { key: 'recepcao', label: 'Recepção' },
  { key: 'reservatorio_agua', label: 'Reservatório de Água' },
  { key: 'sacada', label: 'Sacada' },
  { key: 'saida_emergencia', label: 'Saída de Emergência' },
  { key: 'sala_almoco', label: 'Sala de Almoço' },
  { key: 'sala_conferencias', label: 'Sala de Conferências' },
  { key: 'sala_jantar', label: 'Sala de Jantar' },
  { key: 'sala_ginastica', label: 'Sala de Ginástica' },
  { key: 'sala_massagem', label: 'Sala de Massagem' },
  { key: 'sala_reuniao', label: 'Sala de Reunião' },
  { key: 'salao_festas', label: 'Salão de Festas' },
  { key: 'salao_jogos', label: 'Salão de Jogos' },
  { key: 'sauna', label: 'Sauna' },
  { key: 'sauna_umida', label: 'Sauna Úmida' },
  { key: 'seguranca_interna', label: 'Segurança Interna' },
  { key: 'sem_condominio', label: 'Sem Condomínio' },
  { key: 'sistema_alarme', label: 'Sistema de Alarme' },
  { key: 'sistema_incendio', label: 'Sistema de Incêndio' },
  { key: 'solarium', label: 'Solarium' },
  { key: 'spa', label: 'SPA' },
  { key: 'tv_cabo', label: 'TV a Cabo' },
  { key: 'vaga_garagem', label: 'Vaga de Garagem' },
  { key: 'varanda', label: 'Varanda' },
  { key: 'varanda_gourmet', label: 'Varanda Gourmet' },
  { key: 'vigilancia_24h', label: 'Vigilância 24h' },
  { key: 'vista_montanhas', label: 'Vista para Montanhas' },
  { key: 'vestiario', label: 'Vestiário' },
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'zelador', label: 'Zelador' }
];

const MAPA_VISIBILIDADE = {
  casa: [
    'academia', 'adega', 'agua', 'alarme', 'aquecedor', 'aquecimento_central', 'aquecimento_solar', 'ar_condicionado',
    'area_lazer', 'area_servico', 'area_verde', 'armario_banheiro', 'armario_closet', 'armario_corredor', 'armario_cozinha',
    'armario_dormitorio', 'armario_escritorio', 'armario_area_servico', 'banheira', 'banheiro_auxiliar', 'banheiro_empregada',
    'brinquedoteca', 'cameras_seguranca', 'campo_futebol', 'canil', 'casa_caseiro', 'cerca_eletrica', 'churrasqueira',
    'closet', 'copa', 'cozinha', 'cozinha_americana', 'cozinha_independente', 'cozinha_gourmet', 'decorado', 'dep_empregados',
    'deposito', 'despensa', 'edicula', 'energia_eletrica', 'entrada_servico_independente', 'entrada_lateral', 'escritorio',
    'esgoto', 'espaco_gourmet', 'hidromassagem', 'home_theater', 'interfone', 'internet', 'jardim', 'lareira', 'lavabo',
    'lavanderia', 'luminarias', 'mobiliado', 'muro', 'perto_escolas', 'perto_hospitais', 'perto_shopping', 'perto_transporte',
    'perto_vias_acesso', 'piscina', 'piscina_adulto', 'piscina_aquecida', 'piscina_infantil', 'piso_frio', 'piso_laminado',
    'piso_madeira', 'playground', 'portao_eletronico', 'quadra_esportiva', 'quintal', 'sala_almoco', 'sala_jantar',
    'salao_festas', 'salao_jogos', 'sauna', 'sistema_alarme', 'solarium', 'tv_cabo', 'varanda', 'varanda_gourmet', 'vista_montanhas'
  ],
  apartamento: [
    'academia', 'acesso_deficientes', 'agua', 'alarme', 'aquecedor', 'aquecimento_central', 'aquecimento_solar', 'ar_condicionado',
    'area_lazer', 'area_servico', 'area_verde', 'armario_banheiro', 'armario_closet', 'armario_corredor', 'armario_cozinha',
    'armario_dormitorio', 'armario_escritorio', 'armario_area_servico', 'banheira', 'banheiro_auxiliar', 'banheiro_empregada',
    'bicicletario', 'brinquedoteca', 'cameras_seguranca', 'churrasqueira', 'cinema', 'closet', 'copa', 'cozinha',
    'cozinha_americana', 'cozinha_independente', 'cozinha_gourmet', 'decorado', 'dep_empregados', 'deposito', 'despensa',
    'elevador', 'elevador_servico', 'energia_eletrica', 'entrada_servico_independente', 'escritorio', 'esgoto', 'espaco_gourmet',
    'espaco_zen', 'estacionamento_visitantes', 'gas_encanado', 'gerador', 'guarita', 'hidromassagem', 'home_theater', 'interfone',
    'internet', 'jardim', 'lareira', 'lavabo', 'lavanderia', 'lavanderia_coletiva', 'luminarias', 'mobiliado', 'panti_house',
    'perto_escolas', 'perto_hospitais', 'perto_shopping', 'perto_transporte', 'perto_vias_acesso', 'piscina', 'piscina_adulto',
    'piscina_aquecida', 'piscina_coberta', 'piscina_infantil', 'piso_frio', 'piso_laminado', 'piso_madeira', 'pista_cooper',
    'playground', 'portao_eletronico', 'portaria_24h', 'quadra_esportiva', 'quadra_tennis', 'recepcao', 'sacada', 'sala_almoco',
    'sala_jantar', 'sala_ginastica', 'sala_massagem', 'salao_festas', 'salao_jogos', 'sauna', 'sauna_umida', 'seguranca_interna',
    'sem_condominio', 'sistema_alarme', 'solarium', 'spa', 'tv_cabo', 'varanda', 'varanda_gourmet', 'vigilancia_24h', 'vista_montanhas', 'zelador'
  ],
  cobertura: [
    'academia', 'acesso_deficientes', 'agua', 'alarme', 'aquecedor', 'aquecimento_central', 'aquecimento_solar', 'ar_condicionado',
    'area_lazer', 'area_servico', 'area_verde', 'armario_banheiro', 'armario_closet', 'armario_corredor', 'armario_cozinha',
    'armario_dormitorio', 'armario_escritorio', 'armario_area_servico', 'banheira', 'banheiro_auxiliar', 'banheiro_empregada',
    'bicicletario', 'brinquedoteca', 'cameras_seguranca', 'churrasqueira', 'cinema', 'closet', 'copa', 'cozinha',
    'cozinha_americana', 'cozinha_independente', 'cozinha_gourmet', 'decorado', 'dep_empregados', 'deposito', 'despensa',
    'elevador', 'elevador_servico', 'energia_eletrica', 'entrada_servico_independente', 'escritorio', 'esgoto', 'espaco_gourmet',
    'espaco_zen', 'estacionamento_visitantes', 'gas_encanado', 'gerador', 'guarita', 'hidromassagem', 'home_theater', 'interfone',
    'internet', 'jardim', 'lareira', 'lavabo', 'lavanderia', 'lavanderia_coletiva', 'luminarias', 'mobiliado', 'panti_house',
    'perto_escolas', 'perto_hospitais', 'perto_shopping', 'perto_transporte', 'perto_vias_acesso', 'piscina', 'piscina_adulto',
    'piscina_aquecida', 'piscina_coberta', 'piscina_infantil', 'piso_frio', 'piso_laminado', 'piso_madeira', 'pista_cooper',
    'playground', 'portao_eletronico', 'portaria_24h', 'quadra_esportiva', 'quadra_tennis', 'recepcao', 'sacada', 'sala_almoco',
    'sala_jantar', 'sala_ginastica', 'sala_massagem', 'salao_festas', 'salao_jogos', 'sauna', 'sauna_umida', 'seguranca_interna',
    'sem_condominio', 'sistema_alarme', 'solarium', 'spa', 'tv_cabo', 'varanda', 'varanda_gourmet', 'vigilancia_24h', 'vista_montanhas', 'zelador'
  ],
  terreno: [
    'agua', 'boca_lobo', 'calcetamento', 'com_cerca', 'energia_eletrica', 'esgoto', 'estrada_asfaltada', 'frente_mar',
    'guias_sarjetas', 'iluminacao_publica', 'muro', 'perto_vias_acesso', 'portao_eletronico', 'vista_montanhas'
  ],
  chacara: [
    'agua', 'alarme', 'area_lazer', 'area_servico', 'area_verde', 'armario_cozinha', 'banheiro_auxiliar', 'campo_futebol',
    'canil', 'casa_caseiro', 'cerca_eletrica', 'churrasqueira', 'clube', 'com_cerca', 'copa', 'cozinha', 'cozinha_independente',
    'deposito', 'despensa', 'edicula', 'energia_eletrica', 'escritorio', 'esgoto', 'espaco_gourmet', 'estrada_asfaltada',
    'horta', 'interfone', 'internet', 'jardim', 'lago', 'lareira', 'lavabo', 'lavanderia', 'mobiliado', 'muro', 'pasto',
    'piscina', 'piscina_adulto', 'piscina_infantil', 'piso_frio', 'playground', 'pomar', 'portao_eletronico', 'quadra_esportiva',
    'quintal', 'sala_jantar', 'salao_festas', 'salao_jogos', 'sauna', 'sistema_alarme', 'solarium', 'varanda', 'varanda_gourmet', 'vista_montanhas'
  ],
  sitio: [
    'agua', 'alarme', 'area_lazer', 'area_servico', 'area_verde', 'armario_cozinha', 'banheiro_auxiliar', 'campo_futebol',
    'canil', 'casa_caseiro', 'cerca_eletrica', 'churrasqueira', 'clube', 'com_cerca', 'copa', 'cozinha', 'cozinha_independente',
    'deposito', 'despensa', 'edicula', 'energia_eletrica', 'escritorio', 'esgoto', 'espaco_gourmet', 'estrada_asfaltada',
    'horta', 'interfone', 'internet', 'jardim', 'lago', 'lareira', 'lavabo', 'lavanderia', 'mobiliado', 'muro', 'pasto',
    'piscina', 'piscina_adulto', 'piscina_infantil', 'piso_frio', 'playground', 'pomar', 'portao_eletronico', 'quadra_esportiva',
    'quintal', 'sala_jantar', 'salao_festas', 'salao_jogos', 'sauna', 'sistema_alarme', 'solarium', 'varanda', 'varanda_gourmet', 'vista_montanhas'
  ],
  comercial: [
    'acesso_deficientes', 'agua', 'alarme', 'almoxarifado', 'ar_condicionado', 'area_servico', 'armario_banheiro',
    'armario_cozinha', 'armario_escritorio', 'cabine_primaria', 'cameras_seguranca', 'canal_internet', 'catraca_eletronica',
    'cerca_eletrica', 'copa', 'cozinha', 'cozinha_independente', 'deposito', 'elevador', 'elevador_servico', 'energia_eletrica',
    'entrada_servico_independente', 'escritorio', 'esgoto', 'estacionamento', 'estacionamento_visitantes', 'gerador', 'guarita',
    'infraestrutura_internet', 'interfone', 'internet', 'luminarias', 'mezanino', 'mobiliado', 'perto_escolas', 'perto_hospitais',
    'perto_shopping', 'perto_transporte', 'perto_vias_acesso', 'piso_elevado', 'piso_frio', 'piso_laminado', 'piso_madeira',
    'portao_eletronico', 'portaria_24h', 'recepcao', 'reservatorio_agua', 'saida_emergencia', 'sala_conferencias',
    'sala_reuniao', 'seguranca_interna', 'sistema_alarme', 'sistema_incendio', 'tv_cabo', 'vigilancia_24h', 'vestiario', 'wifi', 'zelador'
  ],
  galpao: [
    'acesso_deficientes', 'agua', 'alarme', 'almoxarifado', 'ar_condicionado', 'area_servico', 'armario_banheiro',
    'armario_cozinha', 'armario_escritorio', 'cabine_primaria', 'cameras_seguranca', 'canal_internet', 'catraca_eletronica',
    'cerca_eletrica', 'copa', 'cozinha', 'cozinha_independente', 'deposito', 'elevador', 'elevador_servico', 'energia_eletrica',
    'entrada_servico_independente', 'escritorio', 'esgoto', 'estacionamento', 'estacionamento_visitantes', 'gerador', 'guarita',
    'infraestrutura_internet', 'interfone', 'internet', 'luminarias', 'mezanino', 'mobiliado', 'perto_escolas', 'perto_hospitais',
    'perto_shopping', 'perto_transporte', 'perto_vias_acesso', 'piso_elevado', 'piso_frio', 'piso_laminado', 'piso_madeira',
    'portao_eletronico', 'portaria_24h', 'recepcao', 'reservatorio_agua', 'saida_emergencia', 'sala_conferencias',
    'sala_reuniao', 'seguranca_interna', 'sistema_alarme', 'sistema_incendio', 'tv_cabo', 'vigilancia_24h', 'vestiario', 'wifi', 'zelador'
  ],
  loja: [
    'acesso_deficientes', 'agua', 'alarme', 'almoxarifado', 'ar_condicionado', 'area_servico', 'armario_banheiro',
    'armario_cozinha', 'armario_escritorio', 'cabine_primaria', 'cameras_seguranca', 'canal_internet', 'catraca_eletronica',
    'cerca_eletrica', 'copa', 'cozinha', 'cozinha_independente', 'deposito', 'elevador', 'elevador_servico', 'energia_eletrica',
    'entrada_servico_independente', 'escritorio', 'esgoto', 'estacionamento', 'estacionamento_visitantes', 'gerador', 'guarita',
    'infraestrutura_internet', 'interfone', 'internet', 'luminarias', 'mezanino', 'mobiliado', 'perto_escolas', 'perto_hospitais',
    'perto_shopping', 'perto_transporte', 'perto_vias_acesso', 'piso_elevado', 'piso_frio', 'piso_laminado', 'piso_madeira',
    'portao_eletronico', 'portaria_24h', 'recepcao', 'reservatorio_agua', 'saida_emergencia', 'sala_conferencias',
    'sala_reuniao', 'seguranca_interna', 'sistema_alarme', 'sistema_incendio', 'tv_cabo', 'vigilancia_24h', 'vestiario', 'wifi', 'zelador'
  ],
  sala: [
    'acesso_deficientes', 'agua', 'alarme', 'almoxarifado', 'ar_condicionado', 'area_servico', 'armario_banheiro',
    'armario_cozinha', 'armario_escritorio', 'cabine_primaria', 'cameras_seguranca', 'canal_internet', 'catraca_eletronica',
    'cerca_eletrica', 'copa', 'cozinha', 'cozinha_independente', 'deposito', 'elevador', 'elevador_servico', 'energia_eletrica',
    'entrada_servico_independente', 'escritorio', 'esgoto', 'estacionamento', 'estacionamento_visitantes', 'gerador', 'guarita',
    'infraestrutura_internet', 'interfone', 'internet', 'luminarias', 'mezanino', 'mobiliado', 'perto_escolas', 'perto_hospitais',
    'perto_shopping', 'perto_transporte', 'perto_vias_acesso', 'piso_elevado', 'piso_frio', 'piso_laminado', 'piso_madeira',
    'portao_eletronico', 'portaria_24h', 'recepcao', 'reservatorio_agua', 'saida_emergencia', 'sala_conferencias',
    'sala_reuniao', 'seguranca_interna', 'sistema_alarme', 'sistema_incendio', 'tv_cabo', 'vigilancia_24h', 'vestiario', 'wifi', 'zelador'
  ]
};

const DIFERENCIAIS_GERAIS = ['internet', 'ar_condicionado', 'mobiliado', 'dep_empregados'];

const baseState = {
  id: null,
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

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState([])
  const [form, setForm] = useState(initialState)
  const [corretores, setCorretores] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: imvs } = await supabase
      .from('imoveis')
      .select(`
        *,
        clientes!proprietario_id (
          id,
          nome,
          email,
          telefone
        )
      `)
      .order('created_at', { ascending: false })

    const { data: corrs } = await supabase.from('corretores').select('id, nome').eq('ativo', true).order('nome')
    if (imvs) setImoveis(imvs)
    if (corrs) setCorretores(corrs)
  }

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const diferenciaisExibidos = useMemo(() => {
    if (!form.tipo) return [];
    const permitidos = MAPA_VISIBILIDADE[form.tipo] || [];
    return LISTA_DIFERENCIAIS.filter(item =>
      permitidos.includes(item.key) || DIFERENCIAIS_GERAIS.includes(item.key)
    );
  }, [form.tipo]);

  const handleEdit = (imovel) => {
    const flatDifs = imovel.diferenciais || {};
    setForm({ ...initialState, ...imovel, ...flatDifs });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleToggleStatus(id, currentStatus) {
    const novoStatus = currentStatus === 'disponivel' ? 'indisponivel' : 'disponivel'
    try {
      const body = new FormData()
      body.append('data', JSON.stringify({ id, status: novoStatus }))

      const response = await fetch('/api/imoveis', { method: 'PUT', body })
      if (!response.ok) throw new Error('Erro ao atualizar status')

      setImoveis(prev => prev.map(img => img.id === id ? { ...img, status: novoStatus } : img))
    } catch (error) {
      alert(error.message)
    }
  }

  // INICIO DA MUDANÇA  
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const payload = { ...form };
      const diferenciaisMap = {};

      LISTA_DIFERENCIAIS.forEach(item => {
        diferenciaisMap[item.key] = !!payload[item.key];
        delete payload[item.key];
      });

      // 1. Upload das imagens direto ao Supabase Storage
      const imagensUrls = []

      if (files.length > 0) {
        setMessage('Otimizando e enviando imagens...')

        const options = {
          maxSizeMB: 1,           // máx 1MB por imagem (qualidade boa)
          maxWidthOrHeight: 1920, // resolução Full HD
          useWebWorker: true,
          initialQuality: 0.85,   // 85% de qualidade — quase imperceptível ao olho
        }

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          setMessage(`Enviando imagem ${i + 1} de ${files.length}...`)

          let fileToUpload = file
          if (file.type?.startsWith('image/')) {
            try {
              const compressed = await imageCompression(file, options)
              fileToUpload = new File([compressed], file.name, { type: file.type })
            } catch {
              // se falhar a compressão, usa o original
            }
          }

          const ext = file.name.split('.').pop()
          const filePath = `temp/${Date.now()}-${i}.${ext}`

          const { error: uploadError } = await supabase.storage
            .from('imoveis')
            .upload(filePath, fileToUpload, { contentType: file.type, upsert: false })

          if (uploadError) throw new Error(`Erro ao enviar imagem ${i + 1}: ${uploadError.message}`)

          const { data: urlData } = supabase.storage.from('imoveis').getPublicUrl(filePath)
          imagensUrls.push({ path: filePath, url: urlData.publicUrl, ordem: i, capa: i === 0 })
        }
      }

      // 2. Envia só os metadados para a API (sem imagens)
      setMessage('Salvando dados do imóvel...')
      const dataToSend = {
        ...payload,
        diferenciais: diferenciaisMap,
        imagens: imagensUrls  // envia as URLs prontas
      }

      const body = new FormData()
      body.append('data', JSON.stringify(dataToSend))

      const method = form.id ? 'PUT' : 'POST'
      const response = await fetch('/api/imoveis', { method, body })

      const contentType = response.headers.get('content-type')
      let result = {}
      if (contentType?.includes('application/json')) {
        result = await response.json()
      } else {
        throw new Error(`Erro inesperado do servidor (Status ${response.status}).`)
      }

      if (!response.ok) {
        const msg = result.error || ''
        if (msg.includes('imoveis_codigo_key')) {
          throw new Error('Código interno já cadastrado. Use um código diferente.')
        }
        throw new Error(msg || 'Erro ao processar.')
      }

      setMessage(form.id ? 'Imóvel atualizado!' : 'Imóvel cadastrado!')
      setForm(initialState)
      setFiles([])
      setShowForm(false)
      fetchData()
    } catch (error) {
      setMessage('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // FIM DA MUDANÇA

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <div className="w-56 flex-shrink-0"><Sidebar /></div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6">

          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">
                {showForm ? (form.id ? 'Editar Imóvel' : 'Novo Imóvel') : 'Gestão de Imóveis'}
              </h1>
              <p className="text-zinc-500">Administre os anúncios e disponibilidade do portal.</p>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setForm(initialState); setMessage(''); }}
              className={`rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition ${showForm ? 'bg-white border border-zinc-300 text-zinc-600' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
            >
              {showForm ? 'Voltar para Lista' : '+ Novo Imóvel'}
            </button>
          </header>

          {message && (
            <div className={`mb-6 rounded-xl p-4 text-sm font-medium border ${message.includes('Erro') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              {message}
            </div>
          )}

          {!showForm ? (
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Imóvel</th>
                    <th className="px-6 py-4 font-semibold">Tipo</th>
                    <th className="px-6 py-4 font-semibold">Origem / Proprietário</th>
                    <th className="px-6 py-4 font-semibold">Preço</th>
                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {imoveis.map((item) => {
                    const proprietario = item.clientes;

                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-zinc-900">{item.titulo}</div>
                          <div className="text-zinc-400 font-mono text-[11px]">{item.codigo}</div>
                        </td>
                        <td className="px-6 py-4 capitalize text-zinc-600">{item.tipo}</td>

                        <td className="px-6 py-4 text-xs">
                          {proprietario ? (
                            <div className="flex flex-col max-w-[180px]">
                              <span className="font-semibold text-zinc-800 flex items-center gap-1 truncate">
                                <User size={12} className="text-emerald-600 shrink-0" />
                                {proprietario.nome}
                              </span>
                              <span className="text-zinc-400 font-medium truncate pl-4 text-[11px]">{proprietario.email}</span>
                            </div>
                          ) : (
                            <span className="bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Imobiliária
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-medium text-zinc-900">
                          {item.preco_venda ? `Venda: R$ ${item.preco_venda.toLocaleString()}` : `Aluguel: R$ ${item.preco_aluguel?.toLocaleString()}`}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center gap-1">
                            <Toggle
                              enabled={item.status === 'disponivel'}
                              onChange={() => handleToggleStatus(item.id, item.status)}
                            />
                            <span className={`text-[10px] font-bold uppercase ${item.status === 'disponivel' ? 'text-emerald-600' : 'text-zinc-400'}`}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(item)} className="text-zinc-900 font-bold hover:underline">Editar</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 pb-20">

              <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between border-b pb-2">
                  <h2 className="text-lg font-semibold text-zinc-800">1. Identificação</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-500 italic">Disponível?</span>
                    <Toggle
                      enabled={form.status === 'disponivel'}
                      onChange={() => setField('status', form.status === 'disponivel' ? 'indisponivel' : 'disponivel')}
                    />
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Field label="Título do Anúncio *" value={form.titulo} onChange={v => setField('titulo', v)} required placeholder="Ex: Apartamento decorado no Centro" />
                  </div>
                  <Field label="Código Interno *" value={form.codigo} onChange={v => setField('codigo', v)} required placeholder="Ex: AP001" />

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-700">Corretor Responsável</label>
                    <select className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-200" value={form.corretor_id} onChange={e => setField('corretor_id', e.target.value)}>
                      <option value="">Selecione um corretor...</option>
                      {corretores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-700">Tipo de Imóvel *</label>
                    <select className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-200" value={form.tipo} onChange={e => setField('tipo', e.target.value)} required>
                      <option value="">Selecione o tipo...</option>
                      {tiposImovel.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-700">Finalidade *</label>
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
                  <Field label="Complemento" value={form.complemento} onChange={v => setField('complemento', v)} />
                  <Field label="Bairro *" value={form.bairro} onChange={v => setField('bairro', v)} required />
                  <Field label="Cidade *" value={form.cidade} onChange={v => setField('cidade', v)} required />
                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-700">Estado *</label>
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
                  <Field label="Andar" value={form.andar} onChange={v => setField('andar', v)} />
                  <Field label="Total de Andares" value={form.total_andares} onChange={v => setField('total_andares', v)} />
                  <Stepper label="Quartos" value={form.quartos} onChange={v => setField('quartos', v)} />
                  <Stepper label="Suítes" value={form.suites} onChange={v => setField('suites', v)} />
                  <Stepper label="Banheiros" value={form.banheiros} onChange={v => setField('banheiros', v)} />
                  <Stepper label="Vagas Garagem" value={form.vagas_garagem} onChange={v => setField('vagas_garagem', v)} />
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">5. Diferenciais</h2>
                <div className="flex flex-wrap gap-3">
                  {diferenciaisExibidos.map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setField(item.key, !form[item.key])}
                      className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${form[item.key] ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400'
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">6. Conteúdo e Fotos</h2>
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-700">Descrição</label>
                    <textarea
                      className="min-h-[150px] w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/10 transition"
                      value={form.descricao}
                      onChange={e => setField('descricao', e.target.value)}
                      placeholder="Detalhes do imóvel..."
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" checked={form.destaque} onChange={e => setField('destaque', e.target.checked)} />
                    <span className="text-sm font-bold text-zinc-800 uppercase tracking-tight">Destaque na Home</span>
                  </label>

                  <div className="group relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:bg-zinc-100">
                    <input type="file" multiple accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={e => setFiles(Array.from(e.target.files || []))} />
                    <p className="text-sm font-bold text-zinc-900">Adicionar Fotos</p>
                    <p className="text-xs text-zinc-500">Arraste ou clique para selecionar</p>
                  </div>
                  {files.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 italic text-[10px] text-zinc-500">
                      {files.map((f, i) => <div key={i} className="truncate bg-zinc-100 p-1 rounded">● {f.name}</div>)}
                    </div>
                  )}
                </div>
              </section>

              <div className="flex items-center justify-end gap-4 border-t pt-8">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-800">Cancelar</button>
                <button type="submit" disabled={loading} className="rounded-xl bg-zinc-900 px-10 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-zinc-800 disabled:opacity-50">
                  {loading ? 'Gravando...' : (form.id ? 'Atualizar Imóvel' : 'Publicar Imóvel')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, required = false, placeholder = "" }) {
  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-bold text-zinc-700">{label}</label>
      <input
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/10 transition"
        value={value || ''}
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
      <label className="mb-2 block text-sm font-bold text-zinc-700">{label}</label>
      <div className="flex items-center gap-1">
        <button type="button" className="flex h-12 w-12 items-center justify-center rounded-l-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 font-bold" onClick={() => onChange(Math.max(0, value - 1))}> - </button>
        <div className="flex h-12 w-12 items-center justify-center border-y border-zinc-300 font-bold bg-white"> {value} </div>
        <button type="button" className="flex h-12 w-12 items-center justify-center rounded-r-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 font-bold" onClick={() => onChange(value + 1)}> + </button>
      </div>
    </div>
  )
}