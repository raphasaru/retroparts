Spec – Busca Interativa de Retrovisores e Peças
Visão geral
Construir um mini‑site de e‑commerce focado em retrovisores e partes (capa, carcaça, lente, motor, aro), com busca interativa que refina os resultados em tempo real conforme o usuário digita.
​
O catálogo baseia‑se em produtos similares ao vendedor RETROPARTS1 do Mercado Livre, com forte uso de marca/modelo/ano do carro, lado (esquerdo/direito) e tipo de comando (manual/elétrico/fixo/retrátil).
​

Objetivos principais:

Autocomplete inteligente (veículo + peça + lado/comando).

Filtros estruturados melhores que os filtros atuais do Mercado Livre.

Diferenciar claramente retrovisor completo x componentes (capa, carcaça, lente etc.).
​

Domínio e modelos de dados
Tabela vehicles
Representa a compatibilidade de cada produto com o carro.

Campos sugeridos:

id (PK).

marca (ex.: Volkswagen, Fiat, Ford, Chevrolet, GM, Renault, Honda, Hyundai, Kia, Chery).
​

modelo (ex.: Gol, Palio, Siena, Vectra, Santana, Civic, City, Fox, Golf, Bravo, Sportage, Megane, C3, T‑Cross, Strada, Montana etc.).
​

geracao ou submodelo (ex.: G2, G3, G4, G5, Economy, Titanium, LT, Weekend, Argentino).
​

ano_inicio (ex.: 1991).

ano_fim (ex.: 1999, 2012, 2022).
​

portas (2, 4, null).

Tabela products
Representa cada anúncio/produto.

Campos:

id (PK).

vehicle_id (FK → vehicles).

titulo_raw (título original descritivo, usado em full‑text).
​

descricao_raw (opcional, texto longo).
​

preco (decimal).

condicao (enum: NOVO, USADO – na base atual predominante USADO).
​

estoque (int).

ativo (bool).

inclui_controle (bool) – inspirado no filtro “Inclui controle”.
​

inclui_suporte (bool) – inspirado no filtro “Inclui suporte”.
​

inclui_espelho (bool) – baseado em “Inclui espelho / Não inclui espelho”.
​

frete_gratis (bool).

origem_frete (enum: LOCAL, OUTROS) – inspirado no filtro “Origem do frete: Local”.
​

seller_id (se houver multi‑lojista; aqui pode ser fixo para um único vendedor).
​

Tabela mirror_parts
Normaliza o tipo de peça e detalhes do retrovisor.

Campos:

id (PK).

product_id (FK → products).

tipo_peca (enum):

RETROVISOR_COMPLETO

CARCACA_CORPO_CANOA

CAPA

LENTE_ESPELHO

MOTOR

ARO_MOLDURA.
​

lado (enum: ESQUERDO, DIREITO, AMBOS).
​

comando (enum: MANUAL, ELETRICO, FIXO, RETRATIL).
​

com_pisca (bool) – para itens como capas com pisca (Strada/Weekend/Idea, New Fiesta etc.).
​

cor (string curta: preto, cinza, prateado, azul etc.).
​

Tabela shipping_options (opcional, granular)
Para detalhar frete e retirada.

Campos:

id (PK).

product_id (FK → products).

tipo (enum: NORMAL, EXPRESSO, RETIRADA_LOCAL).

cidade_origem (ex.: São Paulo).
​

prazo_min_dias, prazo_max_dias.

preco_frete.

frete_gratis (bool – pode redundar com products.frete_gratis).
​

Filtros da interface
Grupo: Veículo
Filtros que aparecem na lateral ou no topo, em cascata:

Marca: select/combobox (Volkswagen, Fiat, Ford, Chevrolet, GM, Renault, Honda, Hyundai, Kia, Chery etc.).
​

Modelo: combobox dependente da marca (Gol, Palio, Siena, Bravo, Civic, City, Fox, Golf, Sportage, Megane, C3, T‑Cross, Strada, Montana, Spin etc.).
​

Geração/Submodelo: G2, G3, G4, G5, Economy, Titanium, LT, Weekend etc.
​

Faixa de anos: slider ou selects (ano_inicio–ano_fim; ex.: 1991–1999, 2003–2008, 2013–2022).
​

Portas: 2 portas, 4 portas.
​

Grupo: Peça de retrovisor
Filtros principais:

Tipo de peça:

Retrovisor completo.

Carcaça/Corpo/Canoa.

Capa.

Lente/Espelho.

Motor.

Aro/Moldura.
​

Lado: Esquerdo, Direito.

Comando: Manual, Elétrico, Fixo, Retrátil.
​

Com pisca embutido: Sim/Não.
​

Inclui espelho: Sim/Não (mapeado de inclui_espelho).
​

Inclui controle: Sim/Não.

Inclui suporte: Sim/Não.
​

Grupo: Preço e condição
Baseado nos filtros do ML:

Faixa de preço:

Até R$ 75.

R$ 75 a R$ 100.

Mais de R$ 100.

Campo faixa livre (mínimo/máximo).
​

Condição: Novo, Usado.
​

Grupo: Entrega e pagamento
Frete grátis: checkbox.
​

Origem do frete: Local (cidade do vendedor) / Outros.
​

Retirada grátis em São Paulo: checkbox (usa shipping_options com tipo RETIRADA_LOCAL).
​

Parcelamento sem juros: checkbox (campo pode ser derivado das condições de pagamento; no ML há filtro “Parcelamento sem juros”).
​

Busca interativa (UX da pesquisa)
Campo de busca principal
Entrada de texto livre, com atualização dos resultados a cada keypress/debounce.

Exemplos de buscas:

“gol g3 retrovisor esquerdo elétrico”.

“palio economy capa esquerda”.

“civic 2012 lente retrovisor”.
​

Autocomplete / sugestões
Endpoint de autocomplete deve retornar sugestões de três tipos:

Veículo

“Gol G3 1999–2005”.

“Palio Economy 2011–2016”.

“Santana 1991–1999”.
​

Peça

“Retrovisor elétrico esquerdo”.

“Capa retrovisor com pisca direito”.

“Lente espelho esquerdo azul”.
​

Combinação veículo + peça

“Retrovisor elétrico esquerdo Gol G3 1999–2005”.

“Capa retrovisor New Fiesta 2013–2022 esquerda c/ pisca”.
​

Quando o usuário seleciona uma sugestão:

Preencher filtros estruturados (vehicle_id, lado, comando, tipo_peca etc.).

Atualizar a lista de produtos sem recarregar a página (SPA ou similar).
​

API de busca – formato sugerido
Endpoint: GET /search
Parâmetros (query string):

q (string, opcional) – texto livre.

marca, modelo, geracao, ano_inicio, ano_fim, portas.

tipo_peca, lado, comando, com_pisca, inclui_espelho, inclui_controle, inclui_suporte.

preco_min, preco_max.

condicao.

frete_gratis, origem_frete, retirada_local, parcelamento_sem_juros.

page, page_size, sort (ex.: sort=price_asc, sort=relevance).
​

Resposta (JSON):

json
{
  "filters": {
    "applied": { "...": "..." },
    "available": {
      "marca": ["Volkswagen", "Fiat", "Ford"],
      "modelo": ["Gol", "Palio", "Civic"],
      "tipo_peca": ["RETROVISOR_COMPLETO", "CAPA", "CARCACA_CORPO_CANOA"]
    }
  },
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1554
  },
  "products": [
    {
      "id": 123,
      "titulo": "Retrovisor manual Argo Cronos esquerdo 2018 a 2021 original",
      "preco": 277.80,
      "condicao": "USADO",
      "frete_gratis": false,
      "vehicle": {
        "marca": "Fiat",
        "modelo": "Argo",
        "geracao": null,
        "ano_inicio": 2018,
        "ano_fim": 2021
      },
      "mirror_part": {
        "tipo_peca": "RETROVISOR_COMPLETO",
        "lado": "ESQUERDO",
        "comando": "MANUAL",
        "com_pisca": false
      }
    }
  ]
}
API de autocomplete – formato sugerido
Endpoint: GET /autocomplete
Parâmetros:

q – texto parcial.

limit – máximo de sugestões.
​

Resposta:

json
{
  "query": "gol g3 esq el",
  "suggestions": {
    "vehicles": [
      { "label": "Gol G3 1999–2005", "vehicle_id": 10 }
    ],
    "parts": [
      {
        "label": "Retrovisor elétrico esquerdo",
        "tipo_peca": "RETROVISOR_COMPLETO",
        "lado": "ESQUERDO",
        "comando": "ELETRICO"
      }
    ],
    "combined": [
      {
        "label": "Retrovisor elétrico esquerdo Gol G3 1999–2005",
        "vehicle_id": 10,
        "tipo_peca": "RETROVISOR_COMPLETO",
        "lado": "ESQUERDO",
        "comando": "ELETRICO"
      }
    ]
  }
}
Indexação e tecnologia sugerida
Banco relacional (PostgreSQL ou MySQL) para o modelo de dados.

Índice full‑text ou trigram em products.titulo_raw, vehicles.marca, vehicles.modelo, vehicles.geracao.

Índices de filtro em vehicle_id, tipo_peca, lado, comando, preco, condicao, frete_gratis, inclui_espelho.
​

Opcional: usar ElasticSearch/OpenSearch para autocomplete avançado, sinônimos e relevância.
​

Passo inicial para o dev
Para começar, o Claude Code pode:

Criar migrations/DDL para as tabelas vehicles, products, mirror_parts, shipping_options.

Implementar endpoints GET /search e GET /autocomplete com filtros e paginação.

Montar um front SPA simples (React/Vue/Svelte) com:

Campo de busca com debounce + autocomplete.

Filtros laterais em grupos (Veículo, Peça, Preço, Entrega).

Listagem de produtos em grid, no estilo dos cards do Mercado Livre.
