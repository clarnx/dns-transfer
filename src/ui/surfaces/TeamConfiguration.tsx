import {
    Card,
    CardLoader,
    CardTitle,
    Checkbox,
    Form,
    FormField,
    FormFieldSecret,
    TeamConfigurationSurface,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell
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
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Name</TableHeader>
                            <TableHeader>URL</TableHeader>
                            <TableHeader>Created At</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sites.map((site) => (
                            <TableRow key={site.id}>
                                <TableCell>{site.name}</TableCell>
                                <TableCell>{site.url}</TableCell>
                                <TableCell>{new Date(site.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </TeamConfigurationSurface>
    );
};
