import type { MLProduct } from '../services/mercadolivre';
import { formatMLPrice, formatInstallments, getHighResThumbnail } from '../services/mercadolivre';

export interface Product {
  id: string;
  titulo: string;
  preco: number;
  precoFormatado: string;
  parcelas: string;
  condicao: 'Usado' | 'Novo';
  freteGratis: boolean;
  link: string;
  thumbnail: string | null;
  // Dados estruturados extraídos do título
  marca: string;
  modelo: string;
  tipoPeca: string;
  lado: 'Esquerdo' | 'Direito' | 'Ambos' | null;
  comando: 'Manual' | 'Elétrico' | 'Fixo' | 'Retrátil' | null;
  anoInicio: number | null;
  anoFim: number | null;
  cor: string | null;
  comPisca: boolean;
}

// Função para extrair dados estruturados do título
export function parseTitle(titulo: string): Partial<Product> {
  const tituloLower = titulo.toLowerCase();

  let marca = 'Outro';
  let modelo = '';

  // Detectar modelo pelo nome (mais específico)
  const modeloPatterns = [
    { pattern: /\b(gol)\s*(g2|g3|g4|g5|g6|g7|bola)?\b/i, marca: 'Volkswagen', modelo: 'Gol' },
    { pattern: /\bsantana\b/i, marca: 'Volkswagen', modelo: 'Santana' },
    { pattern: /\bfox\b/i, marca: 'Volkswagen', modelo: 'Fox' },
    { pattern: /\bgolf\b/i, marca: 'Volkswagen', modelo: 'Golf' },
    { pattern: /\bpolo\b/i, marca: 'Volkswagen', modelo: 'Polo' },
    { pattern: /\bsaveiro\b/i, marca: 'Volkswagen', modelo: 'Saveiro' },
    { pattern: /\bvoyage\b/i, marca: 'Volkswagen', modelo: 'Voyage' },
    { pattern: /\bpassat\b/i, marca: 'Volkswagen', modelo: 'Passat' },
    { pattern: /\bjetta\b/i, marca: 'Volkswagen', modelo: 'Jetta' },
    { pattern: /\btouareg\b/i, marca: 'Volkswagen', modelo: 'Touareg' },
    { pattern: /\btiguan\b/i, marca: 'Volkswagen', modelo: 'Tiguan' },
    { pattern: /\bamarok\b/i, marca: 'Volkswagen', modelo: 'Amarok' },
    { pattern: /\bt-?cross\b/i, marca: 'Volkswagen', modelo: 'T-Cross' },
    { pattern: /\bnivus\b/i, marca: 'Volkswagen', modelo: 'Nivus' },
    { pattern: /\bup\b/i, marca: 'Volkswagen', modelo: 'Up' },
    { pattern: /\b(argo|cronos)\b/i, marca: 'Fiat', modelo: 'Argo' },
    { pattern: /\bpalio\b/i, marca: 'Fiat', modelo: 'Palio' },
    { pattern: /\bsiena\b/i, marca: 'Fiat', modelo: 'Siena' },
    { pattern: /\bbravo\b/i, marca: 'Fiat', modelo: 'Bravo' },
    { pattern: /\bstrada\b/i, marca: 'Fiat', modelo: 'Strada' },
    { pattern: /\bweekend\b/i, marca: 'Fiat', modelo: 'Weekend' },
    { pattern: /\bidea\b/i, marca: 'Fiat', modelo: 'Idea' },
    { pattern: /\bpunto\b/i, marca: 'Fiat', modelo: 'Punto' },
    { pattern: /\blinea\b/i, marca: 'Fiat', modelo: 'Linea' },
    { pattern: /\buno\b/i, marca: 'Fiat', modelo: 'Uno' },
    { pattern: /\btoro\b/i, marca: 'Fiat', modelo: 'Toro' },
    { pattern: /\bmobi\b/i, marca: 'Fiat', modelo: 'Mobi' },
    { pattern: /\bducato\b/i, marca: 'Fiat', modelo: 'Ducato' },
    { pattern: /\bdob[lô]o?\b/i, marca: 'Fiat', modelo: 'Doblo' },
    { pattern: /\bvectra\b/i, marca: 'Chevrolet', modelo: 'Vectra' },
    { pattern: /\b(corsa|classic)\b/i, marca: 'Chevrolet', modelo: 'Corsa' },
    { pattern: /\bmontana\b/i, marca: 'Chevrolet', modelo: 'Montana' },
    { pattern: /\bspin\b/i, marca: 'Chevrolet', modelo: 'Spin' },
    { pattern: /\bmonza\b/i, marca: 'Chevrolet', modelo: 'Monza' },
    { pattern: /\bcelta\b/i, marca: 'Chevrolet', modelo: 'Celta' },
    { pattern: /\bprisma\b/i, marca: 'Chevrolet', modelo: 'Prisma' },
    { pattern: /\bcobalt\b/i, marca: 'Chevrolet', modelo: 'Cobalt' },
    { pattern: /\bonix\b/i, marca: 'Chevrolet', modelo: 'Onix' },
    { pattern: /\bcruze\b/i, marca: 'Chevrolet', modelo: 'Cruze' },
    { pattern: /\bs10\b/i, marca: 'Chevrolet', modelo: 'S10' },
    { pattern: /\btrailblazer\b/i, marca: 'Chevrolet', modelo: 'Trailblazer' },
    { pattern: /\btracker\b/i, marca: 'Chevrolet', modelo: 'Tracker' },
    { pattern: /\bfit\b/i, marca: 'Honda', modelo: 'Fit' },
    { pattern: /\b(civic|new\s*civic)\b/i, marca: 'Honda', modelo: 'Civic' },
    { pattern: /\bcity\b/i, marca: 'Honda', modelo: 'City' },
    { pattern: /\bhr-?v\b/i, marca: 'Honda', modelo: 'HR-V' },
    { pattern: /\bcr-?v\b/i, marca: 'Honda', modelo: 'CR-V' },
    { pattern: /\bwr-?v\b/i, marca: 'Honda', modelo: 'WR-V' },
    { pattern: /\baccord\b/i, marca: 'Honda', modelo: 'Accord' },
    { pattern: /\b(fiesta|new\s*fiesta)\b/i, marca: 'Ford', modelo: 'Fiesta' },
    { pattern: /\bka\b/i, marca: 'Ford', modelo: 'Ka' },
    { pattern: /\bfocus\b/i, marca: 'Ford', modelo: 'Focus' },
    { pattern: /\becosport\b/i, marca: 'Ford', modelo: 'EcoSport' },
    { pattern: /\branger\b/i, marca: 'Ford', modelo: 'Ranger' },
    { pattern: /\bfusion\b/i, marca: 'Ford', modelo: 'Fusion' },
    { pattern: /\bsportage\b/i, marca: 'Kia', modelo: 'Sportage' },
    { pattern: /\bcerato\b/i, marca: 'Kia', modelo: 'Cerato' },
    { pattern: /\bsoul\b/i, marca: 'Kia', modelo: 'Soul' },
    { pattern: /\bsorento\b/i, marca: 'Kia', modelo: 'Sorento' },
    { pattern: /\bpicanto\b/i, marca: 'Kia', modelo: 'Picanto' },
    { pattern: /\bcielo\b/i, marca: 'Chery', modelo: 'Cielo' },
    { pattern: /\bqq\b/i, marca: 'Chery', modelo: 'QQ' },
    { pattern: /\btiggo\b/i, marca: 'Chery', modelo: 'Tiggo' },
    { pattern: /\barrizo\b/i, marca: 'Chery', modelo: 'Arrizo' },
    { pattern: /\bhb20\b/i, marca: 'Hyundai', modelo: 'HB20' },
    { pattern: /\btucson\b/i, marca: 'Hyundai', modelo: 'Tucson' },
    { pattern: /\bi30\b/i, marca: 'Hyundai', modelo: 'i30' },
    { pattern: /\bcreta\b/i, marca: 'Hyundai', modelo: 'Creta' },
    { pattern: /\belantra\b/i, marca: 'Hyundai', modelo: 'Elantra' },
    { pattern: /\bsanta\s*f[ée]\b/i, marca: 'Hyundai', modelo: 'Santa Fe' },
    { pattern: /\bazera\b/i, marca: 'Hyundai', modelo: 'Azera' },
    { pattern: /\bmegane\b/i, marca: 'Renault', modelo: 'Megane' },
    { pattern: /\bsandero\b/i, marca: 'Renault', modelo: 'Sandero' },
    { pattern: /\blogan\b/i, marca: 'Renault', modelo: 'Logan' },
    { pattern: /\bduster\b/i, marca: 'Renault', modelo: 'Duster' },
    { pattern: /\bkwid\b/i, marca: 'Renault', modelo: 'Kwid' },
    { pattern: /\bcaptur\b/i, marca: 'Renault', modelo: 'Captur' },
    { pattern: /\bfluence\b/i, marca: 'Renault', modelo: 'Fluence' },
    { pattern: /\bclio\b/i, marca: 'Renault', modelo: 'Clio' },
    { pattern: /\bsc[eé]nic\b/i, marca: 'Renault', modelo: 'Scenic' },
    { pattern: /\bcorolla\b/i, marca: 'Toyota', modelo: 'Corolla' },
    { pattern: /\bhilux\b/i, marca: 'Toyota', modelo: 'Hilux' },
    { pattern: /\betios\b/i, marca: 'Toyota', modelo: 'Etios' },
    { pattern: /\byaris\b/i, marca: 'Toyota', modelo: 'Yaris' },
    { pattern: /\bsw4\b/i, marca: 'Toyota', modelo: 'SW4' },
    { pattern: /\brav4\b/i, marca: 'Toyota', modelo: 'RAV4' },
    { pattern: /\bcamry\b/i, marca: 'Toyota', modelo: 'Camry' },
    { pattern: /\bprius\b/i, marca: 'Toyota', modelo: 'Prius' },
    { pattern: /\bsentra\b/i, marca: 'Nissan', modelo: 'Sentra' },
    { pattern: /\bversa\b/i, marca: 'Nissan', modelo: 'Versa' },
    { pattern: /\bmarch\b/i, marca: 'Nissan', modelo: 'March' },
    { pattern: /\bkicks\b/i, marca: 'Nissan', modelo: 'Kicks' },
    { pattern: /\bfrontier\b/i, marca: 'Nissan', modelo: 'Frontier' },
    { pattern: /\blivina\b/i, marca: 'Nissan', modelo: 'Livina' },
    { pattern: /\btiida\b/i, marca: 'Nissan', modelo: 'Tiida' },
    { pattern: /\bc3\b/i, marca: 'Citroën', modelo: 'C3' },
    { pattern: /\bc4\b/i, marca: 'Citroën', modelo: 'C4' },
    { pattern: /\baircross\b/i, marca: 'Citroën', modelo: 'Aircross' },
    { pattern: /\b208\b/i, marca: 'Peugeot', modelo: '208' },
    { pattern: /\b2008\b/i, marca: 'Peugeot', modelo: '2008' },
    { pattern: /\b3008\b/i, marca: 'Peugeot', modelo: '3008' },
    { pattern: /\b206\b/i, marca: 'Peugeot', modelo: '206' },
    { pattern: /\b207\b/i, marca: 'Peugeot', modelo: '207' },
    { pattern: /\b307\b/i, marca: 'Peugeot', modelo: '307' },
    { pattern: /\b308\b/i, marca: 'Peugeot', modelo: '308' },
    { pattern: /\b408\b/i, marca: 'Peugeot', modelo: '408' },
    { pattern: /\bpartner\b/i, marca: 'Peugeot', modelo: 'Partner' },
    { pattern: /\bclass\s*[abc]\b/i, marca: 'Mercedes-Benz', modelo: 'Classe A/B/C' },
    { pattern: /\ba3\b/i, marca: 'Audi', modelo: 'A3' },
    { pattern: /\ba4\b/i, marca: 'Audi', modelo: 'A4' },
    { pattern: /\bq3\b/i, marca: 'Audi', modelo: 'Q3' },
    { pattern: /\bq5\b/i, marca: 'Audi', modelo: 'Q5' },
    { pattern: /\bserie\s*[123]\b/i, marca: 'BMW', modelo: 'Série 1/2/3' },
    { pattern: /\bx1\b/i, marca: 'BMW', modelo: 'X1' },
    { pattern: /\bx3\b/i, marca: 'BMW', modelo: 'X3' },
    { pattern: /\bcx-?3\b/i, marca: 'Mazda', modelo: 'CX-3' },
    { pattern: /\bcx-?5\b/i, marca: 'Mazda', modelo: 'CX-5' },
    { pattern: /\bmazda\s*3\b/i, marca: 'Mazda', modelo: 'Mazda 3' },
    { pattern: /\bjeep\s*compass\b/i, marca: 'Jeep', modelo: 'Compass' },
    { pattern: /\bjeep\s*renegade\b/i, marca: 'Jeep', modelo: 'Renegade' },
    { pattern: /\bcompasso\b/i, marca: 'Jeep', modelo: 'Compass' },
    { pattern: /\brenegade\b/i, marca: 'Jeep', modelo: 'Renegade' },
    { pattern: /\bwrangler\b/i, marca: 'Jeep', modelo: 'Wrangler' },
    { pattern: /\bcherokee\b/i, marca: 'Jeep', modelo: 'Cherokee' },
    { pattern: /\bxc60\b/i, marca: 'Volvo', modelo: 'XC60' },
    { pattern: /\bxc90\b/i, marca: 'Volvo', modelo: 'XC90' },
    { pattern: /\bs60\b/i, marca: 'Volvo', modelo: 'S60' },
    { pattern: /\bforester\b/i, marca: 'Subaru', modelo: 'Forester' },
    { pattern: /\bimpreza\b/i, marca: 'Subaru', modelo: 'Impreza' },
    { pattern: /\boutback\b/i, marca: 'Subaru', modelo: 'Outback' },
    { pattern: /\bxv\b/i, marca: 'Subaru', modelo: 'XV' },
    { pattern: /\blancer\b/i, marca: 'Mitsubishi', modelo: 'Lancer' },
    { pattern: /\bpajero\b/i, marca: 'Mitsubishi', modelo: 'Pajero' },
    { pattern: /\basx\b/i, marca: 'Mitsubishi', modelo: 'ASX' },
    { pattern: /\boutlander\b/i, marca: 'Mitsubishi', modelo: 'Outlander' },
    { pattern: /\bl200\b/i, marca: 'Mitsubishi', modelo: 'L200' },
    { pattern: /\becclipse\b/i, marca: 'Mitsubishi', modelo: 'Eclipse' },
    { pattern: /\blifan\b/i, marca: 'Lifan', modelo: 'Lifan' },
    { pattern: /\bjac\b/i, marca: 'JAC', modelo: 'JAC' },
    { pattern: /\bsuzuki\b/i, marca: 'Suzuki', modelo: 'Suzuki' },
    { pattern: /\bvitara\b/i, marca: 'Suzuki', modelo: 'Vitara' },
    { pattern: /\bjimny\b/i, marca: 'Suzuki', modelo: 'Jimny' },
    { pattern: /\bswift\b/i, marca: 'Suzuki', modelo: 'Swift' },
  ];

  for (const { pattern, marca: m, modelo: mod } of modeloPatterns) {
    if (pattern.test(tituloLower)) {
      marca = m;
      modelo = mod;
      break;
    }
  }

  // Extrair tipo de peça
  let tipoPeca = 'Retrovisor';
  if (/\bcapa\b/i.test(tituloLower)) {
    tipoPeca = 'Capa';
  } else if (/\b(carca[cç]a|corpo|canoa)\b/i.test(tituloLower)) {
    tipoPeca = 'Carcaça';
  } else if (/\b(lente|espelho)\b/i.test(tituloLower)) {
    tipoPeca = 'Lente';
  } else if (/\bmotor\b/i.test(tituloLower)) {
    tipoPeca = 'Motor';
  } else if (/\b(aro|moldura)\b/i.test(tituloLower)) {
    tipoPeca = 'Aro/Moldura';
  } else if (/\bsuporte\b/i.test(tituloLower)) {
    tipoPeca = 'Suporte';
  } else if (/\bcontrole\b/i.test(tituloLower)) {
    tipoPeca = 'Controle';
  }

  // Extrair lado
  let lado: 'Esquerdo' | 'Direito' | 'Ambos' | null = null;
  if (/\besquerdo?\b/i.test(tituloLower) || /\blado\s*e\b/i.test(tituloLower) || /\ble\b/i.test(tituloLower)) {
    lado = 'Esquerdo';
  } else if (/\bdireito?\b/i.test(tituloLower) || /\blado\s*d\b/i.test(tituloLower) || /\bld\b/i.test(tituloLower)) {
    lado = 'Direito';
  }

  // Extrair comando
  let comando: 'Manual' | 'Elétrico' | 'Fixo' | 'Retrátil' | null = null;
  if (/\bmanual\b/i.test(tituloLower)) {
    comando = 'Manual';
  } else if (/\bel[eé]trico?\b/i.test(tituloLower)) {
    comando = 'Elétrico';
  } else if (/\bfixo\b/i.test(tituloLower)) {
    comando = 'Fixo';
  } else if (/\bretr[aá]til\b/i.test(tituloLower)) {
    comando = 'Retrátil';
  }

  // Extrair anos - vários formatos
  let anoInicio: number | null = null;
  let anoFim: number | null = null;

  // Formato "2018 A 2021" ou "2018 a 2021"
  const anoMatch1 = titulo.match(/(\d{4})\s*[aA]\s*(\d{2,4})/);
  if (anoMatch1) {
    anoInicio = parseInt(anoMatch1[1]);
    let fim = anoMatch1[2];
    if (fim.length === 2) {
      fim = anoMatch1[1].substring(0, 2) + fim;
    }
    anoFim = parseInt(fim);
  }

  // Formato "2018/2021" ou "2018-2021"
  if (!anoInicio) {
    const anoMatch2 = titulo.match(/(\d{4})[\/\-](\d{2,4})/);
    if (anoMatch2) {
      anoInicio = parseInt(anoMatch2[1]);
      let fim = anoMatch2[2];
      if (fim.length === 2) {
        fim = anoMatch2[1].substring(0, 2) + fim;
      }
      anoFim = parseInt(fim);
    }
  }

  // Ano único
  if (!anoInicio) {
    const anoMatch3 = titulo.match(/\b(19\d{2}|20[0-2]\d)\b/);
    if (anoMatch3) {
      anoInicio = parseInt(anoMatch3[1]);
      anoFim = anoInicio;
    }
  }

  // Extrair cor
  let cor: string | null = null;
  const corPatterns = [
    { pattern: /\bpreto\b/i, cor: 'Preto' },
    { pattern: /\bpreta\b/i, cor: 'Preto' },
    { pattern: /\bcinza\b/i, cor: 'Cinza' },
    { pattern: /\bprat[ae]?\b/i, cor: 'Prata' },
    { pattern: /\bazul\b/i, cor: 'Azul' },
    { pattern: /\bbranco?\b/i, cor: 'Branco' },
    { pattern: /\bvermelho?\b/i, cor: 'Vermelho' },
    { pattern: /\bdourado?\b/i, cor: 'Dourado' },
    { pattern: /\bcromado?\b/i, cor: 'Cromado' },
  ];
  for (const { pattern, cor: c } of corPatterns) {
    if (pattern.test(tituloLower)) {
      cor = c;
      break;
    }
  }

  // Verificar se tem pisca
  const comPisca = /\bpisca\b/i.test(tituloLower) || /\bc\/?pisca\b/i.test(tituloLower) || /\bp\/?\s*pisca\b/i.test(tituloLower);

  return {
    marca,
    modelo,
    tipoPeca,
    lado,
    comando,
    anoInicio,
    anoFim,
    cor,
    comPisca,
  };
}

// Convert ML product to our Product format
export function convertMLProduct(mlProduct: MLProduct): Product {
  const parsed = parseTitle(mlProduct.title);

  return {
    id: mlProduct.id,
    titulo: mlProduct.title,
    preco: mlProduct.price,
    precoFormatado: formatMLPrice(mlProduct.price),
    parcelas: formatInstallments(mlProduct.installments),
    condicao: mlProduct.condition === 'new' ? 'Novo' : 'Usado',
    freteGratis: mlProduct.shipping?.free_shipping || false,
    link: mlProduct.permalink,
    thumbnail: mlProduct.thumbnail ? getHighResThumbnail(mlProduct.thumbnail) : null,
    marca: parsed.marca || 'Outro',
    modelo: parsed.modelo || '',
    tipoPeca: parsed.tipoPeca || 'Retrovisor',
    lado: parsed.lado || null,
    comando: parsed.comando || null,
    anoInicio: parsed.anoInicio || null,
    anoFim: parsed.anoFim || null,
    cor: parsed.cor || null,
    comPisca: parsed.comPisca || false,
  };
}

// Export filter values helpers
export function getUniqueValues(products: Product[]) {
  return {
    marcas: [...new Set(products.map(p => p.marca))].sort(),
    modelos: [...new Set(products.map(p => p.modelo).filter(Boolean))].sort(),
    tiposPeca: [...new Set(products.map(p => p.tipoPeca))].sort(),
  };
}

// Static filter values
export const lados = ['Esquerdo', 'Direito'] as const;
export const comandos = ['Manual', 'Elétrico', 'Fixo', 'Retrátil'] as const;

// Função para formatar preço
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
