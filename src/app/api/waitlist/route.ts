import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Waitlist capture. Stubbed until the backend contract (yuvoy-api) lands —
 * validates and echoes success. Error shape matches the platform envelope:
 * { error: { code, message } }.
 */
const schema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_input",
          message: "Enter a valid email address.",
        },
      },
      { status: 400 },
    );
  }

  // TODO(yuvoy-api): forward to POST /v1/waitlist once contract v0 is published.
  return NextResponse.json({ ok: true }, { status: 201 });
}
