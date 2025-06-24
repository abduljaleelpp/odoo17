/** @odoo-module **/

import { Component, useState, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Layout } from "@web/search/layout";
import { DashboardItem } from "./dashboard_item/dashboard_item";
import { FilterPanel } from "./FilterPanel/filter_panel";

export class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout, DashboardItem, FilterPanel};

    setup() {
        this.statisticsService = useState(useService("awesome_dashboard.statistics"));
        this.filterOptionsService = useService("filter_options_service");
        this.items = registry.category("awesome_dashboard_items").getAll();
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
        groupItems(items) {
        return items.reduce((acc, item) => {
            const group = item.group || "default";
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(item);
            return acc;
        }, {});
    }
}

registry.category("lazy_components").add("AwesomeDashboard", AwesomeDashboard);