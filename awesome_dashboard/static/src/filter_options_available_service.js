/** @odoo-module */

import { registry } from "@web/core/registry";
import { reactive } from "@odoo/owl";

export const filterOptionsAvailableService = {
    dependencies: ["orm"],
    start(env, { orm }) {
        const filterOptions = reactive({
            projects: [],
            unitTypes: [],
            states: [],
            isReady: false,
        });

        async function loadFilterOptions(filters = {}) {
            const data = await orm.call("product.product", "get_filter_available_options", [filters]);
            filterOptions.projects = data.projects || [];
            filterOptions.unitTypes = data.unit_types || [];
            filterOptions.states = data.states || [];
            filterOptions.isReady = true;
        }

        return {
            filterOptions,
            loadFilterOptions,
        };
    },
};

registry.category("services").add("filter_options_available_service", filterOptionsAvailableService);