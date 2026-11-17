/** Cloudflare bindings available to the Worker. D1 and R2 are added in later batches. */
export interface Bindings {
  ENVIRONMENT?: string;
}

export type AppEnv = { Bindings: Bindings };