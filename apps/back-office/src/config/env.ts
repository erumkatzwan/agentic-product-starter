/** Settings per environment. Vite's mode picks one: `--mode dev`, `--mode syst` or `--mode prod`. */
const environments = {
  dev: { apiBaseUrl: 'http://localhost:5080' },
  syst: { apiBaseUrl: 'http://localhost:5080' },
  prod: { apiBaseUrl: 'https://api.example.com' },
} as const;

type AppEnv = keyof typeof environments;

const mode = (import.meta.env.MODE in environments ? import.meta.env.MODE : 'dev') as AppEnv;

export const env = {
  appEnv: mode,
  // VITE_API_BASE_URL overrides the URL at build time, for example in a deployment pipeline.
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? environments[mode].apiBaseUrl,
};
