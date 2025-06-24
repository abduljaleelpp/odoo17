/** @odoo-module */

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";

export class FilterPanelAvailable extends Component {
    static template = "awesome_dashboard.FilterPanelAvailable";
    static components = { Dropdown, DropdownItem };
    static props = {
        filters: Object, // Reactive filter state { project, unitType, state }
        filterOptions: Object, // Reactive filter options { projects, unitTypes, states }
        onFilterChange: Function, // Callback for filter changes
        onResetFilters: Function, // Callback for resetting filters
    };

    async onProjectChange(ev) {
        await this.onFilterChange('project', ev.target.value);
    }

    async onUnitTypeChange(ev) {
        await this.onFilterChange('unitType', ev.target.value);
    }

    async onStateChange(ev) {
        await this.onFilterChange('state', ev.target.value);
    }

    async onFilterChange(filterType, value) {
        if (!this.props || !this.props.filters || !this.props.onFilterChange) {
            console.error('FilterPanel: Missing props or required properties');
            return;
        }
        this.props.filters[filterType] = value;
        // Reload filter options to update dependent filters
        this.props.onFilterChange(filterType, value);
    }

    resetFilters() {
        if (!this.props || !this.props.filters || !this.props.onResetFilters) {
            console.error('FilterPanel: Missing props or required properties');
            return;
        }
        this.props.filters.project = "";
        this.props.filters.unitType = "";
        this.props.filters.state = "";
        this.props.onResetFilters();
    }
}

registry.category("components").add("FilterPanelAvailable", FilterPanelAvailable);