import { Hono } from "hono";
import { getDb } from "../db/client";
import { listPublishedProjects } from "../db/projects";
import type { ProjectsResponse } from "../../shared/api";
import type { AppEnv } from "../types";

const projects = new Hono<AppEnv>();

projects.get("/", async (c) => {
  const db = getDb(c);
  const body: ProjectsResponse = { projects: await listPublishedProjects(db) };
  c.header("Cache-Control", "public, max-age=60");
  return c.json(body);
});

export default projects;