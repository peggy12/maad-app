export async function fetchConversation(conversation_id: string) {
  try {
    const res = await fetch("/functions/getConversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.error || "Unknown error");
    }

    return await res.json();
  } catch (err) {
    console.error("Conversation fetch failed:", err);
    throw err;
  }
}
