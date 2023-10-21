declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      DATABASE_URL: string | undefined;
      ACCESS_TOKEN_KEY: string | undefined;
      REFRESH_TOKEN_KEY: string | undefined;
      PORT: number | undefined;
    }
  }
}

export {};
