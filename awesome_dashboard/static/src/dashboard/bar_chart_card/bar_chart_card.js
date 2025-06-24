/** @odoo-module */

import { Component, useState, onWillUpdateProps } from "@odoo/owl";
import { BarChart } from "../bar_chart/bar_chart";

export class BarChartCard extends Component {
    static template = "awesome_dashboard.BarChartCard";
    static components = { BarChart };
    static props = {
        title: { type: String },
        values: { type: Object },
        yAxisLabel: { type: String, optional: true },
        xAxisLabel: { type: String, optional: true },
        displayMillions: { type: Boolean },
        indexAxis: { type: String, enum: ['x', 'y'], optional: true},
    };
    static defaultProps = {
        indexAxis: 'y', // Default to horizontal bars
    };
    setup() {
        this.state = useState({
            values: this.props.values,
        });

        // Update state when props change
        onWillUpdateProps((nextProps) => {
            this.state.values = nextProps.values;
        });
    }
}