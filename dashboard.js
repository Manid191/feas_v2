class DashboardManager {
    constructor() {
        this.container = document.getElementById('content-area');
        this.chartInstance = null;
        this.expenseChartInstance = null;
    }

    render(results) {
        this.container.innerHTML = `
            <div class="dashboard-container">
                <div class="action-bar-top">
                    <button class="btn btn-secondary" onclick="window.inputApps.renderInputs()">
                        <i class="fa-solid fa-arrow-left"></i> Back to Inputs
                    </button>
                    <h2 class="result-title">Feasibility Results</h2>
                </div>

                <!-- KPI Cards -->
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-icon icon-npv"><i class="fa-solid fa-sack-dollar"></i></div>
                        <div class="kpi-content">
                            <span>Project NPV</span>
                            <h3 class="${results.npv >= 0 ? 'text-success' : 'text-danger'}">
                                ${this.formatCurrency(results.npv)}
                            </h3>
                        </div>
                    </div>

                    <div class="kpi-card">
                        <div class="kpi-icon icon-npv"><i class="fa-solid fa-coins"></i></div>
                        <div class="kpi-content">
                            <span>Equity NPV</span>
                            <h3 class="${results.npvEquity >= 0 ? 'text-success' : 'text-danger'}">
                                ${this.formatCurrency(results.npvEquity)}
                            </h3>
                        </div>
                    </div>

                    <div class="kpi-card">
                        <div class="kpi-icon icon-irr"><i class="fa-solid fa-percent"></i></div>
                        <div class="kpi-content">
                            <span>Project IRR</span>
                            <h3 class="${results.irr >= 0.1 ? 'text-success' : 'text-warning'}">
                                ${results.irr.toFixed(2)} %
                            </h3>
                        </div>
                    </div>

                    <div class="kpi-card">
                        <div class="kpi-icon icon-irr"><i class="fa-solid fa-chart-line"></i></div>
                        <div class="kpi-content">
                            <span>Equity IRR (ROE)</span>
                            <h3 class="${results.irrEquity >= 0.1 ? 'text-success' : 'text-warning'}">
                                ${results.irrEquity.toFixed(2)} %
                            </h3>
                        </div>
                    </div>


                    <div class="kpi-card">
                        <div class="kpi-icon icon-lcoe"><i class="fa-solid fa-bolt"></i></div>
                        <div class="kpi-content">
                            <span>LCOE / Unit</span>
                            <h3>${results.lcoe.toFixed(2)} THB</h3>
                        </div>
                    </div>

                    <div class="kpi-card">
                        <div class="kpi-icon icon-payback"><i class="fa-solid fa-hourglass-half"></i></div>
                        <div class="kpi-content">
                            <span>Payback Period</span>
                            <h3>${results.payback.toFixed(2)} Years</h3>
                        </div>
                    </div>
                </div>

                <!-- Chart Section -->
                <div class="card glass-panel chart-panel">
                    <h3><i class="fa-solid fa-chart-bar"></i> Cash Flow Analysis</h3>
                    <div class="chart-container">
                        <canvas id="cashFlowChart"></canvas>
                    </div>
                </div>

                <!-- New Charts Row -->
                <div class="row" style="margin-top: 20px;">
                    <div class="card glass-panel full-width">
                        <div class="card-header" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                            <h3 style="margin:0;"><i class="fa-solid fa-chart-pie"></i> Detailed Expense Breakdown</h3>
                            
                            <div style="margin-left: auto; display: flex; gap: 10px; align-items: center;">
                                <label style="font-size: 0.85em;">From:</label>
                                <input type="number" id="expStartYear" class="input-compact" style="width: 50px;" value="1" min="1">
                                <label style="font-size: 0.85em;">To:</label>
                                <input type="number" id="expEndYear" class="input-compact" style="width: 50px;" value="${results.inputs.projectYears}" min="1">
                                
                                <select id="expGroupMode" class="input-compact" style="width: 120px;">
                                    <option value="detailed">Detailed Items</option>
                                    <option value="major">Major Groups</option>
                                </select>

                                <button class="btn btn-primary btn-sm" onclick="window.dashboardApp.updateExpenseChart()">
                                    Update
                                </button>
                            </div>
                        </div>
                        <div class="chart-container" style="height: 350px;">
                            <canvas id="expenseChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Detailed Table Section -->
                <div class="card glass-panel full-width" style="margin-top: 20px;">
                    <div class="card-header">
                         <h3><i class="fa-solid fa-table"></i> Detailed Cash Flow</h3>
                    </div>
                    <div id="detail-table-wrapper" style="overflow-x: auto; margin-top: 10px;">
                        <div id="detail-table-container"></div>
                    </div>
                </div>
            </div>
        `;

        // Wait for DOM then render chart
        requestAnimationFrame(() => {
            this.renderCharts(results);
            this.renderExpenseChart(results);
            this.renderDetailTable(results);
        });
    }

    renderCharts(results) {
        const ctx = document.getElementById('cashFlowChart').getContext('2d');
        const labels = results.cashFlows.map((_, i) => `Year ${i}`);

        // Prepare Data
        // Year 0 is usually investment (-ve), Year 1+ is operation
        // For better visualization, we might split Capex and Operating Cash Flow

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Project Cash Flow (Unlevered)',
                        data: results.cashFlows,
                        borderColor: 'rgb(54, 162, 235)', // Blue
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: false,
                        type: 'line',
                        order: 1
                    },
                    {
                        label: 'Fixed Cost',
                        data: results.details.annualFixedCost,
                        backgroundColor: 'rgba(255, 159, 64, 0.6)', // Orange
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1,
                        type: 'bar',
                        stack: 'costs',
                        order: 2
                    },
                    {
                        label: 'Variable Cost',
                        data: results.details.annualVariableCost,
                        backgroundColor: 'rgba(153, 102, 255, 0.6)', // Purple
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                        type: 'bar',
                        stack: 'costs',
                        order: 2
                    },
                    {
                        label: 'Finance Cost',
                        data: results.details.annualFinanceCost,
                        backgroundColor: 'rgba(201, 203, 207, 0.6)', // Grey
                        borderColor: 'rgba(201, 203, 207, 1)',
                        borderWidth: 1,
                        type: 'bar',
                        stack: 'costs',
                        order: 2
                    },
                    {
                        label: 'Cumulative Cash Flow',
                        data: results.cumulativeCashFlows,
                        borderColor: 'rgb(255, 99, 132)', // Red
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.1,
                        fill: false, // Changed to false to avoid overwhelming
                        type: 'line',
                        order: 0 // On Top
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#333'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += this.formatCurrency(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: false, // Allow negatives for CF
                        grid: {
                            color: '#e0e0e0'
                        },
                        ticks: {
                            color: '#333',
                            callback: (value) => {
                                if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                                return value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#333'
                        }
                    }
                }
            }
        });
    }

    formatCurrency(value) {
        if (Math.abs(value) >= 1000000) {
            return (value / 1000000).toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + ' M THB';
        }
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            maximumFractionDigits: 0
        }).format(value);
    }

    updateExpenseChart() {
        if (!this.lastResults) return;
        const start = parseInt(document.getElementById('expStartYear').value) || 1;
        const end = parseInt(document.getElementById('expEndYear').value) || this.lastResults.inputs.projectYears;
        const mode = document.getElementById('expGroupMode').value || 'detailed';

        this.renderExpenseChart(this.lastResults, start, end, mode);
    }

    renderExpenseChart(results, startYear = 1, endYear = null, mode = 'detailed') {
        const ctx = document.getElementById('expenseChart').getContext('2d');

        // Cache for updates
        this.lastResults = results;
        if (endYear === null) endYear = results.inputs.projectYears;

        // Ensure range validity
        if (startYear < 1) startYear = 1;
        if (endYear > results.inputs.projectYears) endYear = results.inputs.projectYears;
        if (startYear > endYear) startYear = endYear;

        // Aggregate Costs
        const totals = {};
        const add = (k, v) => totals[k] = (totals[k] || 0) + v;

        // Loop through selected years
        for (let y = startYear; y <= endYear; y++) {
            if (mode === 'detailed') {
                // 1. Detailed Items
                const yearData = results.details.annualItemizedOpex[y] || {};
                for (const [key, val] of Object.entries(yearData)) {
                    add(key, val);
                }
                // Finance & Tax manual add for detailed view
                add('Finance Cost', results.details.annualFinanceCost[y] || 0);
                add('Corporate Tax', results.details.annualTax[y] || 0);
            } else {
                // 2. Major Groups
                add('Fixed Cost', results.details.annualFixedCost[y] || 0);
                add('Variable Cost', results.details.annualVariableCost[y] || 0);
                add('Finance Cost', results.details.annualFinanceCost[y] || 0);
                add('Corporate Tax', results.details.annualTax[y] || 0);
            }
        }

        // Filter 0
        const finalTotals = {};
        for (const [k, v] of Object.entries(totals)) {
            if (v > 1) finalTotals[k] = v;
        }

        // Sort and Top
        let labels = [];
        let data = [];

        if (mode === 'major') {
            const order = ['Fixed Cost', 'Variable Cost', 'Finance Cost', 'Corporate Tax'];
            labels = order.filter(k => finalTotals[k] !== undefined);
            data = labels.map(k => finalTotals[k]);
        } else {
            const sortedEntries = Object.entries(finalTotals).sort((a, b) => b[1] - a[1]);
            let otherSum = 0;
            sortedEntries.forEach((entry, index) => {
                if (index < 8) {
                    labels.push(entry[0]);
                    data.push(entry[1]);
                } else {
                    otherSum += entry[1];
                }
            });
            if (otherSum > 0) {
                labels.push('Others');
                data.push(otherSum);
            }
        }

        // Colors
        const colorMap = {
            'Fixed Cost': 'rgba(255, 159, 64, 0.7)',
            'Variable Cost': 'rgba(153, 102, 255, 0.7)',
            'Finance Cost': 'rgba(201, 203, 207, 0.7)',
            'Corporate Tax': 'rgba(255, 99, 132, 0.7)',
            'Personnel Expenses': 'rgba(54, 162, 235, 0.7)',
            'Admin Expenses': 'rgba(255, 205, 86, 0.7)',
            'Fuel & Energy': 'rgba(75, 192, 192, 0.7)',
            'Maintenance': 'rgba(153, 102, 255, 0.7)',
            'Others': '#c9cbcf'
        };
        const defaultColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'];
        const backgroundColors = labels.map((l, i) => colorMap[l] || defaultColors[i % defaultColors.length]);

        if (this.expenseChartInstance) {
            this.expenseChartInstance.destroy();
        }

        this.expenseChartInstance = new Chart(ctx, {
            type: mode === 'major' ? 'pie' : 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        onClick: null // Disable clicking to hide
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const val = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = ((val / total) * 100).toFixed(1) + '%';
                                return `${context.label}: ${this.formatCurrency(val)} (${pct})`;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: `Expenses: Year ${startYear} - ${endYear} (${mode === 'major' ? 'Major Groups' : 'Detailed'})`
                    }
                }
            }
        });
    }

    renderDetailTable(results) {
        const container = document.getElementById('detail-table-container');
        const years = Array.from({ length: results.inputs.projectYears }, (_, i) => i + 1);

        // Removed Toggle button and hidden class
        let html = `<table class="data-table small-text" style="width:100%">
            <thead>
                <tr>
                    <th style="min-width: 120px;">Item</th>
                    ${years.map(y => `<th>Y${y}</th>`).join('')}
                </tr>
            </thead>
            <tbody>`;

        const addRow = (label, dataArr) => {
            html += `<tr>
                <td style="font-weight:bold;">${label}</td>
                ${years.map(y => {
                const val = dataArr[y] || 0;
                return `<td>${(val / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>`;
            }).join('')}
            </tr>`;
        };

        addRow('Revenue', results.details.annualRevenue);
        addRow('OpEx (Fixed)', results.details.annualFixedCost);
        addRow('EBITDA', results.details.annualEbitda);
        addRow('Net Income', results.details.annualNetIncome);
        html += `<tr style="background:#f0f0f0; font-weight:bold;">
                 <td>Free Cash Flow</td>
                 ${years.map(y => {
            const val = results.cashFlows[y] || 0;
            return `<td>${(val / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>`;
        }).join('')}
                 </tr>`;

        html += `</tbody></table>`;
        container.innerHTML = html;
    }
}

window.dashboardApp = new DashboardManager();
