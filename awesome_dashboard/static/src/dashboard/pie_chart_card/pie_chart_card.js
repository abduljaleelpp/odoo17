/** @odoo-module */
import { Component, useState, onWillUpdateProps } from "@odoo/owl";
import { PieChart } from "../pie_chart/pie_chart";

export class PieChartCard extends Component {
    static template = "awesome_dashboard.PieChartCard";
    static components = { PieChart };
    static props = {
        title: { type: String },
        values: { type: Object },
    };

    setup() {
        this.state = useState({
            values: this.props.values,
        });

        // Update state when props change due to filter application
        onWillUpdateProps((nextProps) => {
            this.state.values = nextProps.values;
        });
    }
}