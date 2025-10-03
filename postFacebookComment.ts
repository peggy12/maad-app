/**
 * Posts a comment to a Facebook post
 * @param postId The ID of the Facebook post
 * @param message The comment message to post
 * @param accessToken Facebook access token
 * @returns The comment ID if successful, null otherwise
 */
export async function postFacebookComment(
  postId: string, 
  message: string, 
  accessToken: string
): Promise<string | null> {
  try {
    const url = `https://graph.facebook.com/v20.0/${postId}/comments`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook Comment API error:', errorData);
      return null;
    }

    const data = await response.json();
    return data.id || null;
  } catch (error) {
    console.error('Error posting Facebook comment:', error);
    return null;
  }
}