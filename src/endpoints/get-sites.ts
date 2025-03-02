import { withNetlifySDKContext } from "@netlify/sdk/ui/functions";

export default withNetlifySDKContext(async (req, context) => {
    const sites = await context.client.getSites();
    return Response.json({ sites });
});