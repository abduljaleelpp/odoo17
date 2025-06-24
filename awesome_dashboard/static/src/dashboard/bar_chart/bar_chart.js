/** @odoo-module */
import { loadJS } from "@web/core/assets";
import { getColor } from "@web/core/colors/colors";
import { Component, onWillStart, useRef, onMounted, onWillUpdateProps, onWillUnmount } from "@odoo/owl";

export class BarChart extends Component {
    static template = "awesome_dashboard.BarChart";
    static props = {
        label: String,
        data: Object,
        xAxisLabel: { type: String, optional: true },
        yAxisLabel: { type: String, optional: true },
        displayMillions: Boolean,
        indexAxis: { type: String, enum: ['x', 'y'], optional: true, default: 'y' },
    };

    setup() {
        this.canvasRef = useRef("canvas");
        this.chart = null;

        onWillStart(() => loadJS(["/web/static/lib/Chart/Chart.js"]));
        onMounted(() => this.renderChart());

        onWillUpdateProps((nextProps) => {
            if (this.chart) {
                this.chart.destroy();
            }
            this.renderChart(nextProps.data, nextProps.yAxisLabel, nextProps.xAxisLabel, nextProps.displayMillions, nextProps.indexAxis);
        });

        onWillUnmount(() => {
            if (this.chart) {
                this.chart.destroy();
            }
        });
    }

    formatNumberWithCommas(num) {
        if (typeof num !== 'number' || isNaN(num)) return '0';
        return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    renderChart(data = this.props.data, yAxisLabel = this.props.yAxisLabel, xAxisLabel = this.props.xAxisLabel, displayMillions = this.props.displayMillions, indexAxis = this.props.indexAxis) {
        const labels = Object.keys(data);
        const values = Object.values(data);
        const colors = labels.map((_, index) => getColor(index));

        const total = values.reduce((sum, value) => sum + value, 0);

        this.chart = new Chart(this.canvasRef.el, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: this.props.label,
                        data: values,
                        backgroundColor: colors,
                    },
                ],
            },
            options: {
                indexAxis: indexAxis,
                responsive: true,
                maintainAspectRatio: true,
                // Add this block to set the bar percentage
                // barPercentage: 0.5,  // Adjust this value as needed (0.0 to 1.0)
                // categoryPercentage: 0.8, // Adjust this value as needed (0.0 to 1.0)
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: indexAxis === 'y' ? xAxisLabel : yAxisLabel,
                        },
                        ticks: {
                            // Apply formatting only when x-axis shows values (indexAxis === 'y')
                            callback: function (value) {
                                if (indexAxis === 'y') {
                                    // X-axis shows values
                                    if (displayMillions) {
                                        return value / 1_000_000 + "M";
                                    }
                                    return value;
                                }
                                // X-axis shows labels (indexAxis === 'x'), so return the label directly
                                return labels[value];
                            },
                            maxRotation: indexAxis === 'x' ? 45 : 0,
                            minRotation: indexAxis === 'x' ? 45 : 0,
                            autoSkip: indexAxis === 'x' ? false : true,
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: indexAxis === 'y' ? yAxisLabel : xAxisLabel,
                        },
                        ticks: {
                            // Apply formatting only when y-axis shows values (indexAxis === 'x')
                            callback: function (value) {
                                if (indexAxis === 'x') {
                                    // Y-axis shows values
                                    if (displayMillions) {
                                        return value / 1_000_000 + "M";
                                    }
                                    return value;
                                }
                                // Y-axis shows labels (indexAxis === 'y'), so return the label directly
                                return labels[value];
                            },
                            autoSkip: indexAxis === 'y' ? false : true,
                        },
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const formattedValue = this.formatNumberWithCommas(value);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${formattedValue} (${percentage}%)`;
                            }.bind(this)
                        }
                    }
                },
            },
        });
    }
}