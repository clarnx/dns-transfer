import {
    Card,
    CardLoader,
    CardTitle,
    Checkbox,
    Form,
    FormField,
    FormFieldSecret,
    Button,
    ButtonGroup,
    TeamConfigurationSurface,
    ProviderAuthCard


} from "@netlify/sdk/ui/react/components";
import { useNetlifySDK, useNetlifyExtensionUIFetch } from "@netlify/sdk/ui/react";
import { trpc } from "../trpc";
import { teamSettingsSchema } from "../../schema/team-configuration";
import logoImg from "../../assets/dns-records-transfer.svg";
import { formatDate } from "../../utils/format.ts";
import noScreenshotSiteImg from "../../assets/blank-site-screenshot.webp";
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

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const fetch = useNetlifyExtensionUIFetch();
    const [allSites, setAllSites] = useState([]);
    const [displayedSites, setDisplayedSites] = useState([]);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const sitesPerPage = 9;


    const fetchSites = async () => {
        try {
            const response = await fetch("/.netlify/functions/get-sites");
            if (!response.ok) {
                throw new Error('Failed to fetch sites');
            }
            const data = await response.json();
            console.log("data", data);
            setAllSites(data.sites);
        } catch (error) {
            console.error("Error fetching sites:", error);
        }
    };

    const fetchDnsRecords = async (siteId: string) => {
        try {
            const response = await fetch(`/.netlify/functions/get-dns-records?siteId=${siteId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch sites');
            }
            const data = await response.json();
            console.log("dns response data", data?.dnsRecords);
        } catch (error) {
            console.error("Error fetching sites:", error);
        }
    };


    useEffect(() => {
        fetchSites();
    }, []);


    useEffect(() => {
        const filteredSites = allSites.filter(site =>
            site?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const startIndex = (page - 1) * sitesPerPage;
        setDisplayedSites(filteredSites.slice(startIndex, startIndex + sitesPerPage));
    }, [allSites, page, searchTerm]);


    const handleSearch = (event: any) => {

        setSearchTerm(event?.search);
        setPage(1);

    };

    const handleAuthSuccess = () => {
        setIsAuthenticated(true);
    };


    const totalPages = Math.ceil(allSites.filter(site =>
        site?.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).length / sitesPerPage);

    if (teamSettingsQuery.isLoading && allSites === 0) {
        return <CardLoader />;
    }

    console.log(allSites[0]);
    return (
        <TeamConfigurationSurface>

            <ProviderAuthCard />
            {isAuthenticated ? (
                <p>is logged in</p>
            ) : (
                <p>Please authenticate to view site listings.</p>
            )}

            <Card>
                <img src={logoImg} width="128" height="auto" />
                <br />
                <br />
                <CardTitle>{sdk.extension.name}</CardTitle>
                <br />
                <br />
                <Form onSubmit={handleSearch} submitButtonLabel="Search">
                    <FormField name="search" label="Search sites">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e?.target?.value)}
                            placeholder="Enter site name"
                        />
                    </FormField>
                </Form>
                {allSites.length === 0 ? <CardLoader /> :
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4"> {(displayedSites.length > 0) && displayedSites.map((site) => (
                        <Card className="tw-p-4" key={site.id}>
                            <div className="tw-w-full tw-h-full tw-mb-6">
                                <a className="hover:tw-no-underline" href={site?.url} target="_blank">
                                    <picture className="tw-w-full tw-m-0 tw-p-0">
                                        <img className="tw-rounded-sm tw-w-full tw-m-0 tw-p-0" src={`${site?.screenshot_url || noScreenshotSiteImg}`} alt={site.name} loading="lazy" />
                                    </picture>
                                </a>
                            </div>
                            <h3 className="fit-content tw-flex tw-items-center tw-text-base">
                                <a className="hover:tw-no-underline" href={site?.admin_url} target="_blank">{site.name}</a>
                            </h3>
                            <p className="meta">Created on {formatDate(new Date(site?.created_at))}</p>

                            <div className="tw-mt-5 tw-block tw-w-full">
                                <Button variant="pop" className="tw-w-full" onClick={() => fetchDnsRecords(site?.id)}>
                                    Download DNS Records
                                </Button>
                            </div>
                        </Card>
                    ))}</div>}


                <br />
                <br />

                {totalPages > 1 && <ButtonGroup>
                    <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={allSites.length === 0 || page === 1}>
                        Previous
                    </Button>

                    <p className="meta">{`Page ${page} of ${totalPages}`}</p>

                    <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={allSites.length === 0 || page === totalPages}>
                        Next
                    </Button>

                </ButtonGroup>
                }

            </Card>
        </TeamConfigurationSurface>
    );
};
