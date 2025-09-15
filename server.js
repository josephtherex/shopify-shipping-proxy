const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// The main endpoint that Shopify will call
app.get('/shipping', async (req, res) => {
  // IMPORTANT: Set this header to allow Shopify to receive the response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const externalId = req.query.id;

  if (!externalId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  console.log(`Received request for external ID: ${externalId}`);

  const targetApiUrl = `https://www.carpartstuning.com/shipping-costs/?id[]=${externalId}&q[]=1&c=DE`;

  try {
    const apiResponse = await fetch(targetApiUrl, { timeout: 8000 });
    
    if (!apiResponse.ok) {
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    console.log(`Successfully fetched data:`, data);
    
    // Send the clean data back to the Shopify theme
    res.status(200).json(data);

  } catch (error) {
    console.error(`Error fetching from external API:`, error.message);
    res.status(500).json({ error: 'Failed to fetch shipping data' });
  }
});

app.listen(PORT, () => {
  console.log(`Shipping proxy server is running on port ${PORT}`);
});