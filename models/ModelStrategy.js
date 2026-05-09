class ModelStrategy {
    constructor(name) {
        this.name = name;
    }

    /**
     * Calculates revenue and energy input/output for a specific year.
     * @param {Object} inputs - The full inputs object
     * @param {number} year - The current project year (1-based)
     * @param {Object} params - Context params { degradationFactor, escalationFactor, days }
     * @returns {Object} { revenue, totalEnergy }
     */
    calculateRevenue(inputs, year, params) {
        throw new Error("Method 'calculateRevenue' must be implemented.");
    }

    /**
     * Unified Electricity Tariff revenue calculator based on the 4 provided schemas:
     * FIT, ADDER, TOU, and DISCOUNT.
     */
    calculateElectricityTariff(inputs, genPeakDaily, genOffPeakDaily, year, params) {
        const { degradationFactor, escalationFactor, days } = params;
        const revSettings = inputs.revenue || {};
        const tariffType = revSettings.tariffType || 'TOU';

        const totalDailyGen = genPeakDaily + genOffPeakDaily;
        const annualTotalEnergy = totalDailyGen * days * degradationFactor;

        let revenue = 0;

        if (tariffType === 'FIT') {
            const fitF = (parseFloat(revSettings.fitF) || parseFloat(revSettings.peakRate) || 0) * escalationFactor;
            const fitV = (parseFloat(revSettings.fitV) || 0) * escalationFactor;
            const fitPremium = parseFloat(revSettings.fitPremium) || 0;
            const fitPremiumYears = parseInt(revSettings.fitPremiumYears) || 0;

            let currentFitRate = fitF + fitV;
            if (year <= fitPremiumYears) currentFitRate += fitPremium;

            revenue = annualTotalEnergy * currentFitRate;

        } else if (tariffType === 'ADDER') {
            const baseRate = (parseFloat(revSettings.baseRate) || 0) * escalationFactor;
            const ftRate = (parseFloat(revSettings.ftRate) || 0) * escalationFactor;
            const adderPrice = parseFloat(revSettings.adderPrice) || 0;
            const adderYears = parseInt(revSettings.adderYears) || 0;

            let currentPrice = baseRate + ftRate;
            if (year <= adderYears) currentPrice += adderPrice;

            revenue = annualTotalEnergy * currentPrice;

        } else if (tariffType === 'TOU') {
            const peakRate = (parseFloat(revSettings.peakRate) || 0) * escalationFactor;
            const offPeakRate = (parseFloat(revSettings.offPeakRate) || 0) * escalationFactor;
            const ftRate = (parseFloat(revSettings.ftRate) || 0) * escalationFactor;
            const holidays = parseInt(revSettings.holidays) || 115;
            const weekdays = Math.max(0, days - holidays);
            const serviceFee = parseFloat(revSettings.serviceFee) || 0;

            const annualPeakUnits = genPeakDaily * weekdays * degradationFactor;
            const annualOffPeakUnits = ((genOffPeakDaily * weekdays) + (totalDailyGen * holidays)) * degradationFactor;

            const energyCost = (annualPeakUnits * peakRate) + (annualOffPeakUnits * offPeakRate);
            const ftCost = (annualPeakUnits + annualOffPeakUnits) * ftRate;

            // Equation: (Cost + Service_Fee_Annual + Ft_Total) * 1.07
            revenue = (energyCost + (serviceFee * 12) + ftCost) * 1.07;

        } else if (tariffType === 'DISCOUNT') {
            const peaRate = (parseFloat(revSettings.peaMeaRate) || 0) * escalationFactor;
            const discount = (parseFloat(revSettings.discountPercent) || 0) / 100;
            const netPrice = peaRate * (1 - discount);

            revenue = annualTotalEnergy * netPrice;
        }

        return {
            revenue,
            totalEnergy: annualTotalEnergy
        };
    }
}
