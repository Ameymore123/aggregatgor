const { Client } = require('pg');

exports.handler = async (event, context) => {
    // Enable CORS for preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Connect to Neon using environment variables
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: true } // Mandatory secure SSL routing for Neon
    });

    try {
        const { name, website, instagram, whatsapp, stack } = JSON.parse(event.body);

        if (!name || !whatsapp) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Name and WhatsApp number are required.' })
            };
        }

        await client.connect();

        const query = `
            INSERT INTO demo_requests (name, website_link, instagram_handle, whatsapp_number, tech_stack)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        const values = [name, website, instagram, whatsapp, stack];

        await client.query(query, values);

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'Success! Form data logged.' })
        };

    } catch (error) {
        console.error('Database Error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Failed to process request.' })
        };
    } finally {
        await client.end();
    }
};