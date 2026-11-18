import { Hono } from "hono";
import adminProfile from "./adminProfile";
import adminProjects from "./adminProjects";
import type { AppEnv } from "../types";

/**
 * Every route mounted here sits below the admin guard in routes/admin.ts,
 * so a signed-in admin session is always required.
 */
const adminProtected = new Hono<AppEnv>();

adminProtected.route("/", adminProfile);
adminProtected.route("/", adminProjects);

export default adminProtected;