import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamAnalysis, getAvailableModels } from "@/lib/llm";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized - يرجى تسجيل الدخول" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { prompt, context, model } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    // Check if any LLM is configured
    const models = getAvailableModels();
    if (models.length === 0) {
      return new Response(JSON.stringify({
        error: "لا يوجد مزود LLM مُعد. أضف أحد المتغيرات التالية في Vercel:\n• CUSTOM_LLM_URL + CUSTOM_LLM_API_KEY\n• ANTHROPIC_API_KEY\n• OPENAI_API_KEY"
      }), {
        status: 503, headers: { "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamAnalysis(prompt, context, model)) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Unknown LLM error";
          controller.enqueue(encoder.encode(`\n\n❌ خطأ: ${msg}`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: `فشل التحليل: ${msg}` }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
}
