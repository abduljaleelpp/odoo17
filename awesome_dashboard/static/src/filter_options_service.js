/** @odoo-module */

import { registry } from "@web/core/registry";
import { reactive } from "@odoo/owl";

export const filterOptionsService = {
    dependencies: ["orm"],
    start(env, { orm }) {
        const filterOptions = reactive({
            projects: [],
            unitTypes: [],
            salespersons: [],
            isReady: false,
        });

        async function loadFilterOptions(filters = {}) {
            const data = await orm.call("sale.order", "get_filter_options", [filters]);
            filterOptions.projects = data.projects || [];
            filterOptions.unitTypes = data.unit_types || [];
            filterOptions.salespersons = data.salespersons || [];
            filterOptions.isReady = true;
        }

        return {
            filterOptions,
            loadFilterOptions,
        };
    },
};

registry.category("services").add("filter_options_service", filterOptionsService);