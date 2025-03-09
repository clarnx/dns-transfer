import { withNetlifySDKContext } from "@netlify/sdk/ui/functions";

export default withNetlifySDKContext(async (req, context) => {
    const url = new URL(req.url);
    const siteId = url.searchParams.get('siteId');


    if (!siteId) {
        return Response.json({ error: "Site ID is required" }, { status: 400 });
    }

    try {
        const token = await context?.auth?.providerTokens || "";

        console.log("provider toke", token);

        const requestHeaders = new Headers();
        requestHeaders.append("Authorization", "token");

        console.log(token);

        const requestOptions = {
            method: "GET",
            headers: requestHeaders,
            redirect: "follow"
        };

        const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/dns`, requestOptions);
        console.log(response);
        if (!response.ok) {
            throw new Error('Failed to fetch dns records');
        }

        const data = await response.json();

        // https://api.netlify.com/api/v1/sites/<string>/dns

        // Note: This assumes that the site object includes DNS records.
        // If it doesn&#39;t, we&#39;ll need to find another way to fetch DNS records.
        const dnsRecords = data || [];

        return Response.json({ dnsRecords });

    } catch (error) {
        console.error("Error fetching dns information:", error);
        return Response.json({ error: "Failed to fetch dns information" }, { status: 500 });
    }


    // try {
    //     const site = await context.client.getSite(siteId);


    //     // Note: This assumes that the site object includes DNS records.
    //     // If it doesn&#39;t, we&#39;ll need to find another way to fetch DNS records.
    //     const dnsRecords = site || [];

    //     return Response.json({ dnsRecords });

    // } catch (error) {
    //     console.error("Error fetching site information:", error);
    //     return Response.json({ error: "Failed to fetch site information" }, { status: 500 });
    // }
});