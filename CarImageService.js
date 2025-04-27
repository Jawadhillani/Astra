// CarImageService.js
// ---------------------------------------------
// Centralised helper for resolving the best URL
// for a vehicle image or illustration.
// ---------------------------------------------

// NOTE:  The public CarQuery API does **not** support CORS
// and only ships JSON‑P wrapped data over plain HTTP.
// A client‑side fetch therefore fails in modern browsers.
// Until you proxy it through Next.js (see comments below),
// we purposely short‑circuit the browser call by returning
// `null` immediately. This prevents the “TypeError: Failed
// to fetch” console spam.

// If you later add `/pages/api/carquery.js` to proxy it
// server‑side, just swap the stub for the original logic.

// ---------------------------------------------
// Quick reference of fall‑back order
// 1) (optional) CarMD Photo          – realistic PNG/JPEG
// 2) (optional) CarQuery (via proxy) – small JPG
// 3) CarPix static URL               – cartoon PNG (may 404)
// 4) Generated silhouette via via.placeholder.com
// ---------------------------------------------

/**
 * @typedef {Object} Car
 * @property {string}  manufacturer
 * @property {string}  model
 * @property {number}  year
 * @property {string=} body_type
 */

//-------------------------------------------------
// Public API
//-------------------------------------------------

/**
 * Resolve the best image URL for a given car.
 * Always resolves – never rejects – so UI logic
 * can render fall‑backs without try/catch noise.
 *
 * @param {Car} car
 * @return {Promise<string>} image URL (may be generated SVG/PNG)
 */
export async function getCarImageUrl(car) {
  const { manufacturer, model, year, body_type } = car || {};

  // 1️⃣  Try CarMD (realistic photo) – placeholder, implement when you have keys.
  // const carMdUrl = await getCarMdUrl(manufacturer, model, year);
  // if (carMdUrl) return carMdUrl;

  // 2️⃣  CarQuery (disabled in browser)
  const cqUrl = await getCarQueryImageUrl(manufacturer, model, year);
  if (cqUrl) return cqUrl;

  // 3️⃣  CarPix – may 404 but quick.
  const cpUrl = getCarPixUrl(manufacturer, model, year);
  if (await urlExists(cpUrl)) return cpUrl;

  // 4️⃣  Fallback – coloured silhouette
  return getFallbackImageUrl(manufacturer, model, body_type, year);
}

//-------------------------------------------------
// Implementation helpers
//-------------------------------------------------

/**
 * CarQuery JSON‑P: disabled on client to avoid CORS/mixed‑content.
 * Return `null` unless we are running server‑side.
 */
async function getCarQueryImageUrl(make, model, year) {
  // keep the original logic if you proxy via /api/carquery
  if (typeof window !== 'undefined') return null; // bail in browsers
  return null;
}

/**
 * Construct CarPix cartoon URL (no auth). Might 404.
 */
function getCarPixUrl(make, model, year) {
  if (!make || !model) return '';
  const m = make.toLowerCase().replace(/\s+/g, '-');
  const md = model.toLowerCase().replace(/\s+/g, '-');
  return `https://carpixs.com/images/illustrations/${m}/${md}/${year}/side-view.png`;
}

/**
 * Generate a brand‑coloured placeholder using via.placeholder.com
 */
function getFallbackImageUrl(make = 'car', model = '', bodyType = 'sedan', year = '') {
  const type = (bodyType || 'sedan').toLowerCase();
  const mapped = {
    sedan: 'Sedan', suv: 'SUV', coupe: 'Coupe', pickup: 'Truck',
    hatchback: 'Hatchback', wagon: 'Wagon', convertible: 'Convertible',
  }[type] || 'Car';
  const color = brandColor(make);
  const label = encodeURIComponent(`${year} ${make} ${model}`.trim() || mapped);
  return `https://via.placeholder.com/400x200/${color}/FFFFFF?text=${label}`;
}

function brandColor(make = '') {
  const colors = {
    bmw: '1C69D4', tesla: 'CC0000', toyota: 'EB0A1E', honda: 'CC0000',
    ford: '0063D1', chevrolet: 'FFB612', dodge: 'BA0C2F', mercedes: '221F1F',
    audi: '000000', volkswagen: '0D57A3', hyundai: '002C5F', kia: 'BB162B',
    nissan: 'C3002F', subaru: '0041AA', mazda: '910A2D',
  };
  return colors[make.toLowerCase().trim()] || '6B63CF';
}

//-------------------------------------------------
// Utilities
//-------------------------------------------------
async function urlExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return res.ok || res.type === 'opaque';
  } catch {
    return false;
  }
}

//-------------------------------------------------
// Optional: safe pre‑loader
//-------------------------------------------------
export function preloadCarImages(cars = []) {
  cars.slice(0, 10).forEach(async (car) => {
    try {
      const url = await getCarImageUrl(car);
      if (url) {
        const img = new Image();
        img.src = url;
      }
    } catch {/* ignore */}
  });
}
