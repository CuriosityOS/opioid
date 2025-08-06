export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response('Missing text content', { status: 400 });
    }

    const systemPrompt = `You are a medical assessment AI analyzing text for potential opioid addiction risk factors. 

You MUST respond ONLY with a valid JSON object. No text before or after the JSON.

Analyze the provided text and return a JSON response with this EXACT structure:
{
  "riskScore": <number between 0-100>,
  "summary": "<one sentence summary of the overall assessment>",
  "riskFactors": ["<risk factor 1>", "<risk factor 2>", ...],
  "protectiveFactors": ["<protective factor 1>", "<protective factor 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "confidence": "<Low|Medium|High>",
  "warning": "This is NOT a medical diagnosis. This analysis is for educational purposes only. Always consult qualified healthcare professionals for medical advice."
}

Guidelines:
- riskScore: 0-30 (low), 31-60 (moderate), 61-100 (high)
- Be evidence-based and cautious in assessment
- List specific, clear risk factors found in the text
- Include protective factors that may reduce risk
- Provide actionable recommendations
- Set confidence based on clarity and completeness of information
- Keep each array item concise (one sentence max)`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
        'X-Title': 'StopOpioids',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze the following medical information and respond with ONLY a JSON object:\n\n${text}` },
        ],
        stream: false,
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    try {
      // Clean the content - remove markdown code blocks if present
      let cleanContent = content.trim();
      
      // Remove ```json or ``` markers if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.substring(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.substring(3);
      }
      
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.substring(0, cleanContent.length - 3);
      }
      
      cleanContent = cleanContent.trim();
      
      // Parse the JSON response from the AI
      const assessmentData = JSON.parse(cleanContent);
      
      // Validate the structure
      if (typeof assessmentData.riskScore !== 'number' || !assessmentData.summary) {
        throw new Error('Invalid response structure');
      }
      
      // Ensure arrays exist
      assessmentData.riskFactors = assessmentData.riskFactors || [];
      assessmentData.protectiveFactors = assessmentData.protectiveFactors || [];
      assessmentData.recommendations = assessmentData.recommendations || [];
      assessmentData.confidence = assessmentData.confidence || 'Medium';
      assessmentData.warning = assessmentData.warning || 'This is NOT a medical diagnosis. This analysis is for educational purposes only.';
      
      return new Response(JSON.stringify(assessmentData), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw content (first 500 chars):', content.substring(0, 500));
      
      // Fallback response if parsing fails
      return new Response(JSON.stringify({
        riskScore: 0,
        summary: 'Unable to properly analyze the provided information.',
        riskFactors: [],
        protectiveFactors: [],
        recommendations: ['Please provide clearer medical information for analysis.'],
        confidence: 'Low',
        warning: 'This is NOT a medical diagnosis. This analysis is for educational purposes only.',
      }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

  } catch (error) {
    console.error('Error in /api/assess:', error);
    return new Response('An internal server error occurred. Please try again later.', { status: 500 });
  }
}