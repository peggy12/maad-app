export async function postFacebookComment(postId: string, message: string, accessToken: string): Promise<string | null> {
  const url = `https://graph.facebook.com/v20.0/${postId}/comments`;
  const body = new URLSearchParams({ message, access_token: accessToken });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Facebook API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.warn(`Attempt ${attempt} failed for post ${postId}:`, error);
      await new Promise(res => setTimeout(res, 1000 * attempt)); // Exponential backoff
    }
  }

  return null;
}