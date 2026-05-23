declare namespace NodeJS {
  interface ProcessEnv {
    UMI_APP_API_URL?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
