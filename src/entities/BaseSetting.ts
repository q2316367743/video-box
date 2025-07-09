export interface BaseSetting {
  proxy: {
    isEnabled: boolean;
    protocol: 'https' | 'http' | 'socket5';
    host: string;
    port: number;
    username: string;
    password: string;
  }
}

export function defaultBaseSetting(): BaseSetting {
  return {
    proxy: {
      isEnabled: false,
      protocol: 'http',
      host: 'localhost',
      port: 7897,
      username: '',
      password: '',
    }
  }
}