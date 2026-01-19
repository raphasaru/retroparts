// Mercado Livre API Service
// Documentation: https://developers.mercadolivre.com.br/en_us/items-and-searches
// Note: ML API now requires OAuth authentication for seller searches
// This service uses fallback data when API is unavailable

const ML_API_BASE = 'https://api.mercadolibre.com';
const SITE_ID = 'MLB'; // Brasil
const SELLER_ID = '260093601'; // RETROPARTS

export interface MLProduct {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  available_quantity: number;
  sold_quantity: number;
  condition: 'new' | 'used';
  permalink: string;
  thumbnail: string;
  thumbnail_id: string;
  accepts_mercadopago: boolean;
  shipping: {
    free_shipping: boolean;
    mode: string;
    logistic_type: string;
  };
  attributes: Array<{
    id: string;
    name: string;
    value_name: string;
  }>;
  original_price: number | null;
  category_id: string;
  official_store_id: number | null;
  domain_id: string;
  catalog_product_id: string | null;
  tags: string[];
  installments?: {
    quantity: number;
    amount: number;
    rate: number;
    currency_id: string;
  };
}

export interface MLSearchResponse {
  site_id: string;
  seller: {
    id: number;
    nickname: string;
  };
  paging: {
    total: number;
    primary_results: number;
    offset: number;
    limit: number;
  };
  results: MLProduct[];
  filters: Array<{
    id: string;
    name: string;
    values: Array<{
      id: string;
      name: string;
      results: number;
    }>;
  }>;
  available_filters: Array<{
    id: string;
    name: string;
    values: Array<{
      id: string;
      name: string;
      results: number;
    }>;
  }>;
}

// Fallback products data (cached from ML)
const FALLBACK_PRODUCTS: MLProduct[] = [
  { id: "MLB3726818227", title: "Retrovisor Manual Argo Cronos Esquerdo 2018 A 2021 Original", price: 277.80, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-manual-argo-cronos-esquerdo-2018-a-2021-original/p/MLB3726818227", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_937489-MLB72428475917_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 6, amount: 46.30, rate: 0, currency_id: "BRL" } },
  { id: "MLB3735287940", title: "Carcaça Retrovisor Gol Bola Direito 1996 A 1999 4p Original", price: 139.48, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/carcaca-retrovisor-gol-bola-direito-1996-a-1999-4p-original/p/MLB3735287940", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_756341-MLB72505736509_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 34.87, rate: 0, currency_id: "BRL" } },
  { id: "MLB3735784286", title: "Retrovisor Elétrico Santana 1991 A 1999 Original Esquerdo", price: 173.80, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-eletrico-santana-1991-a-1999-original-esquerdo/p/MLB3735784286", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_844285-MLB72505944441_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 5, amount: 34.76, rate: 0, currency_id: "BRL" } },
  { id: "MLB3739748118", title: "Motor Do Retrovisor Vectra Direito 1996 A 1999 Original", price: 140.00, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/motor-do-retrovisor-vectra-direito-1996-a-1999-original/p/MLB3739748118", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_608689-MLB72530499017_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 35.00, rate: 0, currency_id: "BRL" } },
  { id: "MLB3713620615", title: "Retrovisor Esquerdo Fixo Monza 1991 A 1996 Original", price: 197.72, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-esquerdo-fixo-monza-1991-a-1996-original/p/MLB3713620615", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_756341-MLB72398893685_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 6, amount: 32.95, rate: 0, currency_id: "BRL" } },
  { id: "MLB3705244023", title: "Capa Do Retrovisor Esquerdo Honda Fit 2003 A 2008 Original Preto", price: 68.64, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/capa-do-retrovisor-esquerdo-honda-fit-2003-a-2008-original/p/MLB3705244023", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_654782-MLB72356693981_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: true, mode: "me2", logistic_type: "fulfillment" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 3, amount: 22.88, rate: 0, currency_id: "BRL" } },
  { id: "MLB3735758662", title: "Corpo Retrovisor Elétrico Esquerdo Vectra 1996 A 1999 Origin", price: 132.20, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/corpo-retrovisor-eletrico-esquerdo-vectra-1996-a-1999-origin/p/MLB3735758662", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_608689-MLB72505912665_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 33.05, rate: 0, currency_id: "BRL" } },
  { id: "MLB3707008827", title: "Retrovisor Manual Direito Corsa Classic 1999 A 2014 Original", price: 197.10, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-manual-direito-corsa-classic-1999-a-2014-original/p/MLB3707008827", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_756341-MLB72369205101_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 6, amount: 32.85, rate: 0, currency_id: "BRL" } },
  { id: "MLB3707121715", title: "Retrovisor Elétrico Direito Fox 2013 A 2022 C/pisca Original", price: 249.01, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-eletrico-direito-fox-2013-a-2022-cpisca-original/p/MLB3707121715", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_654782-MLB72369328005_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 6, amount: 41.50, rate: 0, currency_id: "BRL" } },
  { id: "MLB3706872715", title: "Aro Moldura Retrovisor Esquerdo Sportage 2011 A 2015 Origina Preto", price: 154.04, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/aro-moldura-retrovisor-esquerdo-sportage-2011-a-2015-origina/p/MLB3706872715", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_756341-MLB72368996557_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 5, amount: 30.81, rate: 0, currency_id: "BRL" } },
  { id: "MLB3715858744", title: "Retrovisor Manual Palio Siena Direito 2007 A 2012 Original", price: 134.20, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-manual-palio-siena-direito-2007-a-2012-original/p/MLB3715858744", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_654782-MLB72420617437_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 33.55, rate: 0, currency_id: "BRL" } },
  { id: "MLB3676997539", title: "Retrovisor Elétrico Esquerdo Chery Cielo 2010 A 2013 Origina", price: 331.42, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-eletrico-esquerdo-chery-cielo-2010-a-2013-origina/p/MLB3676997539", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_756341-MLB72225591917_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 6, amount: 55.24, rate: 0, currency_id: "BRL" } },
  { id: "MLB3715707572", title: "Carcaça Retrovisor New Civic Esquerdo 2007 A 2011 Original", price: 199.09, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/carcaca-retrovisor-new-civic-esquerdo-2007-a-2011-original/p/MLB3715707572", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_654782-MLB72420423053_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 6, amount: 33.18, rate: 0, currency_id: "BRL" } },
  { id: "MLB3684477375", title: "Retrovisor Esquerdo Elétrico Santana 1991 A 1999 Original", price: 124.71, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-esquerdo-eletrico-santana-1991-a-1999-original/p/MLB3684477375", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_756341-MLB72269789381_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 31.18, rate: 0, currency_id: "BRL" } },
  { id: "MLB3726339731", title: "Retrovisor Elétrico Fox 2005 A 2010 Original Direito", price: 181.08, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-eletrico-fox-2005-a-2010-original-direito/p/MLB3726339731", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_937489-MLB72428201757_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 6, amount: 30.18, rate: 0, currency_id: "BRL" } },
  { id: "MLB3676922971", title: "Corpo E Retrátil Retrovisor Fiat Bravo 2011 A 2016 Esquerdo", price: 359.90, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/corpo-e-retratil-retrovisor-fiat-bravo-2011-a-2016-esquerdo/p/MLB3676922971", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_756341-MLB72225549593_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 7, amount: 51.41, rate: 0, currency_id: "BRL" } },
  { id: "MLB3735777276", title: "Carcaça Do Retrovisor Esquerdo Santana 1998 A 2001 Original", price: 179.00, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/carcaca-do-retrovisor-esquerdo-santana-1998-a-2001-original/p/MLB3735777276", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_844285-MLB72505920449_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 5, amount: 35.80, rate: 0, currency_id: "BRL" } },
  { id: "MLB3726329051", title: "Carcaça Do Retrovisor Elétrico Direito Polo 2003 A 2008 Orig", price: 175.88, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/carcaca-do-retrovisor-eletrico-direito-polo-2003-a-2008-orig/p/MLB3726329051", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_937489-MLB72428189881_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 5, amount: 35.18, rate: 0, currency_id: "BRL" } },
  { id: "MLB3726376097", title: "Retrovisor Direito Manual Palio 1996 A 2000 Original", price: 160.28, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-direito-manual-palio-1996-a-2000-original/p/MLB3726376097", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_937489-MLB72428230037_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 5, amount: 32.06, rate: 0, currency_id: "BRL" } },
  { id: "MLB3707105267", title: "Carcaça Do Retrovisor Gol G3 G4 Direito 1999 A 2009 Original", price: 139.19, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/carcaca-do-retrovisor-gol-g3-g4-direito-1999-a-2009-original/p/MLB3707105267", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_756341-MLB72369290221_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 34.80, rate: 0, currency_id: "BRL" } },
  { id: "MLB3735486070", title: "Retrovisor Manual Palio Direito 1996 A 2005 4portas Original", price: 149.88, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-manual-palio-direito-1996-a-2005-4portas-original/p/MLB3735486070", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_608689-MLB72505630777_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 37.47, rate: 0, currency_id: "BRL" } },
  { id: "MLB3574557394", title: "Retrovisor Fixo Gol G2 Direito 1996 A 1999 4 Portas Original", price: 100.47, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-fixo-gol-g2-direito-1996-a-1999-4-portas-original/p/MLB3574557394", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_654782-MLB71916467529_092023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 25.12, rate: 0, currency_id: "BRL" } },
  { id: "MLB3715848840", title: "Carcaça Retrovisor Palio Economy Direito 2011 A 2016 Origina", price: 114.52, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/carcaca-retrovisor-palio-economy-direito-2011-a-2016-origina/p/MLB3715848840", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_654782-MLB72420590665_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 28.63, rate: 0, currency_id: "BRL" } },
  { id: "MLB3735499318", title: "Retrovisor Manual Direito Palio 1997 A 2000 Original", price: 160.28, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-manual-direito-palio-1997-a-2000-original/p/MLB3735499318", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_608689-MLB72505648973_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 5, amount: 32.06, rate: 0, currency_id: "BRL" } },
  { id: "MLB3734056156", title: "Retrovisor Elétrico Direito Santana 1998 A 2006 Original", price: 201.88, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-eletrico-direito-santana-1998-a-2006-original/p/MLB3734056156", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_937489-MLB72496844913_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 6, amount: 33.65, rate: 0, currency_id: "BRL" } },
  { id: "MLB3717892534", title: "Canoa Do Retrovisor Golf Esquerdo 2014 A 2020 Original Preto", price: 66.56, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/canoa-do-retrovisor-golf-esquerdo-2014-a-2020-original/p/MLB3717892534", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_654782-MLB72431161377_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: true, mode: "me2", logistic_type: "fulfillment" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 3, amount: 22.19, rate: 0, currency_id: "BRL" } },
  { id: "MLB3734014180", title: "Retrovisor Fixo Gol Bola 1995 A 1999 2porta Original Direito", price: 149.88, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-fixo-gol-bola-1995-a-1999-2porta-original-direito/p/MLB3734014180", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_937489-MLB72496809341_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 37.47, rate: 0, currency_id: "BRL" } },
  { id: "MLB3739734062", title: "Retrovisor Elétrico Direito 2015 Fiesta Titanium Original", price: 180.00, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-eletrico-direito-2015-fiesta-titanium-original/p/MLB3739734062", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_608689-MLB72530478657_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 6, amount: 30.00, rate: 0, currency_id: "BRL" } },
  { id: "MLB3739723918", title: "Aro Moldura Retrovisor Vectra 1997 A 1999 Original Direito Preto", price: 140.00, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/aro-moldura-retrovisor-vectra-1997-a-1999-original-direito/p/MLB3739723918", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_608689-MLB72530465941_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 35.00, rate: 0, currency_id: "BRL" } },
  { id: "MLB3739695100", title: "Corpo Retrovisor Elétrico Direito Vectra 1996 A 1999 Origin", price: 130.00, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/corpo-retrovisor-eletrico-direito-vectra-1996-a-1999-origin/p/MLB3739695100", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_608689-MLB72530427285_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 32.50, rate: 0, currency_id: "BRL" } },
  { id: "MLB3670380192", title: "Retrovisor Elétrico Corsa Montana Direito 2003 A 12 Original", price: 207.08, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-eletrico-corsa-montana-direito-2003-a-12-original/p/MLB3670380192", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_654782-MLB72198054669_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 6, amount: 34.51, rate: 0, currency_id: "BRL" } },
  { id: "MLB3678958622", title: "Capa Do Retrovisor Honda City 2009 A 2014 Esquerdo Original Prateado", price: 151.75, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/capa-do-retrovisor-honda-city-2009-a-2014-esquerdo-original/p/MLB3678958622", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_654782-MLB72235447269_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 5, amount: 30.35, rate: 0, currency_id: "BRL" } },
  { id: "MLB3730785787", title: "Capa Do Retrovisor Esquerdo Spin 2011 A 2018 Original Cinza", price: 80.00, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/capa-do-retrovisor-esquerdo-spin-2011-a-2018-original/p/MLB3730785787", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_844285-MLB72450952833_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 3, amount: 26.67, rate: 0, currency_id: "BRL" } },
  { id: "MLB3739785928", title: "Capa Do Retrovisor New Fiesta 2013 A 2022 Esquerda P/ Pisca Preto", price: 100.00, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/capa-do-retrovisor-new-fiesta-2013-a-2022-esquerda-p-pisca/p/MLB3739785928", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_608689-MLB72530551005_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 25.00, rate: 0, currency_id: "BRL" } },
  { id: "MLB3658116394", title: "Retrovisor Elétrico Esquerdo Santana 1991 A 1999 Original", price: 143.18, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-eletrico-esquerdo-santana-1991-a-1999-original/p/MLB3658116394", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_654782-MLB72136119097_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 4, amount: 35.80, rate: 0, currency_id: "BRL" } },
  { id: "MLB3728827236", title: "Retrovisor Manual Santana Esquerdo 1991 A 1999 Original", price: 177.96, currency_id: "BRL", available_quantity: 1, sold_quantity: 0, condition: "used", permalink: "https://www.mercadolivre.com.br/retrovisor-manual-santana-esquerdo-1991-a-1999-original/p/MLB3728827236", thumbnail: "http://http2.mlstatic.com/D_NQ_NP_2X_937489-MLB72436621773_102023-F.webp", thumbnail_id: "", accepts_mercadopago: true, shipping: { free_shipping: false, mode: "me2", logistic_type: "drop_off" }, attributes: [], original_price: null, category_id: "MLB1747", official_store_id: null, domain_id: "MLB-CAR_MIRRORS", catalog_product_id: null, tags: [], installments: { quantity: 5, amount: 35.59, rate: 0, currency_id: "BRL" } },
];

// Fetch all products from seller with pagination
export async function fetchSellerProducts(
  options: {
    limit?: number;
    offset?: number;
    sort?: 'price_asc' | 'price_desc' | 'relevance';
  } = {}
): Promise<MLSearchResponse> {
  const { limit = 50, offset = 0, sort = 'relevance' } = options;

  const url = new URL(`${ML_API_BASE}/sites/${SITE_ID}/search`);
  url.searchParams.set('seller_id', SELLER_ID);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('offset', offset.toString());
  url.searchParams.set('sort', sort);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`ML API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Backend API URL - uses relative path for Vercel, or localhost for dev
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

// Fetch products in batches (progressive loading)
export async function fetchSellerProductsBatch(batch: number = 0, batchSize: number = 100): Promise<{
  results: MLProduct[];
  total: number;
  hasMore: boolean;
  fetched: number;
}> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/products/authorized-stream?batch=${batch}&batchSize=${batchSize}`);
    
    if (!response.ok) {
      throw new Error(`Backend Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      total: data.total || 0,
      hasMore: data.hasMore || false,
      fetched: data.fetched || 0,
    };
  } catch (error) {
    console.warn('Stream endpoint unavailable, falling back to full fetch:', error);
    // Fallback to full fetch
    return fetchAllSellerProductsFull().then(products => ({
      results: products,
      total: products.length,
      hasMore: false,
      fetched: products.length,
    }));
  }
}

// Fetch all products from backend (handling pagination) with fallback
export async function fetchAllSellerProducts(): Promise<MLProduct[]> {
  try {
    // Try to fetch from authorized endpoint first (OAuth products)
    const response = await fetch(`${BACKEND_URL}/api/products/authorized`);
    
    if (!response.ok) {
      throw new Error(`Backend Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.warn('Backend unavailable, trying direct API:', error);
    return fetchAllSellerProductsFull();
  }
}

// Fallback: fetch all products via direct API
async function fetchAllSellerProductsFull(): Promise<MLProduct[]> {
  try {
    const allProducts: MLProduct[] = [];
    let offset = 0;
    const limit = 50;
    let total = Infinity;

    while (offset < total && offset < 1000) { // ML limits to 1000 results
      const response = await fetchSellerProducts({ limit, offset });
      allProducts.push(...response.results);
      total = response.paging.total;
      offset += limit;

      // Small delay to avoid rate limiting
      if (offset < total) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allProducts;
  } catch (directError) {
    console.warn('Direct API also unavailable, using fallback data:', directError);
    // Return fallback data when both fail
    return FALLBACK_PRODUCTS;
  }
}

// Get higher resolution thumbnail
export function getHighResThumbnail(thumbnail: string): string {
  // ML thumbnails can be upgraded from -I.jpg to -O.jpg for larger size
  // Or use pictures API for full resolution
  return thumbnail.replace('-I.jpg', '-O.jpg');
}

// Format price in BRL
export function formatMLPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

// Format installments
export function formatInstallments(installments?: MLProduct['installments']): string {
  if (!installments) return '';

  const amount = formatMLPrice(installments.amount);
  const noInterest = installments.rate === 0 ? ' sem juros' : '';

  return `${installments.quantity}x ${amount}${noInterest}`;
}
