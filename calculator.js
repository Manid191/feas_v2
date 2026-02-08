/**
 * FinancialCalculator
 * Core financial math functions for Feasibility Studies.
 */
const FinancialCalculator = {

    /**
     * Calculate Net Present Value (NPV)
     * @param {number} rate - Discount rate (decimal, e.g., 0.05 for 5%)
     * @param {number[]} cashFlows - Array of annual cash flows (0 is Year 0)
     * @returns {number} NPV value
     */
    npv: function (rate, cashFlows) {
        let npv = 0;
        for (let t = 0; t < cashFlows.length; t++) {
            npv += cashFlows[t] / Math.pow(1 + rate, t);
        }
        return npv;
    },

    /**
     * Calculate Internal Rate of Return (IRR)
     * Uses Newton-Raphson approximation
     * @param {number[]} cashFlows - Array of annual cash flows
     * @param {number} guess - Initial guess (default 0.1)
     * @returns {number} IRR value (decimal) or NaN if no convergence
     */
    irr: function (cashFlows, guess = 0.1) {
        const loopMax = 1000;
        const epsilon = 0.0000001;

        let x0 = guess;
        let x1;

        for (let i = 0; i < loopMax; i++) {
            const fValue = this.npv(x0, cashFlows);

            // Derivative of NPV with respect to rate
            // d(NPV)/dr = sum(-t * CFt / (1+r)^(t+1))
            let fDerivative = 0;
            for (let t = 0; t < cashFlows.length; t++) {
                fDerivative += -t * cashFlows[t] / Math.pow(1 + x0, t + 1);
            }

            if (Math.abs(fDerivative) < epsilon) {
                return x0; // Slope too flat, return current guess
            }

            x1 = x0 - fValue / fDerivative;

            if (Math.abs(x1 - x0) <= epsilon) {
                return x1;
            }

            x0 = x1;
        }
        return NaN; // Failed to converge
    },

    /**
     * Calculate Levelized Cost of Electricity (LCOE)
     * LCOE = Sum(Costs_t / (1+r)^t) / Sum(Energy_t / (1+r)^t)
     * @param {number} discountRate - Discount rate
     * @param {number[]} costs - Annual costs (Capex + Opex + Fuel)
     * @param {number[]} energy - Annual energy production (kWh)
     * @returns {number} LCOE value
     */
    lcoe: function (discountRate, costs, energyGen) {
        const totalDiscountedCosts = this.npv(discountRate, costs);

        // Discounted Energy Generation (Phisical quantity discounted same as money in LCOE standard)
        // Note: Sometimes simple sum is used, but standard LCOE uses discounted energy too.
        let totalDiscountedEnergy = 0;
        for (let t = 0; t < energyGen.length; t++) {
            totalDiscountedEnergy += energyGen[t] / Math.pow(1 + discountRate, t);
        }

        if (totalDiscountedEnergy === 0) return 0;
        return totalDiscountedCosts / totalDiscountedEnergy;
    },

    /**
     * Calculate Payback Period
     * @param {number[]} cashFlows 
     * @returns {number} Years to payback (float)
     */
    paybackPeriod: function (cashFlows) {
        let cumulative = 0;
        for (let i = 0; i < cashFlows.length; i++) {
            cumulative += cashFlows[i];

            if (cumulative >= 0) {
                // Interpolate for fraction of year
                const prevCumulative = cumulative - cashFlows[i];
                const fraction = Math.abs(prevCumulative) / cashFlows[i];
                return (i - 1) + fraction; // i is 0-based year index (Year 0, 1, 2...)
                // Year 0 usually negative (investment). If Year 0 covers it? unlikely.
                // Usually payback starts counting from operations (Year 1). 
                // Adjust logic accordingly: 
                // If i=3 is the first positive year, it means end of year 3.
                // If we treat Year 0 as construction, standard payback is usually from start of operation.
            }
        }
        return -1; // Never pays back
    },

    /**
     * Create straight line depreciation schedule
     * @param {number} capex 
     * @param {number} years 
     * @param {number} salvageValue 
     */
    getDepreciationSchedule: function (capex, years, salvageValue = 0) {
        const annualDep = (capex - salvageValue) / years;
        return Array(years).fill(annualDep);
    },

    /**
     * Calculate Annual Payment (PMT)
     * @param {number} rate - Annual interest rate (decimal)
     * @param {number} nper - Number of periods (years)
     * @param {number} pv - Present Value (Loan Amount)
     * @returns {number} Annual payment (positive value)
     */
    pmt: function (rate, nper, pv) {
        if (rate === 0) return pv / nper;
        const pvif = Math.pow(1 + rate, nper);
        return pv * rate * (pvif / (pvif - 1));
    }
};

window.FinancialCalculator = FinancialCalculator;
