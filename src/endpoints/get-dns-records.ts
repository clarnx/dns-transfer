import { withNetlifySDKContext } from "@netlify/sdk/ui/functions";

export default withNetlifySDKContext(async (req, context) => {
    const url = new URL(req.url);
    const siteId = url.searchParams.get('siteId');


    if (!siteId) {
        return Response.json({ error: "Site ID is required" }, { status: 400 });
    }

    try {
        // const token = await context?.auth?.providerTokens || "";
        const token = process.env.NF_AUTH_TOKEN

        const requestHeaders = new Headers();
        requestHeaders.append("Authorization", `Bearer ${token}`);

        const requestOptions = {
            method: "GET",
            headers: requestHeaders,
            redirect: "follow"
        };

        const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/dns`, requestOptions);
        
        if (!response.ok) {
            throw new Error('Failed to fetch dns records');
        }

        const data = await response.json();

        // https://api.netlify.com/api/v1/sites/<string>/dns

        // Note: This assumes that the site object includes DNS records.
        // If it doesn&#39;t, we&#39;ll need to find another way to fetch DNS records.

        const dnsData = data || [];

        // return Response.json({ dnsData });

         // Define your custom headers
        const customHeaders = ["Name", "Type", "Value"];

        const domainName = dnsData[0]?.name;
        const records = dnsData[0]?.records;
  // Map the data to match your custom headers
  const mappedRecords = records.map((record: any) => ({
    "Name": record.hostname,
    "Type": record.type,
    "Value": record.value
  }));

  // Create CSV content with custom headers
  const csvRows = [customHeaders.join(',')];

  for (const record of mappedRecords) {
    const values = customHeaders.map(header => {
      const value = record[header];
      // Handle values that contain commas, quotes, etc.
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');

  // Return CSV with appropriate headers
  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${domainName}_dns-records.csv"`,
      
    }})

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