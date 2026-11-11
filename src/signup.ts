import { z } from "zod";
import { infrai, type EmailResult } from "./infrai.js";

export const SignupBody = z.object({ playerId: z.string().min(1), email: z.string().email(), displayName: z.string().min(1), assetIds: z.array(z.string()).default([]) });
export type PlayerAsset = { id: string; ownerId: string; kind: "skin" | "badge"; state: "pending" | "approved" | "rejected" };
export type LiveEvent = { type: "signup" | "verification_sent"; playerId: string; at: string };
export type ModerationQueueItem = { playerId: string; assetIds: string[]; reason: "new-player-assets" };
export type SignupDecision = { playerId: string; verification: "sent"; messageId: string; moderation: ModerationQueueItem };

export async function signup(raw: unknown, now = new Date().toISOString(), mailer = infrai.email.send): Promise<SignupDecision> {
  const input = SignupBody.parse(raw);
  const token = `${input.playerId}:${input.email}`;
  const result: EmailResult = await mailer({ to: input.email, subject: "Verify your game account", html: `<p>Hi ${input.displayName},</p><p><a href="https://game.example/verify?token=${encodeURIComponent(token)}">Verify your email</a></p>` }, `signup-${input.playerId}`);
  return { playerId: input.playerId, verification: "sent", messageId: result.message_id, moderation: { playerId: input.playerId, assetIds: input.assetIds, reason: "new-player-assets" } };
}
