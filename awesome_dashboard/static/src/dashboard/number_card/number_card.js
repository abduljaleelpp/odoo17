/** @odoo-module */

import { Component } from "@odoo/owl";

export class NumberCard extends Component {
    static template = "awesome_dashboard.NumberCard";
    static props = {
        title: { type: String, optional: true },
        value: { type: Number },
        isSold: { type: Boolean, optional: true, default: false },
        // displayMillions: { type: Boolean, optional: true, default: false },
        showAvailableLabel: { type: Boolean, optional: true, default: false },
        showTotalLabel: {type: Boolean, optional: true, default: false  } // New prop
    };

    get soldLabelTextLength() {
        const text = "Sold"; // Hardcoded for now, but could be dynamic if needed
        if (text.length > 15) {
            return "long";
        } else if (text.length > 10) {
            return "medium";
        }
        return "short";
    }
    get availableLabelTextLength() {
        const text = "Available";
        if (text.length > 15) {
            return "long";
        } else if (text.length > 10) {
            return "medium";
        }
        return "short";
    }
    get totalLabelTextLength() {
        const text = "Total";
        if (text.length > 15) {
            return "long";
        } else if (text.length > 10) {
            return "medium";
        }
        return "short";
    }
     /**
     * Formats a number into a human-readable format (e.g., 1.5M, 2.5B).
     * @param {number} num - The number to format.
     * @param {string} [currencySymbol=''] - Optional currency symbol to prepend.
     * @returns {string} - The formatted number.
     */
     formatNumber(num, currencySymbol = '') {
        // if (num >= 1e9) { // Billion
        //     return `${currencySymbol}${(num / 1e9).toFixed(2)}B`;
        // } else
        if (num >= 1e6) { // Million
            return `${currencySymbol}${(num / 1e6).toFixed(2)}M`;
        } else if (num >= 1e3) { // Thousand
            return `${currencySymbol}${(num / 1e3).toFixed(2)}K`;
        } else {
            return `${currencySymbol}${num.toString()}`; // Return as is for smaller numbers
        }
    }
    /* formatNumberUpToMillions(num, currencySymbol = "") {
        if (num >= 1e6) {
            return `${currencySymbol}${(num / 1e6).toFixed(2)}M`;
        } else if (num >= 1e3) {
            return `${currencySymbol}${(num / 1e3).toFixed(2)}K`;
        } else {
            return `${currencySymbol}${num.toString()}`;
        }
    } */
    
}
