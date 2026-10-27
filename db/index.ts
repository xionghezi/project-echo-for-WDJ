import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Configure your D1 database in wrangler.local.json before deploying."
    );
  }

  return drizzle(env.DB, { schema });
}
