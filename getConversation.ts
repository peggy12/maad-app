import { createClientFromRequest } from "npm:@base44/sdk@0.7.1";

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { conversation_id } = await req.json();

  if (!conversation_id) {
    return new Response(JSON.stringify({ error: "Missing conversation_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await base44.auth.me();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const conversation = await base44.asServiceRole.agents.getConversation(conversation_id);
  if (!conversation) {
    return new Response(JSON.stringify({ error: "Conversation not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const isAdmin = user.role === "admin";
  const isOwner = conversation.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  await base44.asServiceRole.logs.create({
    type: "conversation_access",
    message: `User ${user.id} accessed conversation ${conversation_id}`,
    metadata: { user_id: user.id, conversation_id },
  });

  return new Response(JSON.stringify(conversation), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
