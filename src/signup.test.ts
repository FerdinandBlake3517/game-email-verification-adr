import { signup } from "./signup.js";

const calls: unknown[] = [];
const result = await signup({ playerId: "p-7", email: "player@example.com", displayName: "Mina", assetIds: ["skin-1"] }, "2026-01-01T00:00:00Z", async (payload) => { calls.push(payload); return { message_id: "msg-7" }; });
if (result.verification !== "sent" || result.messageId !== "msg-7" || result.moderation.assetIds[0] !== "skin-1" || calls.length !== 1) throw new Error("signup decision mismatch");
console.log("signup decision test passed");
