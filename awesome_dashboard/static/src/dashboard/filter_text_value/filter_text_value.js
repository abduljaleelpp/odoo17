/** @odoo-module */

import { Component } from "@odoo/owl";
export class TextFilterValue extends Component {
    static template = "awesome_dashboard.TextFilterValue";
    static props = {
        label: { type: String, optional: true },
        onValueChanged: Function,
        value: { type: String, optional: true },
        options: {
            type: Array,
            element: {
                type: Object,
                shape: { value: String, formattedValue: String },
                optional: true,
            },
        },
    };
}