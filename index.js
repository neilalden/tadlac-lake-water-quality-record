const dropdownItemTemperature = document.getElementById(
	"dropdown-item-temperature",
);
const dropdownItemPHLevel = document.getElementById("dropdown-item-ph-level");
const dropdownItemAmmoniaLevel = document.getElementById(
	"dropdown-item-ammonia-level",
);
const dropdownItemOxygenLevel = document.getElementById(
	"dropdown-item-oxygen-level",
);
const playBtn = document.getElementById("play-btn");
const barChart = document.getElementById("bar-chart");
const lineChart = document.getElementById("line-chart");
const dropdownMenuSelected = document.getElementById("dropdown-menu-selected");
const area1Stop0 = document.getElementById("area1-stop-0");
const area2Stop0 = document.getElementById("area2-stop-0");
const area3Stop0 = document.getElementById("area3-stop-0");
const area1Stop10 = document.getElementById("area1-stop-10");
const area2Stop10 = document.getElementById("area2-stop-10");
const area3Stop10 = document.getElementById("area3-stop-10");
const clickables = document.getElementsByClassName("clickable");
const svgPaths = document.getElementsByTagName("path");
const ANIMATIONSPEED = 500;
const DAYS = 14;
const TEMPERATURE = {
	name: "Temperature",
	minVal: 20,
	maxVal: 30,
};
const PHLEVEL = {
	name: "pH level",
	minVal: 6,
	maxVal: 9,
};
const AMMONIALEVEL = {
	name: "Ammonia level",
	minVal: 7,
	maxVal: 12,
};
const OXYGENLEVEL = {
	name: "Oxygen level",
	minVal: 2,
	maxVal: 5,
};
// SIDE EFFECT VARIABLES
let barChartCanvas;
let lineChartCanvas;
let dataTemp;
let parameterTemp;
const renderBarChart = (parameter, dataArr) => {
	const labels = ["Area 1", "Area 2", "Area 3"];
	const data = {
		labels: labels,
		datasets: [
			{
				label: parameter,
				data: [dataArr[0], dataArr[1], dataArr[2]],
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
			animation: { duration: 400 },
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
	barChartCanvas = new Chart(barChart, config);
};
const renderLineChart = (parameter, dataArr, index) => {
	const area1 = dataArr.map((i) => i[0]);
	const area2 = dataArr.map((i) => i[1]);
	const area3 = dataArr.map((i) => i[2]);
	const labels = dataArr.map((i, index) => `Day ${index + 1}`);
	const data = {
		labels: labels,
		datasets: [
			{
				label: `Area 1 ${parameter}`,
				data: area1,
				fill: false,
				borderColor: "rgb(136, 200, 247)",
				tension: 0.2,
			},
			{
				label: `Area 2 ${parameter}`,
				data: area2,
				fill: false,
				borderColor: "rgb(17, 146, 238)",
				tension: 0.2,
			},
			{
				label: `Area 3 ${parameter}`,
				data: area3,
				fill: false,
				borderColor: "rgb(12, 102, 167)",
				tension: 0.2,
			},
		],
	};
	const options = {
		animation: false,
		events: ["click"],
		onClick: (e) => lineChartClick(e),
		plugins: {
			autocolors: false,
			annotation: {
				annotations: {
					line1: {
						type: "line",
						mode: "vertical",
						xMin: index != null ? index : dataArr.length - 1,
						xMax: index != null ? index : dataArr.length - 1,
						borderColor: "red",
						borderWidth: 3,
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
	lineChartCanvas = new Chart(lineChart, config);
};
const selectParameter = (e) => {
	const text = e.target.innerText;
	dropdownMenuSelected.innerText = text;
	let dummyData;
	if (text === TEMPERATURE.name)
		dummyData = generateDailyDummyData(
			DAYS,
			TEMPERATURE.minVal,
			TEMPERATURE.maxVal,
		);
	if (text === PHLEVEL.name)
		dummyData = generateDailyDummyData(DAYS, PHLEVEL.minVal, PHLEVEL.maxVal);
	if (text === AMMONIALEVEL.name)
		dummyData = generateDailyDummyData(
			DAYS,
			AMMONIALEVEL.minVal,
			AMMONIALEVEL.maxVal,
		);
	if (text === OXYGENLEVEL.name)
		dummyData = generateDailyDummyData(
			DAYS,
			OXYGENLEVEL.minVal,
			OXYGENLEVEL.maxVal,
		);
	parameterTemp = text;
	dataTemp = dummyData;
	renderLineChart(text, dummyData, DAYS - 1);
	renderBarChart(text, dummyData[DAYS - 1]);
	animateMap(dataTemp[DAYS - 1]);
};
const disableClickables = (isClickable) => {
	Array.from(clickables).forEach(
		(clickable) => (clickable.disabled = isClickable),
	);
};
const animateMap = (data) => {
	const COLOR0 = ["#b3b300", "#b39800", "#b37400", "#b33000", "#800000"];
	const COLOR10 = ["yellow", "gold", "orange", "#ff4500", "red"];
	let area1Stop0Color,
		area2Stop0Color,
		area3Stop0Color,
		area1Stop10Color,
		area2Stop10Color,
		area3Stop10Color;
	for (let i = 15, j = 0; i <= 30; i += 3, j++) {
		if (j >= COLOR0.length) j--;
		if (i < data[0]) {
			area1Stop0Color = COLOR0[j];
			area1Stop10Color = COLOR10[j];
		}
		if (i < data[1]) {
			area2Stop0Color = COLOR0[j];
			area2Stop10Color = COLOR10[j];
		}
		if (i < data[2]) {
			area3Stop0Color = COLOR0[j];
			area3Stop10Color = COLOR10[j];
		}
	}
	area1Stop0.setAttribute("style", `stop-color: ${area1Stop0Color}`);
	area2Stop0.setAttribute("style", `stop-color: ${area2Stop0Color}`);
	area3Stop0.setAttribute("style", `stop-color: ${area3Stop0Color}`);
	area1Stop10.setAttribute("style", `stop-color: ${area1Stop10Color}`);
	area2Stop10.setAttribute("style", `stop-color: ${area2Stop10Color}`);
	area3Stop10.setAttribute("style", `stop-color: ${area3Stop10Color}`);
};
const playAnimation = () => {
	disableClickables(true);
	for (let i = 0; i < DAYS; i++) {
		setTimeout(() => {
			renderLineChart(parameterTemp, dataTemp, i);
			renderBarChart(parameterTemp, dataTemp[i]);
			animateMap(dataTemp[i]);
			if (i === DAYS - 1) disableClickables(false);
		}, i * ANIMATIONSPEED);
	}
};
const lineChartClick = (e) => {
	const canvasPosition = Chart.helpers.getRelativePosition(e, lineChartCanvas);
	const dataX = lineChartCanvas.scales.x.getValueForPixel(canvasPosition.x);
	renderLineChart(parameterTemp, dataTemp, dataX);
	renderBarChart(parameterTemp, dataTemp[dataX]);
	animateMap(dataTemp[dataX]);
};
const svgPathMouseOver = (i) => {
	document.getElementById(`area-text-${i + 1}`).style.visibility = "visible";
};
const svgPathMouseLeave = (i) => {
	document.getElementById(`area-text-${i + 1}`).style.visibility = "hidden";
};
const generateDailyDummyData = (days, min, max) => {
	const arr = [];
	for (let i = 0; i < days; i++) {
		const area1 = Math.random() * (max - min + 1) + min;
		const area2 = Math.random() * (max - min + 1) + min;
		const area3 = Math.random() * (max - min + 1) + min;
		arr.push([
			parseFloat(area1.toFixed(2)),
			parseFloat(area2.toFixed(2)),
			parseFloat(area3.toFixed(2)),
		]);
	}
	return arr;
};
window.addEventListener("load", (e) => {
	const dummyData = generateDailyDummyData(
		DAYS,
		TEMPERATURE.minVal,
		TEMPERATURE.maxVal,
	);
	parameterTemp = TEMPERATURE.name;
	dataTemp = dummyData;
	renderLineChart(TEMPERATURE.name, dummyData, DAYS - 1);
	renderBarChart(TEMPERATURE.name, dummyData[DAYS - 1]);
	animateMap(dummyData[DAYS - 1]);
});
playBtn.addEventListener("click", playAnimation);
dropdownItemTemperature.addEventListener("click", (e) => selectParameter(e));
dropdownItemPHLevel.addEventListener("click", (e) => selectParameter(e));
dropdownItemAmmoniaLevel.addEventListener("click", (e) => selectParameter(e));
dropdownItemOxygenLevel.addEventListener("click", (e) => selectParameter(e));
Array.from(svgPaths).forEach((svgPath, index) => {
	svgPath.addEventListener("mouseover", () => svgPathMouseOver(index));
	svgPath.addEventListener("mouseleave", () => svgPathMouseLeave(index));
});
