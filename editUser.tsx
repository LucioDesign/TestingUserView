import Grid from "@civicplus/preamble/lib/Grid";
import Link from "@civicplus/preamble/lib/Link";
import Menu from "@civicplus/preamble/lib/Menu";
import Titlebar from "@civicplus/preamble/lib/Titlebar";
import Typography from "@civicplus/preamble/lib/Typography";
import AdvancedTableWrapper from "@civicplus/preamble/lib/AdvancedTable/AdvancedTableWrapper";
import { TableData, TableState } from "@civicplus/preamble/lib/AdvancedTable/AdvancedTableWrapperConstants";
import React, { FunctionComponent, useEffect, useRef } from "react";
import { RouteComponentProps } from "react-router";
import TextInput from "@civicplus/preamble/lib/TextInput";
import SearchInput from "@civicplus/preamble/lib/SearchInput";
import ItemMeta from "@civicplus/preamble/lib/ItemMeta";
import { groups } from "./dummyData";
import { Group } from "./types";
import { makeStyles } from "@material-ui/core";
import StickyRightBar from "@civicplus/preamble/lib/StickyRightBar";

const useStyles = makeStyles((theme) => ({
    userTableHeader: { marginTop: theme.spacing(2) },
    sidebar: {
        paddingLeft: theme.spacing(2),
    },
}));

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

export const EditUsers: React.FC<FunctionComponent<RouteComponentProps>> = (props) => {
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

    //-------------------------------------------------------------------------------//

    return (
        <Grid container={true} spacing={4}>
            <Grid item={true} xs={12}>
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
            </Grid>
            <Grid item={true} xs={12}>
                <StickyRightBar
                    id="stickyRightBar-demo"
                    rightBar={
                        <div className={classes.sidebar}>
                            <ItemMeta id="just-dates" createdDate={createdDate} modifiedDate={modifiedDate} />
                        </div>
                    }
                >
                    <Grid container={true} justify="space-between">
                        <Grid item={true} xs={12} sm="auto">
                            <TextInput label="First Name" readOnly={true} value="First Name" fullWidth={true} />
                        </Grid>
                        <Grid item={true} xs={12} sm="auto">
                            <TextInput label="Last Name" readOnly={true} value="Last Name" fullWidth={true} />
                        </Grid>
                        <Grid item={true} xs={12} sm="auto">
                            <TextInput label="Email" readOnly={true} value="testing@email.com" fullWidth={true} />
                        </Grid>
                    </Grid>
                    <SearchInput
                        id="example"
                        suggestions={suggestions}
                        onSearch={onSearch}
                        // @ts-ignore
                        fullWidth={true}
                        label="Add Group"
                        labelProps={{ shrink: true }}
                    />
                    <Grid item={true} xs={true} id="organization-group-table">
                        <Typography variant="h6" title="Group Memberships" className={classes.userTableHeader}>
                            Group Memberships
                        </Typography>
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
                </StickyRightBar>
            </Grid>
        </Grid>
    );
};
