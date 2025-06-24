/** @odoo-module */

import { registry } from "@web/core/registry";
import { LazyComponent } from "@web/core/assets";
import { Component, xml } from "@odoo/owl";

class AwesomeDashboardLoader extends Component {
    static components = { LazyComponent };
    static template = xml`
        <LazyComponent bundle="'awesome_dashboard.dashboard'" Component="'AwesomeDashboard'" props="props"/>
    `;
}

class ActiveDealsCountLoader extends Component {
    static components = { LazyComponent };
    static template = xml`
        <LazyComponent bundle="'awesome_dashboard.dashboard'" Component="'ActiveDealsCount'" props="props"/>
    `;
}

class UnitsInventoryReportLoader extends Component {
    static components = { LazyComponent };
    static template = xml`
        <LazyComponent bundle="'awesome_dashboard.dashboard'" Component="'UnitsInventoryReport'" props="props"/>
    `;
}
class SalesDemographicsLoader extends Component {
    static components = { LazyComponent };
    static template = xml`
        <LazyComponent bundle="'awesome_dashboard.dashboard'" Component="'SalesDemographics'" props="props"/>
    `;
}
class SalesPaymentsLoader extends Component {
    static components = { LazyComponent };
    static template = xml`
        <LazyComponent bundle="'awesome_dashboard.dashboard'" Component="'SalesPayments'" props="props"/>
    `;
}
class SalesCollectionsLoader extends Component {
    static components = { LazyComponent };
    static template = xml`
        <LazyComponent bundle="'awesome_dashboard.dashboard'" Component="'SalesCollections'" props="props"/>
    `;
}
class AvailableUnitsLoader extends Component {
    static components = { LazyComponent };
    static template = xml`
        <LazyComponent bundle="'awesome_dashboard.dashboard'" Component="'AvailableUnits'" props="props"/>
    `;
}


registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboardLoader);
registry.category("actions").add("awesome_dashboard.active_deals_count", ActiveDealsCountLoader);
registry.category("actions").add("awesome_dashboard.units_inventory_report", UnitsInventoryReportLoader);
registry.category("actions").add("awesome_dashboard.sales_demographics", SalesDemographicsLoader);
registry.category("actions").add("awesome_dashboard.sales_payments", SalesPaymentsLoader);
registry.category("actions").add("awesome_dashboard.sales_collections", SalesCollectionsLoader);
registry.category("actions").add("awesome_dashboard.available_units", AvailableUnitsLoader);
