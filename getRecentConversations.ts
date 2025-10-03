
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const isAdmin = user.role === "admin";

  const conversations = await base44.asServiceRole.agents.listConversations({
    limit: 50,
    filter: isAdmin ? {} : { owner_id: user.id },
    sort: { created_at: "desc" },
  });

  return new Response(JSON.stringify(conversations), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
