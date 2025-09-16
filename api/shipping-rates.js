const fetch = require('node-fetch');

// This is the official Shopify Carrier Service API endpoint.
export default async function handler(req, res) {
  // Security check: Only allow POST requests from Shopify.
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method Not Allowed' });
  }

  try {
    const shopifyRequest = req.body;
    let totalShippingCost = 0.0;
    let currency = 'EUR'; // Default currency

    // Loop through every item Shopify sent from the cart.
    for (const item of shopifyRequest.rate.items) {
      // IMPORTANT: This is a simplified lookup. A real app would make a Shopify API
      // call here to get the metafield for each item.variant_id.
      // For now, we will assume all items have a fixed shipping cost for this test.
      // You must replace this with your own logic to map Shopify products to external IDs.
      const externalId = '6003307'; // TODO: This needs to be dynamic.

      const targetApiUrl = `https://www.carpartstuning.com/shipping-costs/?id[]=${externalId}&q[]=1&c=DE`;
      const apiResponse = await fetch(targetApiUrl);
      const data = await apiResponse.json();

      if (data && data.cost) {
        // Add the cost of this item to the total.
        totalShippingCost += parseFloat(data.cost) * item.quantity;
        currency = data.currency; // Use the currency from the API
      }
    }

    // Shopify requires the price in cents (e.g., 11.30 becomes 1130).
    const priceInCents = Math.round(totalShippingCost * 100);

    // This is the special JSON format that Shopify's checkout requires.
    const responsePayload = {
      rates: [
        {
          service_name: 'Bulky Item Shipping', // The name the customer sees
          service_code: 'BULKY',
          total_price: priceInCents, // Price in cents
          currency: currency,
          description: 'Calculated shipping for your specific items.'
        }
      ]
    };
    
    console.log('Sending rates to Shopify:', JSON.stringify(responsePayload));
    res.status(200).json(responsePayload);

  } catch (error) {
    console.error('Error in Carrier Service API:', error);
    // If anything fails, return an empty array so the checkout doesn't break.
    res.status(200).json({ rates: [] });
  }
}