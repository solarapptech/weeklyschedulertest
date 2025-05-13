// This file would be used in a real server environment
// For this example, we're using window.api.getOnlineProducts() instead

import { products } from "../../data/products"
import { cardData } from "../../data/cardData"

/**
 * API endpoint to get all online products
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get all offers
    const allOffers = getAllOffers()

    // Filter to only online offers
    const onlineOffers = allOffers.filter((offer) => {
      return isOfferOnline(offer.startTime, offer.endTime)
    })

    // Enhance the offers with product details
    const enhancedOffers = onlineOffers.map((offer) => {
      // Find the product details
      let productDetails = null
      if (offer.productId) {
        const product = products.find((p) => p.id === offer.productId)
        const card = cardData.find((c) => c.id === offer.productId)

        if (product) {
          productDetails = {
            id: product.id,
            name: product.name,
            cardAttributes: offer.cardAttributes || {},
            image: card?.image || null,
            permalink: card?.permalink || null,
          }
        }
      }

      return {
        id: offer.id,
        title: offer.title,
        date: offer.date,
        startTime: offer.startTime,
        endTime: offer.endTime,
        color: offer.color,
        product: productDetails,
        isOnline: true, // By definition, all offers returned are online
      }
    })

    // Return the response
    return res.status(200).json({
      count: enhancedOffers.length,
      offers: enhancedOffers,
    })
  } catch (error) {
    console.error("Error fetching online products:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Helper functions
function getAllOffers() {
  // This would fetch from a database in a real environment
  const offersJson = localStorage.getItem("weekly-offers")
  return offersJson ? JSON.parse(offersJson) : []
}

function isOfferOnline(startTime, endTime) {
  // Get current UTC time
  const now = new Date()
  const currentHours = now.getUTCHours()
  const currentMinutes = now.getUTCMinutes()

  // Parse start and end times
  const [startHours, startMinutes] = startTime.split(":").map(Number)
  const [endHours, endMinutes] = endTime.split(":").map(Number)

  // Convert to minutes for easier comparison
  const currentTimeInMinutes = currentHours * 60 + currentMinutes
  const startTimeInMinutes = startHours * 60 + startMinutes
  const endTimeInMinutes = endHours * 60 + endMinutes

  // Check if current time is between start and end times
  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes
}
