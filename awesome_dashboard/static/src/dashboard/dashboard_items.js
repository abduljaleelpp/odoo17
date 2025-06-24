/** @odoo-module */

import { NumberCard } from "./number_card/number_card";
import { PieChartCard } from "./pie_chart_card/pie_chart_card";
import { registry } from "@web/core/registry";
import { BarChartCard } from "./bar_chart_card/bar_chart_card";
import { DataTableCard } from "./data_table_card/data_table_card";
import { StringCard } from "./string_card/string_card";

const items = [
  /*  {
        id: "project_selection",
        description: "Project",
        Component: SelectionField,
        props: (data) => ({
            title: "Projects",
            value: data.projects,
        })
    }, */

  {
    id: "total_sales",
    description: "Sales",
    Component: NumberCard,
    size: 3,
    props: (data) => ({
      title: "Sales",
      value: data.total_sales,
    }),
  },
  {
    id: "active_deals",
    description: "No of Active Deals",
    Component: NumberCard,
    size: 3,
    props: (data) => ({
      title: "Active Deals",
      value: data.active_deals,
    }),
  },
  {
    id: "agencies",
    description: "No of agencies",
    Component: NumberCard,
    size: 3,
    props: (data) => ({
      title: "Agencies",
      value: data.agencies,
    }),
  },
  /* {
        id: "cancelled_orders",
        description: "Cancelled orders this month",
        Component: NumberCard,
        props: (data) => ({
            title: "Number of cancelled orders this month",
            value: data.nb_cancelled_orders,
        })
    }, */
  {
    id: "active_customers",
    description: "active customers",
    Component: NumberCard,
    size: 3,
    props: (data) => ({
      title: "Customers",
      value: data.customers,
    }),
  },
  /* {
        id: "top_national",
        description: "Top Nationality",
        Component: BarChartCard,
        size: 2,
        props: (data) => ({
            title: "Top 10 Nationalities by Sales Price",
            values: data.top_national,
            yAxisLabel:"Nationality",
            xAxisLabel:"Sum of Sales Price",
            displayMillions:true
        })
    }, */
  {
    id: "bar_chart",
    description: "Customers",
    Component: BarChartCard,
    size: 6,
    props: (data) => ({
      title: "Top 10 Customers by Sales Price",
      values: data.top_customers,
      yAxisLabel: "Customers",
      xAxisLabel: "Sum of Sales Price",
      displayMillions: true,
    }),
  },
  {
    id: "top_agency_bar_chart",
    description: "Agency Name",
    Component: BarChartCard,
    size: 6,
    props: (data) => ({
      title: "Top 10 Agencies by Sales Price",
      values: data.top_agencies,
      yAxisLabel: "Agency Name",
      xAxisLabel: "Sum of Sales Price",
      displayMillions: true,
    }),
  },
  {
    id: "top_sales_persons_bar_chart",
    description: "Sales Person",
    Component: BarChartCard,
    size: 6,
    props: (data) => ({
      title: "Top 10 Sales Persons by Sales Price",
      values: data.top_salespersons,
      yAxisLabel: "Sales Person",
      xAxisLabel: "Sum of Sales Price",
      displayMillions: true,
    }),
  },
  {
    id: "pie_chart",
    description: "Sum of Sales Price by State",
    Component: PieChartCard,
    size: 6,
    // height : 3,
    props: (data) => ({
      title: "Sum of Sales Price by State",
      values: data.sales_price_by_state,
    }),
  },
  
  {
    id: "data_table",
    description: "Details by Unit Type",
    Component: DataTableCard,
    size: 6,
    props: (data) => ({
      values: data.unit_type_summary,
      headers: ["Project","Unit Type", "Count of Unit", "Sum of Sales Price"],
      config: {
        enablePagination: true,
        itemsPerPage: 500,
      },
    }),
  },
   
];

/* const global_filters = [
    {
        id: "project_filter",
        description: "Filter by Project",
        Component: TextFilterValue,
        props: (data) => ({
            title: "Sales",
            value: data.projects,
        })
    },
] */
const items_count = [
  {
    id: "total_sales_count",
    description: "Sales",
    size:3,
    Component: NumberCard,
    props: (data) => ({
      title: "Total Amount",
      value: data.total_sales,
    }),
  },
  {
    id: "active_deals_count",
    description: "No of Active Deals",
    Component: NumberCard,
    size: 3,
    props: (data) => ({
      title: "Active Deals",
      value: data.active_deals,
    }),
  },
  {
    id: "salepersons_count",
    description: "Salespersons",
    Component: NumberCard,
    size: 3,
    props: (data) => ({
      title: "Sales Person",
      value: data.saleperson,
    }),
  },
  {
    id: "active_customers",
    description: "active customers",
    Component: NumberCard,
    size: 3,
    props: (data) => ({
      title: "Customers",
      value: data.customers,
    }),
  },
  {
    id: "topSalespersonByDeals",
    description: "Top Salesperson by Deals Count",
    Component: BarChartCard,
    size: 6,
    props: (data) => ({
      title: "Top Sales Persons by Deals Count",
      values: data.top_salespersons_by_deals,
      xAxisLabel: "Active Deals Count",
      yAxisLabel: "Sales Persons",
      displayMillions: false,
    }),
  },
  {
    id: "top_agency_by_deal",
    description: "Agency Name",
    Component: BarChartCard,
    size: 6,
    props: (data) => ({
      title: "Top 10 Agencies by Deals",
      values: data.top_agencies_by_deals,
      yAxisLabel: "Agency Name",
      xAxisLabel: "Active Deals Count",
      displayMillions: false,
    }),
  },
  {
    id: "top_customers_by_deals",
    description: "Top Sales Persons",
    Component: BarChartCard,
    size: 6,
    props: (data) => ({
      title: "Top 10 Customers By Deals Count",
      values: data.top_customers_by_deals,
      yAxisLabel: "Customers",
      xAxisLabel: "Active Deals Count",
      displayMillions: false,
    }),
  },
  {
    id: "active_deals_by_unit_type",
    description: "Deals count by Unit Type",
    Component: PieChartCard,
    size: 6,
    props: (data) => ({
      title: "Deals Count By Unit Type",
      values: data.active_deals_by_unit_type,
    }),
  },
  {
    id: "active_deals_by_state",
    description: "Active Deals by State",
    Component: PieChartCard,
    size: 6,
    props: (data) => ({
      title: "Deals Count By Registration State",
      values: data.active_deals_by_state,
    }),
  },
];
const inventory_count = [

  {
    id: "total_units_sold",
    description: "Sales",
    Component: NumberCard,
    size: 4,
    props: (data) => ({
      title: "Total Sales Price",
      value: data.total_units_sold,
      isSold: true,
      // displayMillions: true,
    }),
  },
  {
    id: "sold_unit_total",
    description: "Total Sold Units",
    Component: NumberCard,
    size: 4,
    props: (data) => ({
      title: "Sold Units",
      value: data.total_sold_units,
      isSold: true,
    }),
  },
  {
    id: "total_sqft",
    description: "Total Square Feet ",
    Component: NumberCard,
    size: 4,
    props: (data) => ({
      title: "Total Sold Square Ft",
      value: data.total_sqft,
      isSold: true,
    }),
  },
  {
    id: "sum_of_asking_price",
    description: "Sum of Asking Price",
    Component: NumberCard,
    size: 4,
    props: (data) => ({
      title: "Total Available Asking Price",
      value: data.total_asking_price,
      showAvailableLabel: true,
    }),
  },
  {
    id: "available_units",
    description: "Available Units",
    Component: NumberCard,
    size: 4,
    props: (data) => ({
      title: "Available Units",
      value: data.available_units,
      showAvailableLabel: true,
    }),
  },
  {
    id: "total_available Square feet",
    description: "Total Available Square Ft",
    Component: NumberCard,
    size: 4,
    props: (data) => ({
      title: "Total Available Square Ft",
      value: data.total_available_square_ft,
      showAvailableLabel: true,
    }),
  },
  {
    id: "total_price",
    description: "Total Price",
    Component: NumberCard,
    size: 4,
    props: (data) => ({
      title: "Total",
      value: data.total_units_sold + data.total_asking_price,
      showTotalLabel: true,
    }),
  },
  {
    id: "total_units",
    description: "Total Units",
    Component: NumberCard,
    size: 4,
    props: (data) => ({
      title: "Total Units",
      value: data.total_sold_units + data.available_units,
      showTotalLabel: true,
    }),
  },
  {
    id: "total_sqfeet",
    description: "Total Square Feet ",
    Component: NumberCard,
    size: 4,
    props: (data) => ({
      title: "Total Square Ft",
      value: data.total_sqft + data.total_available_square_ft,
      showTotalLabel: true,
    }),
  },
  {
    id: "sold_units_details",
    description: "Total sold units",
    Component: StringCard,
    size: 6,
    props: () => ({
      title: "Total Sold Units",
      isSold: true,
 
    }),
  },
  {
    id: "Available_units_details",
    description: "Available Units",
    Component: StringCard,
    size: 6,
    props: () => ({
      title: "Available Units Details",
      isSold: false,
 
    }),
  },
  {
    id: "data_table",
    description: "Details by Unit Type",
    Component: DataTableCard,
    size: 6,
    props: (data) => ({
      values: data.selling_prices,
      headers: [
        "Project",
        "Unit Type",
        "Count of Unit",
        "Minimum Selling Price",
        "Average Selling Price",
        "Max of Selling Price",
      ],
      config: {
        enablePagination: true,
        itemsPerPage: 500,
      },
      isSold: true,
      weightKey: "count_of_unit",
    }),
  },
  {
    id: "available_sqft_stats",
    description: "Avail Sqft Stats",
    Component: DataTableCard,
    size: 6,
    props: (data) => ({
      values: data.avail_sqft_stats,
      headers: [
        "Project",
        "Unit Type",
        "Count of Unit",
        "Min Of Avail Square Feet",
        "Average Of Avail Square Feet",
        "Max Of Avail Square Feet",
      ],
      config: {
        enablePagination: true,
        itemsPerPage: 500,
      },
      weightKey: "count_of_unit",
    }),
  },
  {
    id: "sqft_stats",
    description: "Sqft Stats",
    Component: DataTableCard,
    size: 6,
    props: (data) => ({
      values: data.sqft_stats,
      headers: [
        "Project",
        "Unit Type",
        "Count of Unit",
        "Min Of Square Feet",
        "Average Of Square Feet",
        "Max Of Square Feet",
      ],
      config: {
        enablePagination: true,
        itemsPerPage: 500,
      },
      isSold: true,
      weightKey: "count_of_unit",
    }),
  },
  {
    id: "asking_price",
    description: "Asking Price",
    Component: DataTableCard,
    size: 6,
    props: (data) => ({
      values: data.asking_prices,
      headers: [
        "Project",
        "Unit Type",
        "Count of Unit",
        "Minimum Asking Price",
        "Average Asking Price",
        "Max of Asking Price",
      ],
      config: {
        enablePagination: true,
        itemsPerPage: 500,
      },
      weightKey: "count_of_unit",
    }),
  },
  {
    id: "discount_stats",
    description: "discount Stats",
    Component: DataTableCard,
    size: 6,
    props: (data) => ({
      values: data.discount_stats,
      headers: [
        "Project",
        "Unit Type",
        "Count of Unit",
        "Min of Discount(%)",
        "Average of Discount(%)",
        "Max of Discount(%)",
        "Sum of Discount Amount(%)",
      ],
      config: {
        enablePagination: true,
        itemsPerPage: 500,
      },
      isSold: true,
      weightKey: "count_of_unit",
    }),
  },
  {
    id: "state_stats",
    description: "state Stats",
    Component: DataTableCard,
    size: 6,
    props: (data) => ({
      values: data.avail_sate_stats,
      headers: [
        "Project",
        "Unit Type",
        "state",
        "Count of Unit",
        "Sum Of Square Ft",
        "Sum of Price Sqft",
        "Sum Of Asking Price",
      ],
      config: {
        enablePagination: true,
        itemsPerPage: 500,
      },
    }),
  },
  {
    id: "unit_type_summery_stats",
    description: "Unit Type Summery Stats",
    Component: BarChartCard,
    size: 6,
    props: (data) => ({
      title: "Units Summary",
      values: data.unit_type_summary,
      yAxisLabel: "Unit Type",
      xAxisLabel: "Count of Unit",
      displayMillions: false,
      indexAxis: "x",
    }),
  },



];
const sales_demographics_items = [
  {
    id: "top_nationalities",
    description: "Top Nationalities",
    Component: BarChartCard,
    size: 12,
    props: (data) => ({
      title: "",
      values: data.top_nationalities,
      yAxisLabel: "Customers",
      xAxisLabel: "Active Deals Count",
      displayMillions: false,
    }),
  },
  {
    id: "sale_demographics_table",
    description: "sale Demographics Table",
    Component: DataTableCard,
    size: 9,
    props: (data) => ({
      values: data.nationalities,
      headers: [
        "Serial Number",
        "Nationality",
        "Deals Count",
        "Percentage"
      ],
      config: {
        enablePagination: true,
        itemsPerPage: 500,
      },
    }),
  },
  {
    id: "residences",
    description: "Residences by national or international",
    Component: PieChartCard,
    size: 3,
    props: (data) => ({
      title: "Residences by National or International",
      values: data.residences,
    }),
  },
];
const sales_payments_items = [

  {
    id: "payment_status",
    description: "Payment Status",
    Component: DataTableCard,
    size: 12,
    props: (data) => ({
      title: "Deals With Down Payment Dues",
      values: data.payment_stats,
      headers: [
        "SL",
        "Sale Order",
        "Reservation Date",
        "Project",
        "Unit No",
        "Unit Type",
        "Sales Price",
        "Customer",
        "Agency",
        "SalesPerson",
        "Admin Fees",
        "DLD Fees",
        "Down Payment",
      ],
      config: {
        enablePagination: true,
        itemsPerPage: 500,
      },
    }),
  },
  {
    id: "payment_status_by_state",
    description: "Payment Status",
    Component: DataTableCard,
    size: 8,
    props: (data) => ({
      values: data.statewise_payment_stats,
      headers: [
        "Project",
        "state",
        "Sum of Sales Price",
        "Total Paid Amount",
        "Average Amount Paid(%)",
        "Sum of Due Amount",
      ],
      weightKey: "order_count",
      config: {
        enablePagination: true,
        itemsPerPage: 500,
      },
    }),
  },
];
const sales_collections_items = [
  {
    id: "collection_dues",
    description: "Collection Dues",
    Component: DataTableCard,
    size: 6,
    props: (data) => ({
      title: "Collection Status Report",
      values: data.collection_due,
      headers: [
        "Project",
        "Collection Status",
        "Count of Deals",
        "Total Dues",
        "Percentage(%)",
      ],
      rowColorConfig: {
        field: "collection_status",
        classMap: {
          "High Risk": "row-danger",
          "Medium Risk": "row-medium",
          "Low Risk": "row-low",
        },
      },
      config: {
        enablePagination: true,
        itemsPerPage: 500,
      },
    }),
  }
];

const available_units_items = [
  {
    id: "available_units_report",
    description: "Available Units Report",
    Component: DataTableCard,
    size: 12,
    props: (data) => ({
      values: data.available_units_stats,
      headers: [
        "Project",
        "Unit Name",
        "Unit No",
        "Unit Series",
        "Unit Type",
        "Bedrooms",
        "Bathrooms",
        "Status",
        "Unit View",
        "Unit Variant",
        "Usage",
        "Parking Slots",
        "Suit Area",
        "Balcony Area",
        "Total Area Sqft",
        "Total area M2",
        // "Purchase Asking Price",
        "Selling Price",
        "Furnished",
      ],
      config: {
        enablePagination: true,
        itemsPerPage: 500,
      },
    }),
  },
];

items.forEach((item) => {
  registry.category("awesome_dashboard_items").add(item.id, item);
});
items_count.forEach((item) => {
  registry.category("active_deals_count_items").add(item.id, item);
});
inventory_count.forEach((item) => {
  registry.category("inventory_count_items").add(item.id, item);
});
sales_demographics_items.forEach((item) => {
  registry.category("sales_demographics_items").add(item.id, item);
});
sales_payments_items.forEach((item) => {
  registry.category("sales_payments_items").add(item.id, item);
});
sales_collections_items.forEach((item) => {
  registry.category("sales_collection_items").add(item.id, item);
});
available_units_items.forEach((item) => {
  registry.category("available_units_items").add(item.id, item);
});
