import {
    Card,
    CardLoader,
    CardTitle,
    Checkbox,
    Form,
    FormField,
    FormFieldSecret,
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


    useEffect(() => {
        const fetchSites = async () => {
            try {
                const response = await fetch("/.netlify/functions/get-sites");
                if (!response.ok) {
                    throw new Error('Failed to fetch sites');
                }
                const data = await response.json();
                setSites(data.sites);
            } catch (error) {
                console.error("Error fetching sites:", error);
            }
        };


        fetchSites();

    }, [fetch]);

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
                {sites.map((site) => (
                    <Card key={site.id}>
                        <CardTitle>{site.name}</CardTitle>
                        <p>URL: {site.url}</p>
                        <p>Created At: {new Date(site.created_at).toLocaleDateString()}</p>
                    </Card>
                ))}
            </Card>
        </TeamConfigurationSurface>
    );
};
