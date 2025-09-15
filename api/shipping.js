// This file is now at: /api/shipping.js
const fetch = require('node-fetch');

// This is a Vercel Serverless Function, not a full Express server.
export default async function handler(req, res) {
  // Get the external ID from the query parameters (e.g., /api/shipping?id=12345)
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  console.log(`Received request for external ID: ${id}`);
  const targetApiUrl = `https://www.carpartstuning.com/shipping-costs/?id[]=${id}&q[]=1&c=DE`;

  try {
    const apiResponse = await fetch(targetApiUrl, { timeout: 8000 });
    if (!apiResponse.ok) {
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();
    console.log(`Successfully fetched data:`, data);

    // Vercel automatically handles CORS for you in development, but it's good practice
    // res.setHeader('Access-Control-Allow-Origin', '*'); 
    
    // Send the clean data back to the Shopify theme
    res.status(200).json(data);

  } catch (error) {
    console.error(`Error fetching from external API:`, error.message);
    res.status(500).json({ error: 'Failed to fetch shipping data' });
  }
}