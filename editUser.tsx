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
import axios from "axios";

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

//---------------------------- table stuff --------------------------------------//

const ref = useRef();
// @ts-ignore
const buildActions = (index) => {
    return [
        {
            display: "Delete",
            action: () => {
                // @ts-ignore
                ref && ref.current.deleteRow(+index);
            },
        },
    ];
};
// @ts-ignore
const renderMenu = (value, tableData) => (
    <Menu id="actions-1" key="actions-1" type="action" items={buildActions(tableData.rowIndex++)} />
);

const columns = [
    {
        name: "name",
        displayName: "Name",
        options: { sort: true },
    },
    { name: "email", displayName: "Email", options: { sort: true } },
    { name: "body", displayName: "Body", options: { sort: true } },
    {
        name: "actions",
        label: "Actions",
        options: {
            viewColumns: false,
            sort: false,
            searchable: false,
            filter: false,
            customBodyRender: renderMenu,
        },
    },
];
// @ts-ignore
const getRows = async (state) => {
    let qs = `?_page=${state.page}&_limit=${state.rowsPerPage}`;
    if (state.sortColumn && state.sortDirection) {
        qs = `${qs}&_sort=${state.sortColumn}&_order=${state.sortDirection}`;
    }
    if (state.search) {
        qs = `${qs}&q=${state.search}`;
    }

    const res = await axios.get(`https://jsonplaceholder.typicode.com/comments${qs}`);
    // @ts-ignore
    const processed = res.data.map((item, i) => [item.name, item.email, item.body]);
    return Promise.resolve({
        data: processed,
        count: parseInt(res.headers["x-total-count"]),
    });
};

//---------------------------- other stuff --------------------------------------//

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
                    Group Memberships
                </Typography>
                <AdvancedTableWrapper
                    enablePreload={true}
                    columns={columns}
                    serverSide={true}
                    showSearch={true}
                    download={true}
                    showFilter={true}
                    rows={getRows}
                    initialSortColumn="name"
                    initialSortColumnIndex={0}
                    initialSortDirection="asc"
                    emptyMessage="You have no data!"
                    // @ts-ignore
                    ref={ref}
                />
                ;
            </Grid>
            <Grid item={true} xs={3}>
                <ItemMeta id="just-dates" createdDate={createdDate} modifiedDate={modifiedDate} />
            </Grid>
        </Grid>
    );
};
