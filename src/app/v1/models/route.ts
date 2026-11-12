import { NextResponse } from "next/server";

export async function GET() {
  const models = [
    { id: "anthropic/claude-3.5-sonnet", object: "model", owned_by: "anthropic" },
    { id: "openai/gpt-4o", object: "model", owned_by: "openai" },
    { id: "openai/gpt-4o-mini", object: "model", owned_by: "openai" },
    { id: "deepseek/deepseek-chat", object: "model", owned_by: "deepseek" },
    { id: "deepseek/deepseek-r1", object: "model", owned_by: "deepseek" },
    { id: "google/gemini-2.0-flash-exp", object: "model", owned_by: "google" },
  ];

  return NextResponse.json({
    object: "list",
    data: models,
  });
}
