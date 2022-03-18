import Breadcrumbs from "@civicplus/preamble/lib/Breadcrumbs";
import Grid from "@civicplus/preamble/lib/Grid";
import Link from "@civicplus/preamble/lib/Link";
import Button from "@civicplus/preamble/lib/Button";
import Menu from "@civicplus/preamble/lib/Menu";
import Titlebar from "@civicplus/preamble/lib/Titlebar";
import Typography from "@civicplus/preamble/lib/Typography";
import AdvancedTableWrapper from "@civicplus/preamble/lib/AdvancedTable/AdvancedTableWrapper";
import { RowStatus, TableData, TableState } from "@civicplus/preamble/lib/AdvancedTable/AdvancedTableWrapperConstants";
import React, { FunctionComponent, useState, useEffect, useRef, ReactElement } from "react";
import { RouteComponentProps } from "react-router";
import { bottle } from "../../provider/bottle";
import { useSnackbar } from "notistack";
import Dialog from "@civicplus/preamble/lib/Dialog";
import { OrganizationUser } from "../../services/organizationUsersService";
import { Organization } from "../../services/organizationService";
import IconCircleCheck from "@civicplus/preamble/lib/Icons/IconCircleCheck";
import Tooltip from "@civicplus/preamble/lib/Tooltip";
import Toggle from "@civicplus/preamble/lib/Toggle";
import { ODataQuery } from "@civicplus/preamble/entities/odataQuery";
import { Link as RouterLink } from "react-router-dom";
import Table from "@civicplus/preamble/lib/Table";
import TextInput from "@civicplus/preamble/lib/TextInput";
import SearchInput from "@civicplus/preamble/lib/SearchInput";
import ItemMeta from "@civicplus/preamble/lib/ItemMeta";
import { groups } from "./dummyData";
import { Group } from "./types";
import { makeStyles, Paper } from "@material-ui/core";

/*
export const EditUsers: FunctionComponent<RouteComponentProps> = (props) => {
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const refContainer: any = useRef<AdvancedTableWrapper | null>(null);
    const [currentUser, setCurrentUser] = useState<OrganizationUser>();
    const [rowIndex, setRowIdex] = useState<number>();
    const [organizationName, setOrganizationName] = useState<Organization>();

    const organizationUsersService = bottle.container.OrganizationUsersService;
    const currentIdentity = bottle.container.CurrentIdentity;
    const currentOrganization = bottle.container.CurrentOrganizationService;
    const currentUrl = `${window.location.pathname}`;
    const isSuperUser = currentIdentity?.user?.profile?.role?.includes("superuser") === true;
    const canView = (isSuperUser || currentOrganization?.isOrgOwner) === true;
    const isOrgOwner = currentOrganization?.isOrgOwner;

    useEffect(() => {
        if (!canView) {
            props.history.push(`/403`);
        }
        setLoading(false);
        const tableRef = refContainer && (refContainer.current as AdvancedTableWrapper);
        tableRef.loadRows();
    }, [currentOrganization, canView, props.history]);

    const handleDelete = async (item: OrganizationUser, index: number): Promise<any> => {
        await organizationUsersService.deleteOrganizationUser(item.userId);
        const tableRef = refContainer && (refContainer.current as AdvancedTableWrapper);
        tableRef.deleteRow(+index);
        setShowDeleteModal(false);
        enqueueSnackbar(`${item.user.email} has been removed`, {
            variant: "success",
        });
    };

    const buildActions = (item: OrganizationUser, index: number): any => {
        const results = [];
        if (currentIdentity?.user?.profile?.sub !== item.userId) {
            results.push({
                display: "Remove",

                action: async () => {
                    setShowDeleteModal(true);
                    setRowIdex(index);
                    setCurrentUser(item);
                },
            });
        }
        return results;
    };

    const mapData = (item: OrganizationUser, index: number): (string | JSX.Element)[] => {
        const res = [
            item.user.firstName,
            item.user.lastName,
            item.user.email,
            item.user.isValidated ? <IconCircleCheck /> : "",
            <Tooltip
                key={`Tooltip-${item.userId}`}
                title={item.organizationOwner ? "Remove owner permission" : "Add owner permission"}
            >
                <span>
                    <Toggle
                        key={`Toggle-${item.userId}`}
                        disabled={currentIdentity?.user?.profile?.sub === item.userId}
                        stopPropagation={true}
                        id={`statusToggle-${index}`}
                        checked={item.organizationOwner}
                        onChange={async (event: any): Promise<any> => {
                            await onChange(event, item, index);
                        }}
                    />
                </span>
            </Tooltip>,
            <Menu id={`actions-${item.userId}`} key="actions-1" type="action" items={buildActions(item, index)} />,
        ];
        return res;
    };

    const getRows = async (state: TableState): Promise<TableData> => {
        if (loading) {
            return { count: 0, data: [], status: RowStatus.Loading };
        }
        const oData: ODataQuery = {
            skip: state.page * state.rowsPerPage,
            top: state.rowsPerPage,
            orderBy:
                state.sortColumn !== "organizationOwner"
                    ? "user/" + state.sortColumn || "user/lastName"
                    : state.sortColumn,
            orderByDirection: state.sortDirection || "desc",
            search: state.search,
            filter: {},
        };
        const organizationUsers = await organizationUsersService.getOrganizationUsers(oData);
        const data = organizationUsers.items.map((item: OrganizationUser, index: number) => mapData(item, index));
        setLoading(false);
        return { data: data, count: organizationUsers.count };
    };

    function buildTitle(): ReactElement<any, any> {
        const getOrg = async (): Promise<any> => {
            const organizationName = await currentOrganization.name;
            setOrganizationName(organizationName);
        };
        getOrg();

        return (
            <Grid container={true} spacing={1}>
                <Breadcrumbs>
                    <div>Home</div>
                    {
                        // @ts-ignore
                        <Link key="Users" component={RouterLink} to={currentUrl} block={false}>
                            Users
                        </Link>
                    }
                </Breadcrumbs>
                <Titlebar
                    id="users-titlebar"
                    title={`${organizationName} Users`}
                    buttons={
                        isSuperUser || isOrgOwner
                            ? [
                                  <Button
                                      // @ts-ignore
                                      to={`/${currentOrganization.id}/users/import`}
                                      component={RouterLink}
                                      key="importUsers"
                                      color="primary"
                                  >
                                      Import Users
                                  </Button>,
                              ]
                            : null
                    }
                />
            </Grid>
        );
    }
    const onChange = async (e: any, user: OrganizationUser, index: number): Promise<void> => {
        const checked = e.target.checked;
        const tableRef = refContainer && (refContainer.current as AdvancedTableWrapper);
        if (canView) {
            user.organizationOwner = checked;
            organizationUsersService
                .updateOrganizationUser(user)
                .then((p: OrganizationUser) => {
                    tableRef.reloadRow(index, mapData(p, index));
                    return;
                })
                .catch((e: Error) => {
                    enqueueSnackbar(`Failed to update the "${user.user.email}" permissions. ${e.message}`, {
                        variant: "error",
                    });
                });
        }
    };

    function buildBody(): ReactElement<any, any> {
        const columns = [
            {
                name: "firstName",
                label: "First Name",
                options: { sort: "true" },
            },
            {
                name: "lastName",
                label: "Last Name",
                options: { sort: "true" },
            },
            {
                name: "email",
                label: "Email",
                options: { sort: "true" },
            },
            {
                name: "isValidated",
                label: "Validated",
                options: { sort: "true" },
            },
            {
                name: "organizationOwner",
                label: "Owner",
                options: { sort: "true" },
            },
            AdvancedTableWrapper.defaultActionMenuColumn(),
        ];
        return (
            <AdvancedTableWrapper
                columns={columns}
                scrollToTop={true}
                showFilter={false}
                showSearch={true}
                minSearchLength={2}
                rows={getRows}
                initialSortColumn="lastName"
                initialSortColumnIndex={1}
                initialSortDirection="asc"
                emptyMessage="No Users found."
                ref={refContainer}
                key={JSON.stringify(loading)}
                rowsPerPage={25}
                rowsPerPageOptions={[25, 50, 100]}
            />
        );
    }
    return (
        <React.Fragment>
            <Dialog
                onClose={(): void => {
                    setShowDeleteModal(false);
                }}
                open={showDeleteModal}
                actions={[
                    <Button
                        color="primary"
                        onClick={async (): Promise<any> => {
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            handleDelete(currentUser!, rowIndex!);
                        }}
                        key="ok"
                    >
                        OK
                    </Button>,
                    <Button
                        onClick={(): any => {
                            setShowDeleteModal(false);
                        }}
                        key="cancel"
                    >
                        Cancel
                    </Button>,
                ]}
                title="Delete"
            >
                <Typography>Are you sure you want to remove this user from this organization?</Typography>
            </Dialog>
            {buildTitle()}
            <Grid container={true} spacing={4}>
                <Grid item={true} xs={true} id="user-list-table">
                    {buildBody()}
                </Grid>
            </Grid>
        </React.Fragment>
    );
};
*/

//---------------------------- other stuff --------------------------------------//

const useStyles = makeStyles((theme) => ({}));

const suggestions = [
    { text: "alfa" },
    { text: "bravo" },
    { text: "Charlie" },
    { text: "delta" },
    { text: "echo" },
    { text: "foxtrot" },
    { text: "golf" },
    { text: "hotel" },
    { text: "India" },
    { text: "Juliette" },
    { text: "kilo" },
    { text: "lima" },
    { text: "Mike" },
    { text: "November" },
    { text: "Oscar" },
    { text: "papa" },
    { text: "Quebec" },
    { text: "Romeo" },
    { text: "sierra" },
    { text: "tango" },
    { text: "uniform" },
    { text: "Victor" },
    { text: "whiskey" },
    { text: "x-ray" },
    { text: "yankee" },
    { text: "zulu" },
];

const onSearch = (value: string) => alert(`Searched for "${value}"`);

const createdDate = new Date(2018, 1, 14);
const modifiedDate = new Date();

export const EditUsers: FunctionComponent<RouteComponentProps> = (props) => {
    //---------------------------- table stuff --------------------------------------//

    const classes = useStyles();

    const refContainer = useRef<AdvancedTableWrapper | null>(null);

    useEffect(() => {
        const tableRef = refContainer && (refContainer.current as AdvancedTableWrapper);
        tableRef.loadRows();
    }, []);

    const buildActions = (
        item: Group,
        index: number
    ): {
        display: string;
        action: () => void;
    }[] => {
        const results = [
            {
                display: "Modify",
                action: (): void => {},
            },
            {
                display: "Delete",
                action: (): void => {},
            },
        ];
        return results;
    };

    const mapData = (item: Group, index: number): (string | number | undefined | JSX.Element)[] => {
        const res = [
            item.id,
            item.name,
            item.membership,
            <Menu
                id={`actions-${item.id}`}
                key={`actions-${index}`}
                stopPropagation={true}
                type="action"
                items={buildActions(item, index)}
            />,
        ];
        return res;
    };

    const getRows = async (state: TableState): Promise<TableData> => {
        const data = groups.map((item: Group, index: number) => mapData(item, index));
        return { data: data, count: groups.length };
    };

    const columns = [
        {
            name: "id",
            label: "Id",
            options: { display: "false" },
        },
        {
            name: "name",
            label: "Name",
            options: { sort: "true" },
        },
        {
            name: "membership",
            label: "Membership",
            options: { sort: "true" },
        },
        AdvancedTableWrapper.defaultActionMenuColumn(),
    ];

    return (
        <Grid container={true} spacing={1}>
            <Grid item={true} xs={9}>
                <Titlebar
                    id="demo-titlebar"
                    title="User Name"
                    breadcrumbs={[
                        <Link key="4" onClick={() => window.alert("This will navigate you up three layers")}>
                            Home
                        </Link>,
                        <Link key="3" onClick={() => window.alert("This will navigate you up three layers")}>
                            Three Layers Up
                        </Link>,
                        <Link key="2" onClick={() => window.alert("This will navigate you up two layers")}>
                            Two Layers Up
                        </Link>,
                        <Link key="1" onClick={() => window.alert("This will navigate you up one layer")}>
                            Home
                        </Link>,
                    ]}
                />
                <Grid item={true} xs={12}>
                    <Grid container={true} justify="space-between">
                        <Grid item={true}>
                            <TextInput label="Name" readOnly={true} value="Name" />
                        </Grid>
                        <Grid item={true}>
                            <TextInput label="Last Name" readOnly={true} value="Last Name" />
                        </Grid>
                        <Grid item={true}>
                            <TextInput label="Email" readOnly={true} value="testing@email.com" />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item={true}>
                    <SearchInput
                        id="example"
                        suggestions={suggestions}
                        onSearch={onSearch}
                        // @ts-ignore
                        fullWidth={true}
                        label="Name"
                    />
                </Grid>
                <Typography variant="h6" title="Group Memberships">
                    <div className={classes.userTableHeader}>Group Memberships</div>
                </Typography>
            </Grid>
            <Grid item={true} xs={true} id="organization-group-table">
                <AdvancedTableWrapper
                    columns={columns}
                    scrollToTop={true}
                    showFilter={false}
                    showSearch={true}
                    minSearchLength={2}
                    rows={getRows}
                    initialSortColumn="name"
                    initialSortColumnIndex={1}
                    initialSortDirection="asc"
                    emptyMessage="This user has no groups."
                    ref={refContainer}
                    rowsPerPage={25}
                    rowsPerPageOptions={[25, 50, 100]}
                />
            </Grid>
            <Grid item={true} xs={3}>
                <ItemMeta id="just-dates" createdDate={createdDate} modifiedDate={modifiedDate} />
            </Grid>
        </Grid>
    );
};
