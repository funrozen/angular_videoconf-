import { IAppCredentials } from '@app/interfaces/IAppCredentials';
import { IDebugLevels } from '@app/IDebugLevels';

export interface IAppConfig {
  baseUrl: string;
  replaceHistoryPrefix: string;
  url: string;
  sendUID: boolean;
  credentials: IAppCredentials;
  webSocketConnectionString: string;
}

export interface IEnvironment {
  production: boolean;
  // hot module replacement
  hmr: boolean;
  version: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  appConfig: IAppConfig;

  // negative means infinity
  reconnectTimes: number;
  logLevel: keyof IDebugLevels;
}
