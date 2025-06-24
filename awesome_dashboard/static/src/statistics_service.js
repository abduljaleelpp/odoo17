/** @odoo-module */

import { registry } from "@web/core/registry";
import { reactive } from "@odoo/owl";

const statisticsServiceFactory = (method) => ({
    dependencies: ["orm", "filter_options_service"],
    start(env, { orm, filter_options_service }) {
        const statistics = reactive({ isReady: false });
        const filters = reactive({
            project: "",
            unitType: "",
            salesperson: "",
        });

        async function loadData() {
            // Update filter options with current filters
            await filter_options_service.loadFilterOptions(filters);
            // Update statistics with current filters
            const updates = await orm.call("sale.order", method, [filters]);
            Object.assign(statistics, updates, { isReady: true });
        }

        return {
            statistics,
            filters,
            filterOptions: filter_options_service.filterOptions,
            loadData,
        };
    },
});

registry.category("services").add("awesome_dashboard.statistics", statisticsServiceFactory("get_dashboard_statistics"));
registry.category("services").add("awesome_dashboard.active_deals_statistics", statisticsServiceFactory("get_active_deals_statistics"));
registry.category("services").add("awesome_dashboard.units_inventory_statistics", statisticsServiceFactory("get_units_inventory_statistics"));
registry.category("services").add("awesome_dashboard.sales_demographics_statistics", statisticsServiceFactory("get_sales_demographics_statistics"));
registry.category("services").add("awesome_dashboard.sales_payments_statistics", statisticsServiceFactory("get_sales_payments_statistics"));
registry.category("services").add("awesome_dashboard.sales_collections_statistics", statisticsServiceFactory("get_sales_collections_statistics"));
registry.category("services").add("awesome_dashboard.available_units_statistics", statisticsServiceFactory("get_available_units_statistics"));