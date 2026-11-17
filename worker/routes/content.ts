import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getDb } from "../db/client";
import { getSiteData } from "../db/site";
import { getBackground } from "../db/background";
import type { AppEnv } from "../types";

const content = new Hono<AppEnv>();

content.get("/site", async (c) => {
  const data = await getSiteData(getDb(c));
  if (!data) {
    throw new HTTPException(404, { message: "Site profile has not been set up." });
  }
  c.header("Cache-Control", "public, max-age=60");
  return c.json(data);
});

content.get("/background", async (c) => {
  const data = await getBackground(getDb(c));
  c.header("Cache-Control", "public, max-age=60");
  return c.json(data);
});

export default content;