/** @odoo-module */
import { Component, onWillStart, useRef, onWillUpdateProps } from "@odoo/owl";
import { useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class DataTable extends Component {
    static template = "awesome_dashboard.DataTable";
    static props = {
        data: { type: [Object, Array, { value: null }], optional: true },
        label: { type: String, optional: true },
        headers: { type: Array, element: String },
        isSold: { type: Boolean, optional: true, default: false },
        weightKey: { type: String, optional: true },
        rowColorConfig: {
            type: Object,
            optional: true,
            shape: {
                field: { type: String },
                classMap: { type: Object },
            },
        },
        config: {
            type: Object,
            optional: true,
            default: { enablePagination: false, itemsPerPage: 10 },
            shape: {
                enablePagination: { type: Boolean, optional: true, default: false },
                itemsPerPage: { type: Number, optional: true, default: 10 },
            },
        },
    };

    getRowClass(row) {
        if (!this.props.rowColorConfig || !row[this.props.rowColorConfig.field]) {
            return "";
        }
        const fieldValue = row[this.props.rowColorConfig.field];
        return this.props.rowColorConfig.classMap[fieldValue] || "";
    }

    setup() {
        this.orm = useService("orm");
        this.tableRef = useRef("unitTable");

        this.state = useState({
            unitTypeData: [],
            headerKeys: [],
            headerToKeyMap: {},
            normalizedHeaders: [],
            totals: {},
            averages: {},
            minimums: {},
            maximums: {},
            columnTypes: {},
            currentPage: 1, // Track current page
            totalPages: 1,  // Track total number of pages
        });

        onWillStart(async () => {
            try {
                await this.fetchData(this.props.data);
            } catch (error) {
                console.error("Error in onWillStart fetchData:", error);
                throw error;
            }
        });

        onWillUpdateProps(async (nextProps) => {
            try {
                await this.fetchData(nextProps.data);
                this.state.currentPage = 1; // Reset to first page on data update
            } catch (error) {
                console.error("Error in onWillUpdateProps fetchData:", error);
            }
        });
    }

    async fetchData(data) {
        // Reset state
        this.state.unitTypeData = [];
        this.state.headerKeys = [];
        this.state.headerToKeyMap = {};
        this.state.normalizedHeaders = [];
        this.state.totals = {};
        this.state.averages = {};
        this.state.minimums = {};
        this.state.maximums = {};
        this.state.columnTypes = {};
        this.state.currentPage = 1;
        this.state.totalPages = 1;

        if (!data || (Array.isArray(data) && data.length === 0)) {
            return;
        }

        const dataArray = Array.isArray(data) ? data : [data];
        const dataKeys = Object.keys(dataArray[0]);

        // Normalize a string for comparison
        const normalizeKey = (str) => {
            return str.toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/\(%\)/g, '');
        };

        // Normalize headers and store them
        this.state.normalizedHeaders = this.props.headers.map(header => normalizeKey(header));

        // Map headers to data keys
        this.props.headers.forEach((header, index) => {
            const normalizedHeader = this.state.normalizedHeaders[index];
            const matchingKey = dataKeys.find((key) => {
                const normalizedKey = normalizeKey(key);
                return normalizedKey === normalizedHeader;
            });

            if (matchingKey) {
                this.state.headerToKeyMap[header] = matchingKey;
                this.state.headerKeys.push(matchingKey);
            }
        });

        const totals = {};
        const weightedSums = {};
        const weightSums = {};
        const minimums = {};
        const maximums = {};
        const columnTypes = {};
        const counts = {};

        this.state.headerKeys.forEach((key) => {
            totals[key] = 0;
            weightedSums[key] = 0;
            weightSums[key] = 0;
            minimums[key] = null;
            maximums[key] = null;
            columnTypes[key] = null;
            counts[key] = 0;
        });

        const weightKey = this.props.weightKey;

        // Process each row
        const unitTypeData = dataArray.map(row => {
            const mappedRow = {};
            let rowWeight = 1;

            if (weightKey && row[weightKey] !== undefined) {
                const weightValue = parseFloat(row[weightKey]);
                rowWeight = isNaN(weightValue) ? 0 : weightValue;
            }

            this.state.headerKeys.forEach((key) => {
                const rawValue = row[key];
                let value;

                if (Array.isArray(rawValue)) {
                    value = rawValue[1] || "Unknown";
                    columnTypes[key] = 'string';
                } else if (typeof rawValue === 'string') {
                    value = rawValue || "Unknown";
                    columnTypes[key] = 'string';
                } else if (typeof rawValue === 'number' && !isNaN(rawValue)) {
                    value = rawValue;
                    columnTypes[key] = 'number';
                    totals[key] += value;
                    counts[key] += 1;
                    weightedSums[key] += value * rowWeight;
                    weightSums[key] += rowWeight;
                    if (minimums[key] === null || value < minimums[key]) {
                        minimums[key] = value;
                    }
                    if (maximums[key] === null || value > maximums[key]) {
                        maximums[key] = value;
                    }
                } else {
                    const parsedValue = parseFloat(rawValue);
                    if (!isNaN(parsedValue)) {
                        value = parsedValue;
                        columnTypes[key] = 'number';
                        totals[key] += value;
                        counts[key] += 1;
                        weightedSums[key] += value * rowWeight;
                        weightSums[key] += rowWeight;
                        if (minimums[key] === null || value < minimums[key]) {
                            minimums[key] = value;
                        }
                        if (maximums[key] === null || value > maximums[key]) {
                            maximums[key] = value;
                        }
                    } else {
                        value = rawValue || "Unknown";
                        columnTypes[key] = 'string';
                    }
                }

                mappedRow[key] = value;
            });
            return mappedRow;
        });

        // Compute weighted averages
        this.state.headerKeys.forEach((key, index) => {
            const normalizedHeader = this.state.normalizedHeaders[index];
            if (columnTypes[key] === 'number' && counts[key] > 0) {
                if (normalizedHeader.includes('average') && weightKey && weightSums[key] > 0) {
                    this.state.averages[key] = weightedSums[key] / weightSums[key];
                } else {
                    this.state.averages[key] = totals[key] / counts[key];
                }
            } else {
                this.state.averages[key] = 0;
            }
        });

        this.state.unitTypeData = unitTypeData;
        this.state.totals = totals;
        this.state.minimums = minimums;
        this.state.maximums = maximums;
        this.state.columnTypes = columnTypes;

        // Calculate total pages based on itemsPerPage
        if (this.props.config.enablePagination) {
            this.state.totalPages = Math.ceil(unitTypeData.length / this.props.config.itemsPerPage);
        }
    }

    // Get paginated data
    get paginatedData() {
        if (!this.props.config.enablePagination) {
            return this.state.unitTypeData;
        }
        const start = (this.state.currentPage - 1) * this.props.config.itemsPerPage;
        const end = start + this.props.config.itemsPerPage;
        return this.state.unitTypeData.slice(start, end);
    }

    // Pagination controls
    goToPreviousPage() {
        if (this.state.currentPage > 1) {
            this.state.currentPage -= 1;
        }
    }

    goToNextPage() {
        if (this.state.currentPage < this.state.totalPages) {
            this.state.currentPage += 1;
        }
    }

    formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) return '0';
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        if (Number.isInteger(num)) {
            return num.toString();
        }
        const formatted = num.toFixed(2);
        return parseFloat(formatted).toString();
    }

    formatInteger(num) {
        if (typeof num !== 'number' || isNaN(num)) return '0';
        return Math.floor(num).toString();
    }
}