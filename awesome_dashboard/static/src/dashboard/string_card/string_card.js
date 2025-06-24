/** @odoo-module **/

import { Component } from '@odoo/owl';

export class StringCard extends Component {
    static template = 'awesome_dashboard.StringCard';
    static props = {
        title: { type: String, optional: true },
        isSold: { type: Boolean, optional: true, default: false },

    };   

    get displayValue() {
        // Logic to process and return the string value to display
        return this.props.title.toUpperCase(); // Example: Convert to uppercase
    }
    toItalic() {
        // Logic to convert the string value to italic
        return `<i>${this.props.title || ''}</i>`;
    }


  
}