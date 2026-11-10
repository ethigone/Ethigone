declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    ETHIGONE_ADMIN_BOOTSTRAP_EMAIL?: string;
    BUCKET?: R2Bucket;
  }
}
