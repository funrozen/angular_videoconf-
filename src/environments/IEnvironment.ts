import { IAppCredentials } from '@app/interfaces/IAppCredentials';

export interface IAppConfig {
  baseUrl: string;
  replaceHistoryPrefix: string;
  url: string;
  getServiceIdFromUrl: (url: Location) => string;
  sendUID: boolean;
  credentials: IAppCredentials;
}

export interface IEnvironment {
  production: boolean;
  // hot module replacement
  hmr: boolean;
  version: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  appConfig: IAppConfig;
  serverUrl: string;
  // negative means infinity
  reconnectTimes: number;
}
