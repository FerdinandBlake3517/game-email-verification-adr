import { signup } from "./signup.js";

const email = process.env.DEMO_EMAIL_TO;
if (!email) throw new Error("Set DEMO_EMAIL_TO before running the demo");
const decision = await signup({ playerId: "demo-player", email, displayName: "Demo player", assetIds: ["starter-skin"] });
console.log(JSON.stringify(decision, null, 2));
