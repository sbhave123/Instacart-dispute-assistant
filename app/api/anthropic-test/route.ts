import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 15;

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Log a short prefix in the server console so you can confirm which key is being used
  console.log(
    "ANTHROPIC_API_KEY prefix (test route):",
    apiKey ? apiKey.slice(0, 12) : "undefined"
  );

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "ANTHROPIC_API_KEY is not set on the server",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const resp = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 5,
      messages: [{ role: "user", content: "ping" }],
    });

    return new Response(
      JSON.stringify({
        ok: true,
        model: resp.model,
        type: resp.type,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Anthropic test route error:", err);

    return new Response(
      JSON.stringify({
        ok: false,
        error:
          err instanceof Error ? err.message : "Unknown error from Anthropic",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

