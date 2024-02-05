// utils.ts
export function isValidToken(token: string): boolean {
    // Implement your token validation logic here
    // For example, you could check if the token is equal to a predefined valid token
    const validToken = process.env.VALID_TOKEN || 'your_default_valid_token';
    return token === validToken;
  }
  