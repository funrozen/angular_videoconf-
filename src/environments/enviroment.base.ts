// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// `.env.ts` is generated by the `npm run env` command
// `npm run env` exposes environment variables as JSON for any usage you might
// want, like displaying the version or getting extra config from your CI bot, etc.
// This is useful for granularity you might need beyond just the environment.
// Note that as usual, any environment variables you expose through it will end up in your
// bundle, and you should not use it for any sensitive information like passwords or keys.
import { env } from './.env';
import { IAppConfig, IEnvironment } from './IEnvironment';

export const appBaseConfig: IAppConfig = {
  baseUrl: '/',
  replaceHistoryPrefix: '/',
  url: 'https://example.com',
  webSocketConnectionString: 'wss://irbisadm.dev/videoconf',
  sendUID: true,
  credentials: {
    userName: '',
    appName: '',
    accountName: '',
    password: '',
  },
};

export const getEnvironmentBase = (appConfig: IAppConfig): IEnvironment => {
  return {
    appConfig,
    production: true,
    hmr: false,
    version: env.npm_package_version,

    defaultLanguage: 'en-US',
    supportedLanguages: ['en-US'],
    reconnectTimes: -1, // negative means infinity,
    logLevel: 'error',
  };
};
