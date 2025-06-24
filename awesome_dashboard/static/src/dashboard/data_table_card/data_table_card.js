/** @odoo-module */
import { Component, useState, onWillUpdateProps } from "@odoo/owl";
import { DataTable } from "../data_table/data_table";

export class DataTableCard extends Component {
    static template = "awesome_dashboard.DataTableCard";
    static components = { DataTable };
    static props = {
        title: { type: String, optional: true, default: "" },
        values: { type: [Object, Array, { value: null }], optional: true },
        headers: { type: Array, element: String },
        isSold: { type: Boolean, optional: true, default: false },
        weightKey: { type: String, optional: true },
        rowColorConfig: {
            type: Object,
            optional: true,
            shape: {
                field: { type: String },
                classMap: { type: Object },
            },
        },
        config: {
            type: Object,
            optional: true,
            default: { enablePagination: false, itemsPerPage: 10 },
            shape: {
                enablePagination: { type: Boolean, optional: true, default: false },
                itemsPerPage: { type: Number, optional: true, default: 10 },
            },
        },
    };

    setup() {
        this.state = useState({
            values: this.props.values,
        });

        onWillUpdateProps((nextProps) => {
            this.state.values = nextProps.values;
        });
    }
}