// HTML ELEMENTS
const dropdownItemTemperature = document.getElementById("dropdown-item-temperature");
const dropdownItemPHLevel = document.getElementById("dropdown-item-ph-level");
const dropdownItemAmmoniaLevel = document.getElementById("dropdown-item-ammonia-level");
const dropdownItemOxygenLevel = document.getElementById("dropdown-item-oxygen-level");
const dropdownMenuSelected = document.getElementById("dropdown-menu-selected");
const barChart = document.getElementById("bar-chart");
const lineChart = document.getElementById("line-chart");
// SIDE EFFECT VARIABLES
let barChartCanvas;
let lineChartCanvas;
// SIDE EFFECT FUNCTIONS
const renderBarChart = (parameter, arrData) => {
    const labels = ["Sensor 1", "Sensor 2", "Sensor 3"];
    const data = {
        labels: labels,
        datasets: [
            {
                label: parameter,
                data: [arrData[0], arrData[1], arrData[2]],
                backgroundColor: [
                    "rgba(136, 200, 247, 0.2)",
                    "rgba(17, 146, 238, 0.2)",
                    "rgba(12, 102, 167, 0.2)",
                ],
                borderColor: [
                    "rgb(136, 200, 247)",
                    "rgb(17, 146, 238)",
                    "rgb(12, 102, 167)",
                ],
                borderWidth: 1,
            },
        ],
    };
    const config = {
        type: "bar",
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    };
    if (barChartCanvas) {
        barChartCanvas.destroy();
        barChart.style.height = "38.1vh";
        barChart.style.width = "40vw";
    }
    // @ts-ignore
    barChartCanvas = new Chart(barChart, config);
};
const renderLineChart = (parameter, arrData) => {
    const sensor1 = arrData.map((i) => i[0]);
    const sensor2 = arrData.map((i) => i[1]);
    const sensor3 = arrData.map((i) => i[2]);
    const labels = arrData.map((i, index) => `Day ${index + 1}`);
    const data = {
        labels: labels,
        datasets: [
            {
                label: `Sensor 1 ${parameter}`,
                data: sensor1,
                fill: false,
                borderColor: "rgb(136, 200, 247)",
                tension: 0.2,
            },
            {
                label: `Sensor 2 ${parameter}`,
                data: sensor2,
                fill: false,
                borderColor: "rgb(17, 146, 238)",
                tension: 0.2,
            },
            {
                label: `Sensor 3 ${parameter}`,
                data: sensor3,
                fill: false,
                borderColor: "rgb(12, 102, 167)",
                tension: 0.2,
            },
        ],
    };
    const options = {
        plugins: {
            autocolors: false,
            annotation: {
                annotations: {
                    line1: {
                        type: "line",
                        mode: "vertical",
                        xMin: 13,
                        xMax: 13,
                        borderColor: "red",
                        borderWidth: 2,
                        // label: {
                        // 	content: "TODAY",
                        // 	enabled: true,
                        // 	position: "bottom",
                        // },
                    },
                },
            },
        },
    };
    const config = {
        type: "line",
        data: data,
        options,
    };
    if (lineChartCanvas) {
        lineChartCanvas.destroy();
        lineChart.style.height = "38.1vh";
        lineChart.style.width = "40vw";
    }
    // @ts-ignore
    lineChartCanvas = new Chart(lineChart, config);
};
const selectParameter = (e) => {
    const text = e.target.innerText;
    dropdownMenuSelected.innerText = text;
    let dummyData;
    if (text === "Temperature")
        dummyData = generateDailyDummyData(14, 20, 30);
    if (text === "pH level")
        dummyData = generateDailyDummyData(14, 7, 8);
    if (text === "Ammonia level")
        dummyData = generateDailyDummyData(14, 7, 12);
    if (text === "Oxygen level")
        dummyData = generateDailyDummyData(14, 2, 5);
    renderBarChart(text, dummyData[0]);
    renderLineChart(text, dummyData);
};
// FRUITFUL FUNCTIONS
const generateDailyDummyData = (days, min, max) => {
    const arr = [];
    for (let i = 0; i < days; i++) {
        const sensor1 = Math.random() * (max - min + 1) + min;
        const sensor2 = Math.random() * (max - min + 1) + min;
        const sensor3 = Math.random() * (max - min + 1) + min;
        arr.push([
            parseFloat(sensor1.toFixed(2)),
            parseFloat(sensor2.toFixed(2)),
            parseFloat(sensor3.toFixed(2)),
        ]);
    }
    return arr;
};
// EVENT LISTENERS
window.addEventListener("load", (e) => {
    const dummyData = generateDailyDummyData(14, 20, 30);
    renderBarChart("Temperature", dummyData[0]);
    renderLineChart("Temperature", dummyData);
});
dropdownItemTemperature.addEventListener("click", (e) => selectParameter(e));
dropdownItemPHLevel.addEventListener("click", (e) => selectParameter(e));
dropdownItemAmmoniaLevel.addEventListener("click", (e) => selectParameter(e));
dropdownItemOxygenLevel.addEventListener("click", (e) => selectParameter(e));
