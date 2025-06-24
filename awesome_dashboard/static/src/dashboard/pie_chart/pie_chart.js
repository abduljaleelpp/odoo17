/** @odoo-module */
import { loadJS } from "@web/core/assets";
import { getColor } from "@web/core/colors/colors";
import { Component, onWillStart, useRef, onMounted, onWillUpdateProps, onWillUnmount } from "@odoo/owl";

export class PieChart extends Component {
    static template = "awesome_dashboard.PieChart";
    static props = {
        label: String,
        data: Object,
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
            this.renderChart(nextProps.data);
        });

        onWillUnmount(() => {
            if (this.chart) {
                this.chart.destroy();
            }
        });
    }

    renderChart(data = this.props.data) {
        const labels = Object.keys(data);
        const values = Object.values(data);
        const colors = labels.map((_, index) => getColor(index));
        
        // Calculate total for percentage
        const total = values.reduce((sum, value) => sum + value, 0);

        this.chart = new Chart(this.canvasRef.el, {
            type: "doughnut",
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
                responsive: true,
                maintainAspectRatio: true, // Keep aspect ratio
                aspectRatio: 1, // 1:1 ratio for a square doughnut chart
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const formattedValue = context.formattedValue; // e.g., "50,000"
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${formattedValue} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}