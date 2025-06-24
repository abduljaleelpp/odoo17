/** @odoo-module **/

import { Component, useState, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Layout } from "@web/search/layout";
import { DashboardItem } from "./dashboard_item/dashboard_item";
import { FilterPanel } from "./FilterPanel/filter_panel";

export class SalesCollections extends Component {
    static template = "awesome_dashboard.SalesCollections";
    static components = { Layout, DashboardItem, FilterPanel };

    setup() {
        this.statisticsService = useState(useService("awesome_dashboard.sales_collections_statistics"));
        this.filterOptionsService = useService("filter_options_service");
        this.items = registry.category("sales_collection_items").getAll();
        this.statistics = this.statisticsService.statistics;
        this.filters = this.statisticsService.filters;
        this.filterOptions = this.statisticsService.filterOptions;

        onMounted(async () => {
            await this.filterOptionsService.loadFilterOptions();
            await this.statisticsService.loadData();
        });

        this.onFilterChange = (filterType, value) => {
            this.statisticsService.loadData();
        };

        this.resetFilters = () => {
            this.statisticsService.loadData();
        };
    }
}

registry.category("lazy_components").add("SalesCollections", SalesCollections);