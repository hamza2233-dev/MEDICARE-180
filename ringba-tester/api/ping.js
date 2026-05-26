export default async function handler(req, res) {
    // Add CORS headers so your frontend can communicate with this serverless backend
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle browser pre-flight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const baseUrl = "https://display.ringba.com/enrich/2861133262468678687";
        
        // Grab incoming data from either GET (query) or POST (body)
        const data = req.method === 'POST' ? req.body : req.query;

        // Construct the target Ringba URL with query parameters
        const params = new URLSearchParams(data);
        const targetUrl = `${baseUrl}?${params.toString()}`;

        // Forward the request from Vercel's backend server to Ringba
        const ringbaResponse = await fetch(targetUrl, {
            method: req.method,
            headers: req.method === 'POST' ? { 'Content-Type': 'application/json' } : {},
            body: req.method === 'POST' ? JSON.stringify(data) : undefined
        });

        const textResponse = await ringbaResponse.text();
        
        // Return Ringba's answer back to your frontend
        return res.status(ringbaResponse.status).send(textResponse);

    } catch (error) {
        return res.status(500).json({ error: "Proxy Error", message: error.message });
    }
}
