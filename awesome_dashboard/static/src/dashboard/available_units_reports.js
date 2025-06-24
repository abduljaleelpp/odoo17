/** @odoo-module **/

import { Component, useState, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Layout } from "@web/search/layout";
import { DashboardItem } from "./dashboard_item/dashboard_item";
import { FilterPanelAvailable } from "./filterPanelAvailable/filter_panel_available";

export class AvailableUnitsReport extends Component {
    static template = "awesome_dashboard.AvailableUnits";
    static components = { Layout, DashboardItem, FilterPanelAvailable };

    setup() {
        this.statisticsService = useState(useService("awesome_dashboard.available_units_statistics"));
        this.filterOptionsService = useService("filter_options_available_service");
        this.items = registry.category("available_units_items").getAll();
        this.statistics = this.statisticsService.statistics;
        this.filters = this.statisticsService.filters;
        this.filterOptions = this.filterOptionsService.filterOptions;

        onMounted(async () => {
            await this.filterOptionsService.loadFilterOptions();
            await this.statisticsService.loadData();
        });

        this.onFilterChange = (filterType, value) => {
            this.filterOptionsService.loadFilterOptions(this.filters);
            this.statisticsService.loadData();
        };

        this.resetFilters = () => {
            this.filterOptionsService.loadFilterOptions();
            this.statisticsService.loadData();
        };
    }
}
registry.category("lazy_components").add("AvailableUnits", AvailableUnitsReport);