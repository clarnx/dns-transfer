import { withNetlifySDKContext } from "@netlify/sdk/ui/functions";

export default withNetlifySDKContext(async (req, context) => {
    try {
        const sites = await context.client.getSites();
        return Response.json({ sites });
    } catch (error) {
        console.error("Error fetching sites:", error);
        return Response.json({ error: "Failed to fetch sites" }, { status: 500 });
    }
});