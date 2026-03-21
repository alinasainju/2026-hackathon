// import { NextResponse } from "next/server";
// import Anthropic from "@anthropic-ai/sdk";

// const client = new Anthropic();

// export async function GET() {
//   try {
//     const message = await client.messages.create({
//       model: "claude-sonnet-4-20250514",
//       max_tokens: 64,
//       messages: [{ role: "user", content: "Say hello!" }],
//     });
//     return NextResponse.json({ success: true, response: message.content[0] });
//   } catch (error: any) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }
