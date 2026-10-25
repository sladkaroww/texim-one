// Cloudflare Pages Function:
// GET  /api/trucksbook-activity
// POST /api/trucksbook-activity (multipart CSV upload)

const STORAGE_KEY = 'trucksbook-activity-current';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const TMP_PROFILES = {
    chea7er044: 5605295,
    '[bg] mitaka': 4710545,
    '[bg] niksan': 4492540,
    '[bg] iv4o_56': 4947166,
    skodasolaris: 1910186,
    '[bg] cickaa': 3597382,
    '[bg] metko': 5118236,
    petkovv: 6358471,
    '[bg] slad': 4049929,
    '[bg] marvinito': 2064608,
};

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
        },
    });
}

function normalize(value) {
    return String(value || '')
        .normalize('NFKC')
        .trim()
        .toLocaleLowerCase('en-US')
        .replace(/\s+/g, ' ');
}

function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        const next = text[index + 1];
        if (char === '"' && quoted && next === '"') {
            cell += '"';
            index += 1;
        } else if (char === '"') {
            quoted = !quoted;
        } else if (!quoted && (char === ',' || char === ';' || char === '\t')) {
            row.push(cell);
            cell = '';
        } else if (!quoted && (char === '\n' || char === '\r')) {
            if (char === '\r' && next === '\n') index += 1;
            row.push(cell);
            if (row.some((value) => value.trim() !== '')) rows.push(row);
            row = [];
            cell = '';
        } else {
            cell += char;
        }
    }

    row.push(cell);
    if (row.some((value) => value.trim() !== '')) rows.push(row);
    if (rows.length < 2) throw new Error('The CSV does not contain a header and data row.');

    const headers = rows[0].map((value) => normalize(value.replace(/^\uFEFF/, '')));
    return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim()])));
}

function findColumn(headers, candidates) {
    return candidates.find((candidate) => headers.includes(candidate))
        || headers.find((header) => candidates.some((candidate) => header.includes(candidate)));
}

function parseDate(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;

    const iso = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;

    const european = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (european) return `${european[3]}-${european[2].padStart(2, '0')}-${european[1].padStart(2, '0')}`;

    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function normalizeCargo(value) {
    return normalize(value)
        .replace(/&amp;/g, '&')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim();
}

function parseDistance(value) {
    const match = String(value || '').replace(',', '.').match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : null;
}

function parseTmpDeliveries(html) {
    const deliveries = [];
    const pattern = /<h2[^>]*>\s*<span>\s*([^<]+?)\s*<\/span>[\s\S]*?Delivery ID:\s*<\/strong>\s*([A-Z0-9-]+)[\s\S]*?<strong>\s*([^<]+?)\s*<\/strong>\s*\(([\d,.]+)\s*km\)/gi;
    let match;
    while ((match = pattern.exec(html))) {
        const route = match[3].trim().split(/\s*(?:→|-&gt;|->)\s*/);
        deliveries.push({
            cargo: match[1].trim(),
            deliveryId: match[2].trim(),
            from: route[0] || '',
            to: route[1] || '',
            distanceKm: parseDistance(match[4]),
        });
    }
    return deliveries;
}

async function getTmpDeliveries(userId) {
    const response = await fetch(`https://truckersmp.com/user/${userId}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-GB,en;q=0.9',
            Referer: 'https://truckersmp.com/',
        },
    });
    const html = await response.text();
    if (!response.ok) throw new Error(`TruckersMP profile returned ${response.status}.`);
    const deliveries = parseTmpDeliveries(html);
    if (!deliveries.length) throw new Error('No readable TruckersMP deliveries found.');
    return deliveries;
}

function parseActivity(csvText) {
    const rows = parseCsv(csvText);
    const headers = Object.keys(rows[0]);
    const nameColumn = findColumn(headers, [
        'name', 'driver', 'driver name', 'user', 'username', 'user name', 'nickname', 'player', 'employee',
    ]);
    const dateColumn = findColumn(headers, [
        'date', 'delivery date', 'delivered', 'completed', 'completion date', 'uploaded', 'time',
    ]);
    const cargoColumn = findColumn(headers, ['cargo', 'freight', 'load']);
    const distanceColumn = findColumn(headers, ['accepted distance', 'distance', 'planned distance']);

    if (!nameColumn || !dateColumn || !cargoColumn || !distanceColumn) {
        throw new Error(`Could not identify driver/date columns. Found: ${headers.join(', ')}`);
    }

    const employees = {};
    const deliveriesByEmployee = {};
    let validDeliveries = 0;
    for (const row of rows) {
        const name = row[nameColumn];
        const date = parseDate(row[dateColumn]);
        const cargo = row[cargoColumn];
        const distanceKm = parseDistance(row[distanceColumn]);
        if (!name || !date || !cargo || distanceKm === null) continue;
        validDeliveries += 1;
        const key = normalize(name);
        if (!deliveriesByEmployee[key]) deliveriesByEmployee[key] = [];
        deliveriesByEmployee[key].push({
            cargo: cargo.trim(),
            distanceKm,
            date,
        });
        if (!employees[key] || date > employees[key].lastDeliveryAt) {
            employees[key] = {
                name: name.trim(),
                lastDeliveryAt: date,
                deliveryCount: 1,
            };
        } else {
            employees[key].deliveryCount += 1;
        }
    }

    if (!validDeliveries) throw new Error('No deliveries with a recognizable driver and date were found.');
    return {
        employees,
        deliveriesByEmployee,
        deliveryCount: validDeliveries,
        columns: { name: nameColumn, date: dateColumn, cargo: cargoColumn, distance: distanceColumn },
    };
}

async function matchTmpDeliveries(activity) {
    const results = { ...activity.employees };
    for (const [key, employee] of Object.entries(results)) {
        const tmpUserId = TMP_PROFILES[key];
        if (!tmpUserId) {
            results[key] = { ...employee, active: false, tmpStatus: 'profile_not_configured', matches: [] };
            continue;
        }
        try {
            const tmpDeliveries = await getTmpDeliveries(tmpUserId);
            const csvDeliveries = activity.deliveriesByEmployee[key] || [];
            const matches = tmpDeliveries.filter((tmp) => csvDeliveries.some((csv) =>
                normalizeCargo(csv.cargo) === normalizeCargo(tmp.cargo)
                && csv.distanceKm === tmp.distanceKm
            ));
            results[key] = {
                ...employee,
                active: matches.length > 0,
                tmpUserId,
                tmpStatus: 'checked',
                matches: matches.map((match) => ({
                    deliveryId: match.deliveryId,
                    cargo: match.cargo,
                    distanceKm: match.distanceKm,
                })),
            };
        } catch (error) {
            results[key] = {
                ...employee,
                active: false,
                tmpUserId,
                tmpStatus: 'unavailable',
                tmpError: error?.message || 'TruckersMP profile could not be read.',
                matches: [],
            };
        }
    }
    return results;
}

function authorized(request, env) {
    const expected = String(env.TRUCKSBOOK_IMPORT_TOKEN || '').trim();
    if (!expected) return false;
    const received = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '').trim();
    return received === expected;
}

export async function onRequest(context) {
    const { request, env } = context;
    if (request.method === 'GET') {
        if (!env.TEXIM_CALENDAR) return json({ success: false, message: 'Activity storage is not configured.' }, 500);
        const stored = await env.TEXIM_CALENDAR.get(STORAGE_KEY, { type: 'json' });
        return json({ success: true, data: stored || null });
    }

    if (request.method !== 'POST') return json({ success: false, message: 'Method not allowed.' }, 405);
    if (!authorized(request, env)) return json({ success: false, message: 'Unauthorized.' }, 401);
    if (!env.TEXIM_CALENDAR) return json({ success: false, message: 'Activity storage is not configured.' }, 500);

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_UPLOAD_BYTES) return json({ success: false, message: 'CSV file is too large.' }, 413);

    let form;
    try {
        form = await request.formData();
    } catch {
        return json({ success: false, message: 'Expected a multipart CSV upload.' }, 400);
    }

    const file = form.get('file');
    if (!(file instanceof File)) return json({ success: false, message: 'Choose a CSV file.' }, 400);
    if (file.size > MAX_UPLOAD_BYTES) return json({ success: false, message: 'CSV file is too large.' }, 413);

    try {
        const parsed = parseActivity(await file.text());
        const importedAt = new Date().toISOString();
        const employees = await matchTmpDeliveries(parsed);
        const data = { importedAt, filename: file.name, ...parsed, employees };
        await env.TEXIM_CALENDAR.put(STORAGE_KEY, JSON.stringify(data));
        return json({ success: true, data });
    } catch (error) {
        return json({ success: false, message: error?.message || 'Could not process CSV.' }, 422);
    }
}
