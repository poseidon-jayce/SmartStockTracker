import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here' });

/**
 * Predicts inventory demand based on historical sales data
 */
export async function predictDemand(
  productId: number,
  productName: string,
  historicalData: { date: string; quantity: number }[],
  period: '30days' | '60days' | '90days'
): Promise<{ predictedDemand: number; confidence: number }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an AI inventory prediction expert. Analyze the provided sales data and predict future demand. " +
            "Respond with a JSON object containing the predicted demand (whole number) and confidence score (between 0 and 1)."
        },
        {
          role: "user",
          content: `
            Product ID: ${productId}
            Product Name: ${productName}
            Prediction Period: ${period}
            
            Historical Sales Data (date and quantity sold):
            ${JSON.stringify(historicalData)}
            
            Please analyze this data and predict the total demand for the next ${period.replace('days', ' days')}. 
            Consider any trends, seasonality, or patterns in the data.
            Return only a JSON object with keys: predictedDemand (integer) and confidence (number between 0-1).
          `
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      predictedDemand: Math.max(0, Math.round(result.predictedDemand)),
      confidence: Math.max(0, Math.min(1, result.confidence))
    };
  } catch (error) {
    console.error("Error predicting demand:", error);
    // Fallback prediction when API fails
    return {
      predictedDemand: Math.round(
        historicalData.reduce((sum, item) => sum + item.quantity, 0) / 
        Math.max(1, historicalData.length) * 
        (period === '30days' ? 1 : period === '60days' ? 2 : 3)
      ),
      confidence: 0.5
    };
  }
}

/**
 * Analyzes inventory to provide recommendations
 */
export async function analyzeInventory(
  products: Array<{
    id: number;
    name: string;
    sku: string;
    currentStock: number;
    reorderPoint: number;
    historicalDemand: number;
    category: string;
  }>,
  limit: number = 5
): Promise<Array<{
  productId: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI inventory management assistant. Analyze the provided inventory data and provide actionable recommendations. " +
            "Focus on items that need attention based on stock levels, reorder points, and historical demand. " +
            "Return a JSON array of recommendations, sorted by priority."
        },
        {
          role: "user",
          content: `
            Analyze these products and provide the top ${limit} recommendations:
            ${JSON.stringify(products)}
            
            Return only a JSON array where each object has:
            - productId: The ID of the product
            - recommendation: A short actionable recommendation (e.g., "Order 20 units", "Consider discontinuing")
            - priority: Either "high", "medium", or "low"
            - reason: A brief explanation for the recommendation
            
            Sort by priority (high first) and focus on items needing immediate attention.
          `
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    if (Array.isArray(result.recommendations)) {
      return result.recommendations;
    } else if (Array.isArray(result)) {
      return result;
    } else {
      throw new Error("Unexpected response format from OpenAI");
    }
  } catch (error) {
    console.error("Error analyzing inventory:", error);
    
    // Fallback recommendations when API fails
    return products
      .filter(p => p.currentStock < p.reorderPoint)
      .slice(0, limit)
      .map(p => ({
        productId: p.id,
        recommendation: `Order ${Math.max(1, p.reorderPoint - p.currentStock)} units`,
        priority: p.currentStock < p.reorderPoint * 0.5 ? 'high' : 'medium',
        reason: `Current stock (${p.currentStock}) is below reorder point (${p.reorderPoint})`
      }));
  }
}
