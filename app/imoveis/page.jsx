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

function Feedback({ message }) {
  if (!message) return null;
  const isError = message.startsWith('Erro:') || message.startsWith('erro');
  const isWarning = message.startsWith('Aviso:');
  const style = isError
    ? 'bg-red-50 text-red-600 border-red-100'
    : isWarning
      ? 'bg-amber-50 text-amber-700 border-amber-100'
      : 'bg-emerald-50 text-emerald-600 border-emerald-100';
  return (
    <div className={`mb-6 rounded-xl p-4 text-sm font-medium border ${style}`}>
      {message}
    </div>
  );
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
  { key: 'aquecimento_gas', label: 'Aquecimento à Gás' },
  { key: 'aquecimento_central', label: 'Aquecimento Central' },
  { key: 'aquecimento_solar', label: 'Aquecimento Solar' },
  { key: 'ar_condicionado', label: 'Ar Condicionado' },
  { key: 'area_estar_externa', label: 'Área de Estar Externa' },
  { key: 'area_lazer', label: 'Área de Lazer' },
  { key: 'area_servico', label: 'Área de Serviço' },
  { key: 'area_verde', label: 'Área Verde / Parque' },
  { key: 'armario_banheiro', label: 'Armário de Banheiro' },
  { key: 'armario_closet', label: 'Armário de Closet' },
  { key: 'armario_corredor', label: 'Armário de Corredor' },
  { key: 'armario_cozinha', label: 'Armário de Cozinha' },
  { key: 'armario_dormitorio', label: 'Armário de Dormitório' },
  { key: 'armario_escritorio', label: 'Armário de Escritório' },
  { key: 'armario_area_servico', label: 'Armário de Área de Serviço' },
  { key: 'armario_embutido', label: 'Armário Embutido' },
  { key: 'atelier', label: 'Atelier' },
  { key: 'banheira', label: 'Banheira' },
  { key: 'bar', label: 'Bar' },
  { key: 'banheiro_auxiliar', label: 'Banheiro Auxiliar' },
  { key: 'banheiro_empregada', label: 'Banheiro da Empregada' },
  { key: 'biblioteca', label: 'Biblioteca' },
  { key: 'bicicletario', label: 'Bicicletário' },
  { key: 'brinquedoteca', label: 'Brinquedoteca' },
  { key: 'boca_lobo', label: 'Boca de Lobo' },
  { key: 'boliche', label: 'Boliche' },
  { key: 'cabine_primaria', label: 'Cabine Primária' },
  { key: 'calcetamento', label: 'Calcetamento' },
  { key: 'cameras_seguranca', label: 'Câmeras de Segurança' },
  { key: 'campo_futebol', label: 'Campo de Futebol' },
  { key: 'canal_internet', label: 'Canal de Internet' },
  { key: 'canil', label: 'Canil' },
  { key: 'casa_caseiro', label: 'Casa de Caseiro' },
  { key: 'catraca', label: 'Catraca' },
  { key: 'cerca_eletrica', label: 'Cerca Elétrica' },
  { key: 'churrasqueira', label: 'Churrasqueira' },
  { key: 'churrasqueira_gourmet', label: 'Churrasqueira Gourmet' },
  { key: 'cinema', label: 'Cinema' },
  { key: 'clube', label: 'Clube' },
  { key: 'closet', label: 'Closet' },
  { key: 'com_cerca', label: 'Com Cerca' },
  { key: 'copa', label: 'Copa' },
  { key: 'cozinha', label: 'Cozinha' },
  { key: 'cozinha_americana', label: 'Cozinha Americana' },
  { key: 'cozinha_independente', label: 'Cozinha Independente' },
  { key: 'cozinha_gourmet', label: 'Cozinha Gourmet' },
  { key: 'carpete', label: 'Carpete' },
  { key: 'casa_fundos', label: 'Casa de Fundos' },
  { key: 'centro_estetica', label: 'Centro de Estética' },
  { key: 'cerca', label: 'Cerca' },
  { key: 'coffee_shop', label: 'Coffee Shop' },
  { key: 'decorado', label: 'Decorado' },
  { key: 'dep_empregados', label: 'Dependência de Empregados' },
  { key: 'deposito', label: 'Depósito' },
  { key: 'despensa', label: 'Despensa' },
  { key: 'ducha', label: 'Ducha' },
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
  { key: 'espelhos_dagua', label: 'Espelhos D´água' },
  { key: 'estacionamento_coberto', label: 'Estacionamento Coberto' },
  { key: 'frente_mar', label: 'Frente para o Mar' },
  { key: 'fogao', label: 'Fogão' },
  { key: 'fogao_eletrico', label: 'Fogão Elétrico' },
  { key: 'freezer', label: 'Freezer' },
  { key: 'geminada', label: 'Geminada' },
  { key: 'gas_encanado', label: 'Gás Encanado' },
  { key: 'gerador', label: 'Gerador' },
  { key: 'guarita', label: 'Guarita' },
  { key: 'guias_sarjetas', label: 'Guias e Sarjetas' },
  { key: 'garagem', label: 'Garagem' },
  { key: 'garagem_coberta', label: 'Garagem Coberta' },
  { key: 'gas_natural', label: 'Gás Natural' },
  { key: 'geladeira', label: 'Geladeira' },
  { key: 'grama', label: 'Grama' },
  { key: 'hidromassagem', label: 'Hidromassagem' },
  { key: 'home_office', label: 'Home Office' },
  { key: 'home_theater', label: 'Home Theater' },
  { key: 'horta', label: 'Horta' },
  { key: 'iluminacao_publica', label: 'Iluminação Pública' },
  { key: 'infraestrutura_internet', label: 'Infraestrutura Internet' },
  { key: 'interfone', label: 'Interfone' },
  { key: 'internet', label: 'Internet' },
  { key: 'isolamento_acustico', label: 'Isolamento Acústico' },
  { key: 'jardim', label: 'Jardim' },
  { key: 'jacuzzi', label: 'Jacuzzi' },
  { key: 'lago', label: 'Lago' },
  { key: 'lareira', label: 'Lareira' },
  { key: 'lavabo', label: 'Lavabo' },
  { key: 'lavanderia', label: 'Lavanderia' },
  { key: 'lavanderia_coletiva', label: 'Lavanderia Coletiva' },
  { key: 'luminarias', label: 'Luminárias' },
  { key: 'lounge', label: 'Lounge' },
  { key: 'lustres', label: 'Lustres' },
  { key: 'mezanino', label: 'Mezanino' },
  { key: 'mobiliado', label: 'Mobiliado' },
  { key: 'muro', label: 'Muro' },
  { key: 'massagem', label: 'Massagem' },
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
  { key: 'pub', label: 'Pub' },
  { key: 'proximo_metro', label: 'Próximo ao Metrô' },
  { key: 'proximo_hospitais', label: 'Próximo à Hospitais' },
  { key: 'portaria_12h', label: 'Portaria 12h' },
  { key: 'portaria', label: 'Portaria' },
  { key: 'porao', label: 'Porão' },
  { key: 'playground_baby', label: 'Playground Baby' },
  { key: 'pista_skate', label: 'Pista de Skate' },
  { key: 'pista_patinacao', label: 'Pista de Patinação' },
  { key: 'pista_caminhada', label: 'Pista de Caminhada' },
  { key: 'pista_bicicross', label: 'Pista de Bicicross' },
  { key: 'pista_atletismo', label: 'Pista de Atletismo' },
  { key: 'pet_place', label: 'Pet Place' },
  { key: 'pier', label: 'Pier' },
  { key: 'parque', label: 'Parque' },
  { key: 'permite_animais', label: 'Permite Animais' },
  { key: 'piscina_climatizada', label: 'Piscina Climatizada' },
  { key: 'piscina_coberta_climatizada', label: 'Piscina Coberta Climatizada' },
  { key: 'piscina_coberta_raia', label: 'Piscina Coberta com Raia' },
  { key: 'piscina_hidromassagem', label: 'Piscina com Hidromassagem' },
  { key: 'piscina_raia', label: 'Piscina com Raia' },
  { key: 'patio', label: 'Patio' },
  { key: 'quadra_esportiva', label: 'Quadra Esportiva' },
  { key: 'quadra_tennis', label: 'Quadra de Tênis' },
  { key: 'quintal', label: 'Quintal' },
  { key: 'quadra_futsal', label: 'Quadra de Futsal' },
  { key: 'quadra_peteca', label: 'Quadra de Peteca' },
  { key: 'quadra_squash', label: 'Quadra de Squash' },
  { key: 'quadra_volei_praia', label: 'Quadra de Volei de Praia' },
  { key: 'quadra_gramada', label: 'Quadra Gramada' },
  { key: 'quadra_poliesportiva', label: 'Quadra Poliesportiva' },
  { key: 'quadra_recreativa', label: 'Quadra Recreativa' },
  { key: 'quarto_empregados', label: 'Quarto de Empregados' },
  { key: 'quiosque_churrasqueira', label: 'Quiosque com Churrasqueira' },
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
  { key: 'sotao', label: 'Sotão' },
  { key: 'sistema_seguranca', label: 'Sistema de Segurança' },
  { key: 'servicos_publicos_essenciais', label: 'Serviços Públicos Essenciais' },
  { key: 'semi_mobiliado', label: 'Semi-mobiliado' },
  { key: 'seguranca_rua', label: 'Segurança na Rua' },
  { key: 'seguranca_24h', label: 'Segurança 24h' },
  { key: 'salao_gourmet', label: 'Salão Gourmet' },
  { key: 'sala_estar', label: 'Sala de Estar' },
  { key: 'sala_tv', label: 'Sala de TV' },
  { key: 'sala_convencoes', label: 'Sala de Convenções' },
  { key: 'sala_estudo', label: 'Sala de Estudo' },
  { key: 'sala_leitura', label: 'Sala de Leitura' },
  { key: 'sala_yoga', label: 'Sala de Yoga' },
  { key: 'salao_beleza', label: 'Salão de Beleza' },
  { key: 'tv_cabo', label: 'TV a Cabo' },
  { key: 'terraco', label: 'Terraço' },
  { key: 'teto_rebaixado', label: 'Teto Rebaixado' },
  { key: 'toboagua', label: 'Toboágua' },
  { key: 'vaga_garagem', label: 'Vaga de Garagem' },
  { key: 'varanda', label: 'Varanda' },
  { key: 'varanda_gourmet', label: 'Varanda Gourmet' },
  { key: 'vigilancia_24h', label: 'Vigilância 24h' },
  { key: 'vestiario', label: 'Vestiário' },
  { key: 'varanda_churrasqueira', label: 'Varanda com Churrasqueira' },
  { key: 'varanda_vidro', label: 'Varanda Fechada com Vidro' },
  { key: 'varanda_cozinha', label: 'Varanda Integrada com a Cozinha' },
  { key: 'vista_exterior', label: 'Vista Exterior' },
  { key: 'vista_montanha', label: 'Vista para as Montanhas' },
  { key: 'vista_mar', label: 'Vista para o Mar' },
  { key: 'wc_empregados', label: 'WC Empregados' },
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'zelador', label: 'Zelador' },
];

const MAPA_VISIBILIDADE = {
  casa: [
    'academia', 'adega', 'agua', 'alarme', 'aquecedor', 'aquecimento_central', 'aquecimento_gas',
    'aquecimento_solar', 'ar_condicionado', 'area_estar_externa', 'area_lazer', 'area_servico',
    'area_verde', 'armario_area_servico', 'armario_banheiro', 'armario_closet', 'armario_corredor',
    'armario_cozinha', 'armario_dormitorio', 'armario_embutido', 'armario_escritorio', 'atelier',
    'banheira', 'banheiro_auxiliar', 'banheiro_empregada', 'bar', 'biblioteca', 'boliche',
    'brinquedoteca', 'cameras_seguranca', 'campo_futebol', 'canil', 'carpete', 'casa_caseiro',
    'casa_fundos', 'centro_estetica', 'cerca', 'cerca_eletrica', 'churrasqueira',
    'churrasqueira_gourmet', 'closet', 'copa', 'cozinha', 'cozinha_americana', 'cozinha_gourmet',
    'cozinha_independente', 'decorado', 'dep_empregados', 'deposito', 'despensa', 'ducha',
    'edicula', 'energia_eletrica', 'entrada_lateral', 'entrada_servico_independente', 'escritorio',
    'esgoto', 'espaco_gourmet', 'espelhos_dagua', 'estacionamento_coberto', 'fogao', 'fogao_eletrico',
    'freezer', 'garagem', 'garagem_coberta', 'gas_natural', 'geladeira', 'geminada', 'grama',
    'hidromassagem', 'home_office', 'home_theater', 'interfone', 'internet', 'isolamento_acustico',
    'jacuzzi', 'jardim', 'lareira', 'lavabo', 'lavanderia', 'luminarias', 'lustres', 'massagem',
    'mobiliado', 'muro', 'parque', 'perto_escolas', 'perto_hospitais', 'perto_shopping',
    'perto_transporte', 'perto_vias_acesso', 'pier', 'piscina', 'piscina_adulto', 'piscina_aquecida',
    'piscina_climatizada', 'piscina_coberta_climatizada', 'piscina_coberta_raia', 'piscina_hidromassagem',
    'piscina_infantil', 'piscina_raia', 'piso_frio', 'piso_laminado', 'piso_madeira', 'playground',
    'porao', 'portao_eletronico', 'proximo_hospitais', 'proximo_metro', 'pub', 'quadra_esportiva',
    'quadra_futsal', 'quadra_gramada', 'quadra_peteca', 'quadra_poliesportiva', 'quadra_squash',
    'quadra_volei_praia', 'quarto_empregados', 'quintal', 'sala_almoco', 'sala_estar', 'sala_jantar',
    'sala_tv', 'salao_festas', 'salao_gourmet', 'salao_jogos', 'sauna', 'seguranca_rua',
    'semi_mobiliado', 'servicos_publicos_essenciais', 'sistema_alarme', 'sistema_seguranca',
    'solarium', 'sotao', 'terraco', 'teto_rebaixado', 'toboagua', 'tv_cabo', 'varanda',
    'varanda_churrasqueira', 'varanda_cozinha', 'varanda_gourmet', 'varanda_vidro', 'vista_exterior',
    'vista_mar', 'vista_montanha', 'wc_empregados'
  ],
  apartamento: [
    'academia', 'acesso_deficientes', 'agua', 'alarme', 'aquecedor', 'aquecimento_central',
    'aquecimento_gas', 'aquecimento_solar', 'ar_condicionado', 'area_estar_externa', 'area_lazer',
    'area_servico', 'area_verde', 'armario_area_servico', 'armario_banheiro', 'armario_closet',
    'armario_corredor', 'armario_cozinha', 'armario_dormitorio', 'armario_embutido',
    'armario_escritorio', 'atelier', 'banheira', 'banheiro_auxiliar', 'banheiro_empregada', 'bar',
    'biblioteca', 'bicicletario', 'boliche', 'brinquedoteca', 'cameras_seguranca', 'carpete',
    'casa_fundos', 'centro_estetica', 'churrasqueira', 'churrasqueira_gourmet', 'cinema', 'closet',
    'coffee_shop', 'copa', 'cozinha', 'cozinha_americana', 'cozinha_gourmet', 'cozinha_independente',
    'decorado', 'dep_empregados', 'deposito', 'despensa', 'ducha', 'elevador', 'elevador_servico',
    'energia_eletrica', 'entrada_servico_independente', 'escritorio', 'esgoto', 'espaco_gourmet',
    'espaco_zen', 'espelhos_dagua', 'estacionamento_coberto', 'estacionamento_visitantes', 'fogao',
    'fogao_eletrico', 'freezer', 'garagem', 'garagem_coberta', 'gas_encanado', 'gas_natural',
    'geladeira', 'gerador', 'grama', 'guarita', 'hidromassagem', 'home_office', 'home_theater',
    'interfone', 'internet', 'isolamento_acustico', 'jacuzzi', 'jardim', 'lareira', 'lavabo',
    'lavanderia', 'lavanderia_coletiva', 'lounge', 'luminarias', 'lustres', 'massagem', 'mobiliado',
    'panti_house', 'parque', 'patio', 'permite_animais', 'perto_escolas', 'perto_hospitais',
    'perto_shopping', 'perto_transporte', 'perto_vias_acesso', 'pet_place', 'pier', 'piscina',
    'piscina_adulto', 'piscina_aquecida', 'piscina_climatizada', 'piscina_coberta',
    'piscina_coberta_climatizada', 'piscina_coberta_raia', 'piscina_hidromassagem', 'piscina_infantil',
    'piscina_raia', 'piso_frio', 'piso_laminado', 'piso_madeira', 'pista_atletismo', 'pista_bicicross',
    'pista_caminhada', 'pista_cooper', 'pista_patinacao', 'pista_skate', 'playground', 'playground_baby',
    'portao_eletronico', 'portaria_24h', 'proximo_hospitais', 'proximo_metro', 'pub', 'quadra_esportiva',
    'quadra_futsal', 'quadra_gramada', 'quadra_peteca', 'quadra_poliesportiva', 'quadra_recreativa',
    'quadra_squash', 'quadra_tennis', 'quadra_volei_praia', 'quarto_empregados',
    'quiosque_churrasqueira', 'recepcao', 'sacada', 'sala_almoco', 'sala_convencoes', 'sala_estar',
    'sala_estudo', 'sala_ginastica', 'sala_jantar', 'sala_leitura', 'sala_massagem', 'sala_tv',
    'sala_yoga', 'salao_beleza', 'salao_festas', 'salao_gourmet', 'salao_jogos', 'sauna',
    'sauna_umida', 'seguranca_24h', 'seguranca_interna', 'seguranca_rua', 'sem_condominio',
    'semi_mobiliado', 'servicos_publicos_essenciais', 'sistema_alarme', 'sistema_seguranca',
    'solarium', 'spa', 'terraco', 'teto_rebaixado', 'toboagua', 'tv_cabo', 'varanda',
    'varanda_churrasqueira', 'varanda_cozinha', 'varanda_gourmet', 'varanda_vidro', 'vigilancia_24h',
    'vista_exterior', 'vista_mar', 'vista_montanha', 'wc_empregados', 'zelador'
  ],
  cobertura: [
    'academia', 'acesso_deficientes', 'agua', 'alarme', 'aquecedor', 'aquecimento_central',
    'aquecimento_gas', 'aquecimento_solar', 'ar_condicionado', 'area_estar_externa', 'area_lazer',
    'area_servico', 'area_verde', 'armario_area_servico', 'armario_banheiro', 'armario_closet',
    'armario_corredor', 'armario_cozinha', 'armario_dormitorio', 'armario_embutido',
    'armario_escritorio', 'atelier', 'banheira', 'banheiro_auxiliar', 'banheiro_empregada', 'bar',
    'biblioteca', 'bicicletario', 'boliche', 'brinquedoteca', 'cameras_seguranca', 'carpete',
    'casa_fundos', 'centro_estetica', 'churrasqueira', 'churrasqueira_gourmet', 'cinema', 'closet',
    'coffee_shop', 'copa', 'cozinha', 'cozinha_americana', 'cozinha_gourmet', 'cozinha_independente',
    'decorado', 'dep_empregados', 'deposito', 'despensa', 'ducha', 'elevador', 'elevador_servico',
    'energia_eletrica', 'entrada_servico_independente', 'escritorio', 'esgoto', 'espaco_gourmet',
    'espaco_zen', 'espelhos_dagua', 'estacionamento_coberto', 'estacionamento_visitantes', 'fogao',
    'fogao_eletrico', 'freezer', 'garagem', 'garagem_coberta', 'gas_encanado', 'gas_natural',
    'geladeira', 'gerador', 'grama', 'guarita', 'hidromassagem', 'home_office', 'home_theater',
    'interfone', 'internet', 'isolamento_acustico', 'jacuzzi', 'jardim', 'lareira', 'lavabo',
    'lavanderia', 'lavanderia_coletiva', 'lounge', 'luminarias', 'lustres', 'massagem', 'mobiliado',
    'panti_house', 'parque', 'patio', 'permite_animais', 'perto_escolas', 'perto_hospitais',
    'perto_shopping', 'perto_transporte', 'perto_vias_acesso', 'pet_place', 'pier', 'piscina',
    'piscina_adulto', 'piscina_aquecida', 'piscina_climatizada', 'piscina_coberta',
    'piscina_coberta_climatizada', 'piscina_coberta_raia', 'piscina_hidromassagem', 'piscina_infantil',
    'piscina_raia', 'piso_frio', 'piso_laminado', 'piso_madeira', 'pista_atletismo', 'pista_bicicross',
    'pista_caminhada', 'pista_cooper', 'pista_patinacao', 'pista_skate', 'playground', 'playground_baby',
    'portao_eletronico', 'portaria', 'portaria_12h', 'portaria_24h', 'proximo_hospitais', 'proximo_metro',
    'pub', 'quadra_esportiva', 'quadra_futsal', 'quadra_gramada', 'quadra_peteca',
    'quadra_poliesportiva', 'quadra_recreativa', 'quadra_squash', 'quadra_tennis', 'quadra_volei_praia',
    'quarto_empregados', 'quiosque_churrasqueira', 'recepcao', 'sacada', 'sala_almoco',
    'sala_convencoes', 'sala_estar', 'sala_estudo', 'sala_ginastica', 'sala_jantar', 'sala_leitura',
    'sala_massagem', 'sala_tv', 'sala_yoga', 'salao_beleza', 'salao_festas', 'salao_gourmet',
    'salao_jogos', 'sauna', 'sauna_umida', 'seguranca_24h', 'seguranca_interna', 'seguranca_rua',
    'sem_condominio', 'semi_mobiliado', 'servicos_publicos_essenciais', 'sistema_alarme',
    'sistema_seguranca', 'solarium', 'spa', 'terraco', 'teto_rebaixado', 'toboagua', 'tv_cabo',
    'varanda', 'varanda_churrasqueira', 'varanda_cozinha', 'varanda_gourmet', 'varanda_vidro',
    'vigilancia_24h', 'vista_exterior', 'vista_mar', 'vista_montanha', 'wc_empregados', 'zelador'
  ],
  terreno: [
    'agua', 'boca_lobo', 'calcetamento', 'com_cerca', 'energia_eletrica', 'esgoto',
    'estrada_asfaltada', 'frente_mar', 'guias_sarjetas', 'iluminacao_publica', 'muro',
    'perto_vias_acesso', 'portao_eletronico', 'vista_montanha'
  ],
  chacara: [
    'agua', 'alarme', 'aquecimento_gas', 'area_estar_externa', 'area_lazer', 'area_servico',
    'area_verde', 'armario_cozinha', 'armario_embutido', 'atelier', 'banheiro_auxiliar', 'bar',
    'biblioteca', 'campo_futebol', 'canil', 'carpete', 'casa_caseiro', 'casa_fundos', 'cerca',
    'cerca_eletrica', 'churrasqueira', 'churrasqueira_gourmet', 'clube', 'com_cerca', 'copa',
    'cozinha', 'cozinha_independente', 'deposito', 'despensa', 'ducha', 'edicula', 'energia_eletrica',
    'escritorio', 'esgoto', 'espaco_gourmet', 'espelhos_dagua', 'estacionamento_coberto',
    'estrada_asfaltada', 'fogao', 'fogao_eletrico', 'freezer', 'garagem', 'garagem_coberta',
    'gas_natural', 'geladeira', 'grama', 'home_office', 'horta', 'interfone', 'internet', 'jacuzzi',
    'jardim', 'lago', 'lareira', 'lavabo', 'lavanderia', 'lustres', 'massagem', 'mobiliado', 'muro',
    'pasto', 'pier', 'piscina', 'piscina_adulto', 'piscina_climatizada', 'piscina_coberta_climatizada',
    'piscina_coberta_raia', 'piscina_hidromassagem', 'piscina_infantil', 'piscina_raia', 'piso_frio',
    'playground', 'pomar', 'portao_eletronico', 'quadra_esportiva', 'quadra_futsal', 'quadra_gramada',
    'quadra_peteca', 'quadra_poliesportiva', 'quadra_squash', 'quadra_volei_praia', 'quarto_empregados',
    'quintal', 'sala_estar', 'sala_jantar', 'sala_tv', 'salao_festas', 'salao_gourmet', 'salao_jogos',
    'sauna', 'semi_mobiliado', 'sistema_alarme', 'solarium', 'terraco', 'teto_rebaixado', 'toboagua',
    'varanda', 'varanda_churrasqueira', 'varanda_cozinha', 'varanda_gourmet', 'varanda_vidro',
    'vista_exterior', 'vista_montanha', 'wc_empregados'
  ],
  sitio: [
    'agua', 'alarme', 'aquecimento_gas', 'area_estar_externa', 'area_lazer', 'area_servico',
    'area_verde', 'armario_cozinha', 'armario_embutido', 'atelier', 'banheiro_auxiliar', 'bar',
    'biblioteca', 'campo_futebol', 'canil', 'carpete', 'casa_caseiro', 'casa_fundos', 'cerca',
    'cerca_eletrica', 'churrasqueira', 'churrasqueira_gourmet', 'clube', 'com_cerca', 'copa',
    'cozinha', 'cozinha_independente', 'deposito', 'despensa', 'ducha', 'edicula', 'energia_eletrica',
    'escritorio', 'esgoto', 'espaco_gourmet', 'espelhos_dagua', 'estacionamento_coberto',
    'estrada_asfaltada', 'fogao', 'fogao_eletrico', 'freezer', 'garagem', 'garagem_coberta',
    'gas_natural', 'geladeira', 'grama', 'home_office', 'horta', 'interfone', 'internet', 'jacuzzi',
    'jardim', 'lago', 'lareira', 'lavabo', 'lavanderia', 'lustres', 'massagem', 'mobiliado', 'muro',
    'pasto', 'pier', 'piscina', 'piscina_adulto', 'piscina_climatizada', 'piscina_coberta_climatizada',
    'piscina_coberta_raia', 'piscina_hidromassagem', 'piscina_infantil', 'piscina_raia', 'piso_frio',
    'playground', 'pomar', 'portao_eletronico', 'quadra_esportiva', 'quadra_futsal', 'quadra_gramada',
    'quadra_peteca', 'quadra_poliesportiva', 'quadra_squash', 'quadra_volei_praia', 'quarto_empregados',
    'quintal', 'sala_estar', 'sala_jantar', 'sala_tv', 'salao_festas', 'salao_gourmet', 'salao_jogos',
    'sauna', 'semi_mobiliado', 'sistema_alarme', 'solarium', 'terraco', 'teto_rebaixado', 'toboagua',
    'varanda', 'varanda_churrasqueira', 'varanda_cozinha', 'varanda_gourmet', 'varanda_vidro',
    'vista_exterior', 'vista_montanha', 'wc_empregados'
  ],
  comercial: [
    'acesso_deficientes', 'agua', 'alarme', 'almoxarifado', 'aquecimento_gas', 'ar_condicionado',
    'area_servico', 'armario_banheiro', 'armario_cozinha', 'armario_escritorio', 'cabine_primaria',
    'cameras_seguranca', 'canal_internet', 'catraca', 'cerca_eletrica', 'copa', 'cozinha',
    'cozinha_independente', 'deposito', 'elevador', 'elevador_servico', 'energia_eletrica',
    'entrada_servico_independente', 'escritorio', 'esgoto', 'estacionamento', 'estacionamento_visitantes',
    'gerador', 'guarita', 'infraestrutura_internet', 'interfone', 'internet', 'luminarias', 'mezanino',
    'mobiliado', 'perto_escolas', 'perto_hospitais', 'perto_shopping', 'perto_transporte',
    'perto_vias_acesso', 'piso_elevado', 'piso_frio', 'piso_laminado', 'piso_madeira',
    'portao_eletronico', 'portaria', 'portaria_24h', 'recepcao', 'reservatorio_agua', 'saida_emergencia',
    'sala_conferencias', 'sala_reuniao', 'seguranca_24h', 'seguranca_interna', 'sistema_alarme',
    'sistema_incendio', 'sistema_seguranca', 'tv_cabo', 'vestiario', 'vigilancia_24h', 'wifi', 'zelador'
  ],
  galpao: [
    'acesso_deficientes', 'agua', 'alarme', 'almoxarifado', 'aquecimento_gas', 'ar_condicionado',
    'area_servico', 'armario_banheiro', 'armario_cozinha', 'armario_escritorio', 'cabine_primaria',
    'cameras_seguranca', 'canal_internet', 'catraca', 'cerca_eletrica', 'copa', 'cozinha',
    'cozinha_independente', 'deposito', 'elevador', 'elevador_servico', 'energia_eletrica',
    'entrada_servico_independente', 'escritorio', 'esgoto', 'estacionamento', 'estacionamento_visitantes',
    'gerador', 'guarita', 'infraestrutura_internet', 'interfone', 'internet', 'luminarias', 'mezanino',
    'mobiliado', 'perto_escolas', 'perto_hospitais', 'perto_shopping', 'perto_transporte',
    'perto_vias_acesso', 'piso_elevado', 'piso_frio', 'piso_laminado', 'piso_madeira',
    'portao_eletronico', 'portaria_24h', 'recepcao', 'reservatorio_agua', 'saida_emergencia',
    'sala_conferencias', 'sala_reuniao', 'seguranca_24h', 'seguranca_interna', 'sistema_alarme',
    'sistema_incendio', 'sistema_seguranca', 'tv_cabo', 'vestiario', 'vigilancia_24h', 'wifi', 'zelador'
  ],
  loja: [
    'acesso_deficientes', 'agua', 'alarme', 'almoxarifado', 'aquecimento_gas', 'ar_condicionado',
    'area_servico', 'armario_banheiro', 'armario_cozinha', 'armario_escritorio', 'cabine_primaria',
    'cameras_seguranca', 'canal_internet', 'catraca', 'cerca_eletrica', 'copa', 'cozinha',
    'cozinha_independente', 'deposito', 'elevador', 'elevador_servico', 'energia_eletrica',
    'entrada_servico_independente', 'escritorio', 'esgoto', 'estacionamento', 'estacionamento_visitantes',
    'gerador', 'guarita', 'infraestrutura_internet', 'interfone', 'internet', 'luminarias', 'mezanino',
    'mobiliado', 'perto_escolas', 'perto_hospitais', 'perto_shopping', 'perto_transporte',
    'perto_vias_acesso', 'piso_elevado', 'piso_frio', 'piso_laminado', 'piso_madeira',
    'portao_eletronico', 'portaria', 'portaria_24h', 'recepcao', 'reservatorio_agua', 'saida_emergencia',
    'sala_conferencias', 'sala_reuniao', 'seguranca_24h', 'seguranca_interna', 'sistema_alarme',
    'sistema_incendio', 'sistema_seguranca', 'tv_cabo', 'vestiario', 'vigilancia_24h', 'wifi', 'zelador'
  ],
  sala: [
    'acesso_deficientes', 'agua', 'alarme', 'almoxarifado', 'aquecimento_gas', 'ar_condicionado',
    'area_servico', 'armario_banheiro', 'armario_cozinha', 'armario_escritorio', 'cabine_primaria',
    'cameras_seguranca', 'canal_internet', 'catraca', 'cerca_eletrica', 'copa', 'cozinha',
    'cozinha_independente', 'deposito', 'elevador', 'elevador_servico', 'energia_eletrica',
    'entrada_servico_independente', 'escritorio', 'esgoto', 'estacionamento', 'estacionamento_visitantes',
    'gerador', 'guarita', 'infraestrutura_internet', 'interfone', 'internet', 'luminarias', 'mezanino',
    'mobiliado', 'perto_escolas', 'perto_hospitais', 'perto_shopping', 'perto_transporte',
    'perto_vias_acesso', 'piso_elevado', 'piso_frio', 'piso_laminado', 'piso_madeira',
    'portao_eletronico', 'portaria', 'portaria_24h', 'recepcao', 'reservatorio_agua', 'saida_emergencia',
    'sala_conferencias', 'sala_reuniao', 'seguranca_24h', 'seguranca_interna', 'sistema_alarme',
    'sistema_incendio', 'sistema_seguranca', 'tv_cabo', 'vestiario', 'vigilancia_24h', 'wifi', 'zelador'
  ]
};

const DIFERENCIAIS_GERAIS = ['internet', 'ar_condicionado', 'mobiliado', 'dep_empregados'];

const PREFIXO_TIPO = {
  casa: 'CA',
  apartamento: 'AP',
  cobertura: 'CB',
  terreno: 'TE',
  chacara: 'CH',
  sitio: 'ST',
  comercial: 'CM',
  galpao: 'GL',
  loja: 'LJ',
  sala: 'SA',
};

async function gerarCodigoUnico(tipoImovel) {
  const caracteres = "0123456789";
  const prefixo = PREFIXO_TIPO[tipoImovel] || 'IM';

  const MAX_TENTATIVAS = 15;
  for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa++) {
    let sufixo = "";
    for (let i = 0; i < 6; i++) {
      sufixo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    const codigo = `${prefixo}${sufixo}`;

    const { data, error } = await supabase
      .from('imoveis')
      .select('id')
      .eq('codigo', codigo)
      .maybeSingle();

    if (error) {
      console.warn('Não foi possível verificar duplicidade de código:', error.message);
      return codigo;
    }
    if (!data) return codigo;
  }

  return `${prefixo}${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

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
  const [previews, setPreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    if (!form.tipo || form.id) return;

    let cancelado = false;

    (async () => {
      const novoCodigo = await gerarCodigoUnico(form.tipo);
      if (!cancelado) setField('codigo', novoCodigo);
    })();

    return () => { cancelado = true; };
  }, [form.tipo]);

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (message && !message.startsWith('Erro:') && !message.startsWith('Aviso:') && !message.startsWith('Enviando') && !message.startsWith('Otimizando') && !message.startsWith('Salvando')) {
      const timer = setTimeout(() => setMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach(u => URL.revokeObjectURL(u))
  }, [files])

  async function fetchData() {
    try {
      const { data: imvs, error: imvsError } = await supabase
        .from('imoveis')
        .select(`
          *,
          clientes!proprietario_id (
            id,
            nome,
            email,
            telefone
          ),
          imovel_imagens (
            id,
            url,
            ordem,
            capa
          )
        `)
        .order('created_at', { ascending: false })

      if (imvsError) throw new Error(`Erro ao carregar imóveis: ${imvsError.message}`)

      const { data: corrs, error: corrsError } = await supabase
        .from('corretores')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome')

      if (corrsError) throw new Error(`Erro ao carregar corretores: ${corrsError.message}`)

      if (imvs) setImoveis(imvs)
      if (corrs) setCorretores(corrs)
    } catch (err) {
      setMessage('Erro: ' + err.message)
    }
  }

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const diferenciaisExibidos = useMemo(() => {
    if (!form.tipo) return [];
    const permitidos = MAPA_VISIBILIDADE[form.tipo] || [];
    return LISTA_DIFERENCIAIS.filter(item =>
      permitidos.includes(item.key) || DIFERENCIAIS_GERAIS.includes(item.key)
    );
  }, [form.tipo]);

  const resetFormState = () => {
    setForm(initialState);
    setFiles([]);
    setExistingImages([]);
    setImagesToDelete([]);
  }

  const handleEdit = (imovel) => {
    const flatDifs = imovel.diferenciais || {};
    setForm({ ...initialState, ...imovel, ...flatDifs });
    setMessage('');
    setFiles([]);
    setExistingImages((imovel.imovel_imagens || []).slice().sort((a, b) => a.ordem - b.ordem));
    setImagesToDelete([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const removeExistingImage = (id) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
    setImagesToDelete(prev => [...prev, id]);
  }

  const removeNewFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function handleToggleStatus(id, currentStatus) {
    setTogglingId(id)
    const novoStatus = currentStatus === 'disponivel' ? 'indisponivel' : 'disponivel'
    try {
      const body = new FormData()
      body.append('data', JSON.stringify({ id, status: novoStatus, _action: 'toggle_status' }))

      const response = await fetch('/api/imoveis', { method: 'PUT', body })

      let result = {}
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        result = await response.json()
      }

      if (!response.ok) {
        throw new Error(result.error || `Erro HTTP ${response.status} ao atualizar status.`)
      }

      setImoveis(prev => prev.map(img => img.id === id ? { ...img, status: novoStatus } : img))
    } catch (error) {
      const msg = error.message.includes('Failed to fetch')
        ? 'Sem conexão com o servidor. Verifique sua internet e tente novamente.'
        : error.message
      alert(`Não foi possível alterar o status: ${msg}`)
    } finally {
      setTogglingId(null)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!form.titulo?.trim()) {
      setMessage('Erro: Preencha o título do anúncio.')
      setLoading(false)
      return
    }
    if (!form.tipo) {
      setMessage('Erro: Selecione o tipo do imóvel.')
      setLoading(false)
      return
    }
    if (!form.codigo?.trim()) {
      setMessage('Erro: Preencha o código interno.')
      setLoading(false)
      return
    }
    if (form.finalidade === 'venda' && !form.preco_venda) {
      setMessage('Erro: Informe o preço de venda.')
      setLoading(false)
      return
    }
    if (form.finalidade === 'aluguel' && !form.preco_aluguel) {
      setMessage('Erro: Informe o preço de aluguel.')
      setLoading(false)
      return
    }
    if (form.finalidade === 'venda_aluguel' && (!form.preco_venda || !form.preco_aluguel)) {
      setMessage('Erro: Informe os preços de venda e aluguel.')
      setLoading(false)
      return
    }

    try {
      const payload = { ...form };
      const diferenciaisMap = {};

      LISTA_DIFERENCIAIS.forEach(item => {
        diferenciaisMap[item.key] = !!payload[item.key];
        delete payload[item.key];
      });

      const imagensUrls = []

      if (files.length > 0) {
        setMessage('Otimizando e enviando imagens...')

        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.85,
        }

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          setMessage(`Enviando imagem ${i + 1} de ${files.length}...`)

          let fileToUpload = file
          if (file.type?.startsWith('image/')) {
            try {
              const compressed = await imageCompression(file, options)
              fileToUpload = new File([compressed], file.name, { type: file.type })
            } catch (compressErr) {
              console.warn(`Não foi possível comprimir a imagem "${file.name}":`, compressErr.message)
            }
          }

          const ext = file.name.split('.').pop()
          const filePath = `temp/${Date.now()}-${i}.${ext}`

          const { error: uploadError } = await supabase.storage
            .from('imoveis')
            .upload(filePath, fileToUpload, { contentType: file.type, upsert: false })

          if (uploadError) {
            throw new Error(`Erro ao enviar a imagem "${file.name}" (${i + 1} de ${files.length}): ${uploadError.message}`)
          }

          const { data: urlData } = supabase.storage.from('imoveis').getPublicUrl(filePath)
          const ordemBase = existingImages.length
          imagensUrls.push({ path: filePath, url: urlData.publicUrl, ordem: ordemBase + i, capa: existingImages.length === 0 && i === 0 })
        }
      }

      setMessage('Salvando dados do imóvel...')
      const dataToSend = {
        ...payload,
        diferenciais: diferenciaisMap,
        imagens: imagensUrls,
        imagens_remover: imagesToDelete,
      }

      const body = new FormData()
      body.append('data', JSON.stringify(dataToSend))

      const method = form.id ? 'PUT' : 'POST'

      let response
      try {
        response = await fetch('/api/imoveis', { method, body })
      } catch {
        throw new Error('Sem conexão com o servidor. Verifique sua internet e tente novamente.')
      }

      const contentType = response.headers.get('content-type')
      let result = {}
      if (contentType?.includes('application/json')) {
        result = await response.json()
      } else {
        throw new Error(`Resposta inesperada do servidor (Status ${response.status}). Tente novamente.`)
      }

      if (!response.ok) {
        throw new Error(result.error || 'Erro desconhecido ao processar o imóvel.')
      }

      if (response.status === 207 && result.warning) {
        setMessage(`Aviso: ${result.warning}`)
      } else {
        setMessage(form.id ? '✓ Imóvel atualizado com sucesso!' : '✓ Imóvel publicado com sucesso!')
      }

      resetFormState()
      setShowForm(false)
      fetchData()
    } catch (error) {
      setMessage('Erro: ' + error.message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <div className="w-64 flex-shrink-0"><Sidebar /></div>

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
              onClick={() => { setShowForm(!showForm); resetFormState(); setMessage(''); }}
              className={`rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition ${showForm ? 'bg-white border border-zinc-300 text-zinc-600' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
            >
              {showForm ? 'Voltar para Lista' : '+ Novo Imóvel'}
            </button>
          </header>

          <Feedback message={message} />

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
                  {imoveis.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 text-sm">
                        Nenhum imóvel cadastrado ainda.
                      </td>
                    </tr>
                  ) : imoveis.map((item) => {
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
                              onChange={() => togglingId !== item.id && handleToggleStatus(item.id, item.status)}
                            />
                            <span className={`text-[10px] font-bold uppercase ${togglingId === item.id ? 'text-zinc-300' : item.status === 'disponivel' ? 'text-emerald-600' : 'text-zinc-400'}`}>
                              {togglingId === item.id ? 'aguarde...' : item.status}
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

                  <Field
                    label="Código Interno *"
                    value={form.codigo || ''}
                    onChange={v => setField('codigo', v)}
                    required
                    readOnly
                    placeholder="Gerando código..."
                  />

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
                  {(form.finalidade === 'venda' || form.finalidade === 'venda_aluguel') && (
                    <Field
                      label={form.finalidade === 'venda_aluguel' ? 'Preço de Venda (R$) *' : 'Venda (R$)'}
                      value={form.preco_venda}
                      onChange={v => setField('preco_venda', v)}
                      placeholder="0,00"
                    />
                  )}
                  {(form.finalidade === 'aluguel' || form.finalidade === 'venda_aluguel') && (
                    <Field
                      label={form.finalidade === 'venda_aluguel' ? 'Preço de Aluguel (R$) *' : 'Aluguel (R$)'}
                      value={form.preco_aluguel}
                      onChange={v => setField('preco_aluguel', v)}
                      placeholder="0,00"
                    />
                  )}
                  <Field label="Condomínio (R$)" value={form.valor_condominio} onChange={v => setField('valor_condominio', v)} placeholder="0,00" />
                  <Field label="IPTU (R$)" value={form.valor_iptu} onChange={v => setField('valor_iptu', v)} placeholder="0,00" />
                </div>
                {form.finalidade === 'venda_aluguel' && (
                  <p className="mt-4 text-xs text-amber-600 font-medium bg-amber-50 border border-amber-100 rounded-lg px-4 py-2">
                    Preencha os dois preços — o imóvel será anunciado para venda e locação simultaneamente.
                  </p>
                )}
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
                {!form.tipo ? (
                  <p className="text-sm text-zinc-400 italic">Selecione o tipo de imóvel para ver os diferenciais disponíveis.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {diferenciaisExibidos.map(item => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setField(item.key, !form[item.key])}
                        className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${form[item.key] ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
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
                    <input type="file" multiple accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])} />
                    <p className="text-sm font-bold text-zinc-900">Adicionar Fotos</p>
                    <p className="text-xs text-zinc-500">Arraste ou clique para selecionar</p>
                  </div>

                  {(existingImages.length > 0 || files.length > 0) && (
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-400">
                        Fotos do imóvel ({existingImages.length + files.length})
                      </p>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                        {existingImages.map(img => (
                          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                            {img.capa && (
                              <span className="absolute bottom-1 left-1 rounded bg-zinc-900/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                CAPA
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(img.id)}
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-xs font-bold leading-none hover:bg-red-600 transition"
                              title="Remover foto"
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        {files.map((f, i) => (
                          <div key={`new-${i}-${f.name}`} className="group relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-emerald-300 bg-zinc-100">
                            {previews[i] && <img src={previews[i]} alt="" className="h-full w-full object-cover" />}
                            <span className="absolute bottom-1 left-1 rounded bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                              NOVA
                            </span>
                            <button
                              type="button"
                              onClick={() => removeNewFile(i)}
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-xs font-bold leading-none hover:bg-red-600 transition"
                              title="Remover"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <div className="flex items-center justify-end gap-4 border-t pt-8">
                <button type="button" onClick={() => { setShowForm(false); setMessage(''); }} className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-800">Cancelar</button>
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
