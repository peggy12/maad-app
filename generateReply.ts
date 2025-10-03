export async function generateReply(base44, agentName: string, postMessage: string): Promise<string> {
  const prompt = `You're replying on behalf of MAAD, a local clearance and handyman service in Fife. Analyze this Facebook post and generate a helpful, professional reply if it's a genuine job lead. Keep it friendly, clear, and confident. If it's not a real job request, respond with "IGNORE". Post: "${postMessage}"`;

  const agentResponse = await base44.asServiceRole.agents.invoke(agentName, prompt);
  return agentResponse.output;
}