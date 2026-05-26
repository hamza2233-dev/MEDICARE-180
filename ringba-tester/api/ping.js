export default async function handler(req, res) {
    // Enable CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Core Ringba Endpoint ID
        const targetUrl = "https://display.ringba.com/enrich/2861133262468678687";
        
        // Extract incoming data from request
        const incomingData = req.method === 'POST' ? req.body : req.query;

        // Clean up phone number (Remove spaces, dashes, parentheses, and leading +)
        let cleanNumber = incomingData.caller_number ? incomingData.caller_number.replace(/\D/g, '') : '';
        
        // Ensure standard US country code format (Add '1' if it's exactly 10 digits)
        if (cleanNumber.length === 10) {
            cleanNumber = '1' + cleanNumber;
        }

        // Map the payload keys cleanly for Ringba's query expectations
        const cleanPayload = {
            caller_number: cleanNumber,
            first_name: incomingData.first_name || '',
            last_name: incomingData.last_name || '',
            state: incomingData.state || '',
            caller_zip: incomingData.caller_zip || '',
            caller_dob: incomingData.caller_dob || ''
        };

        let ringbaResponse;

        if (req.method === 'POST') {
            // Convert JSON object to standard Form URL Encoded format: key=value&key2=value2
            const formBody = new URLSearchParams(cleanPayload).toString();

            ringbaResponse = await fetch(targetUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded' 
                },
                body: formBody
            });
        } else {
            // If GET request, append parameters directly
            const queryParams = new URLSearchParams(cleanPayload).toString();
            ringbaResponse = await fetch(`${targetUrl}?${queryParams}`, {
                method: 'GET'
            });
        }

        const textResponse = await ringbaResponse.text();
        
        // Send Ringba's response back to the frontend form
        return res.status(ringbaResponse.status).send(textResponse);

    } catch (error) {
        return res.status(500).json({ error: "Proxy Error", message: error.message });
    }
}
