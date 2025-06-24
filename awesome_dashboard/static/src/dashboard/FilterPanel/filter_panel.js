/** @odoo-module */

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";

export class FilterPanel extends Component {
    static template = "awesome_dashboard.FilterPanel";
    static components = { Dropdown, DropdownItem };
    static props = {
        filters: Object, // Reactive filter state { project, unitType, salesperson }
        filterOptions: Object, // Reactive filter options { projects, unitTypes, salespersons }
        onFilterChange: Function, // Callback for filter changes
        onResetFilters: Function, // Callback for resetting filters
    };

    onProjectChange(ev) {
        this.onFilterChange('project', ev.target.value);
    }

    onUnitTypeChange(ev) {
        this.onFilterChange('unitType', ev.target.value);
    }

    onSalespersonChange(ev) {
        this.onFilterChange('salesperson', ev.target.value);
    }

    onFilterChange(filterType, value) {
        if (!this.props || !this.props.filters || !this.props.onFilterChange) {
            console.error('FilterPanel: Missing props or required properties');
            return;
        }
        this.props.filters[filterType] = value;
        this.props.onFilterChange(filterType, value);
    }

    resetFilters() {
        if (!this.props || !this.props.filters || !this.props.onResetFilters) {
            console.error('FilterPanel: Missing props or required properties');
            return;
        }
        this.props.filters.project = "";
        this.props.filters.unitType = "";
        this.props.filters.salesperson = "";
        this.props.onResetFilters();
    }
}

registry.category("components").add("FilterPanel", FilterPanel);