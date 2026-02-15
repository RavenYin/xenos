export interface SecondMeProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  [key: string]: any;
}

export class SecondMeClient {
  private endpoint: string;
  private accessToken: string;

  constructor(accessToken: string, endpoint: string = 'https://api.second.me') {
    this.accessToken = accessToken;
    this.endpoint = endpoint;
  }

  async getProfile(): Promise<SecondMeProfile> {
    const response = await fetch(`${this.endpoint}/api/secondme/user/info`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const result = await response.json();

    // Unwrap SecondMe's standard response format
    if (result.code !== 0 || !result.data) {
      throw new Error(`SecondMe API error: ${result.message || 'Unknown error'}`);
    }

    return result.data as SecondMeProfile;
  }
}