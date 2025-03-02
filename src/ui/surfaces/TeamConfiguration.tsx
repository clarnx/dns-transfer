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
    const [allSites, setAllSites] = useState([]);
    const [displayedSites, setDisplayedSites] = useState([]);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const sitesPerPage = 10;


    const fetchSites = async () => {
        try {
            const response = await fetch("/.netlify/functions/get-sites");
            if (!response.ok) {
                throw new Error('Failed to fetch sites');
            }
            const data = await response.json();
            setAllSites(data.sites);
        } catch (error) {
            console.error("Error fetching sites:", error);
        }
    };


    useEffect(() => {
        fetchSites();
    }, [fetch]);


    useEffect(() => {
        const filteredSites = allSites.filter(site =>
            site.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const startIndex = (page - 1) * sitesPerPage;
        setDisplayedSites(filteredSites.slice(startIndex, startIndex + sitesPerPage));
    }, [allSites, page, searchTerm]);


    const handleSearch = (event) => {
        event.preventDefault();
        setSearchTerm(event.target.search.value);
        setPage(1);
    };


    const totalPages = Math.ceil(allSites.length / sitesPerPage);

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
                            defaultValue={searchTerm}
                            placeholder="Enter site name"
                        />
                    </FormField>
                    <Button type="submit">Search</Button>
                </Form>

                {displayedSites.map((site) => (
                    <Card key={site.id}>
                        <CardTitle>{site.name}</CardTitle>
                        <p>URL: {site.url}</p>
                        <p>Created At: {new Date(site.created_at).toLocaleDateString()}</p>
                    </Card>
                ))}

                <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    Previous
                </Button>
                <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Next
                </Button>
            </Card>
        </TeamConfigurationSurface>
    );
};
