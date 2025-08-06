export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response('Missing text content', { status: 400 });
    }

    const systemPrompt = `You are a medical assessment AI analyzing text for potential opioid addiction risk factors. 

IMPORTANT DISCLAIMER: This is NOT medical advice or a diagnosis. This is an educational tool only.

Instructions:
1. Start EVERY response with: "⚠️ DISCLAIMER: This is NOT a medical diagnosis. This analysis is for educational purposes only. Always consult qualified healthcare professionals for medical advice."
2. Analyze the provided text objectively for potential risk factors
3. Be cautious and evidence-based in your assessment
4. Focus on identifying documented risk patterns and indicators
5. Provide clear reasoning for your assessment
6. End with a recommendation to seek professional medical consultation

Structure your response as follows:
- Disclaimer (as above)
- Summary of Analysis
- Identified Risk Factors (if any)
- Protective Factors (if any)
- Overall Assessment
- Professional Consultation Recommendation`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
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
                { role: 'user', content: `Please analyze the following medical information for potential opioid addiction risk indicators:\n\n${text}` },
              ],
              stream: true,
              max_tokens: 2000,
              temperature: 0.3,
            }),
          });

          if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error in /api/assess:', error);
    return new Response('An internal server error occurred. Please try again later.', { status: 500 });
  }
}