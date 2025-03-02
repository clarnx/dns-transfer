import {
    Card,
    CardLoader,
    CardTitle,
    Checkbox,
    Form,
    FormField,
    FormFieldSecret,
    Button,
    TeamConfigurationSurface


} from "@netlify/sdk/ui/react/components";
import { useNetlifySDK, useNetlifyExtensionUIFetch } from "@netlify/sdk/ui/react";
import { trpc } from "../trpc";
import { teamSettingsSchema } from "../../schema/team-configuration";
import logoImg from "../../assets/dns-records-transfer.svg";
import { useEffect, useState } from "react";

export const TeamConfiguration = () => {
    const sdk = useNetlifySDK();
    const trpcUtils = trpc.useUtils();
    const teamSettingsQuery = trpc.teamSettings.query.useQuery();
    const teamSettingsMutation = trpc.teamSettings.mutate.useMutation({
        onSuccess: async () => {
            await trpcUtils.teamSettings.query.invalidate();
        },
    });

    const fetch = useNetlifyExtensionUIFetch();
    const [sites, setSites] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");


    const fetchSites = async (pageNum: number, search = "") => {
        try {
            const response = await fetch(`/.netlify/functions/get-sites?page=${pageNum}&amp;search=${search}`);
            if (!response.ok) {
                throw new Error('Failed to fetch sites');
            }
            const data = await response.json();
            setSites(data);
            setHasNextPage(data.length === 10); // Assuming 10 items per page
        } catch (error) {
            console.error("Error fetching sites:", error);
        }
    };


    useEffect(() => {
        fetchSites(page, searchTerm);
    }, [fetch, page, searchTerm]);


    const handleSearch = (event) => {
        event.preventDefault();
        setPage(1);
        fetchSites(1, searchTerm);
    };

    if (teamSettingsQuery.isLoading) {
        return <CardLoader />;
    }

    return (
        <TeamConfigurationSurface>
            <Card>
                <img src={logoImg} width="128" height="auto" />
                <br />
                <br />
                <CardTitle>{sdk.extension.name}</CardTitle>

                <Form onSubmit={handleSearch}>
                    <FormField name="search" label="Search sites">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Enter site name"
                        />
                    </FormField>
                    <Button type="submit">Search</Button>
                </Form>

                {sites.map((site) => (
                    <Card key={site.id}>
                        <CardTitle>{site.name}</CardTitle>
                        <p>URL: {site.url}</p>
                        <p>Created At: {new Date(site.created_at).toLocaleDateString()}</p>
                    </Card>
                ))}

                <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    Previous
                </Button>
                <Button onClick={() => setPage(p => p + 1)} disabled={!hasNextPage}>
                    Next
                </Button>
            </Card>
        </TeamConfigurationSurface>
    );
};
