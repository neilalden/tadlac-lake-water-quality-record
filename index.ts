// INTERFACES
interface ChartType {
	[key: string]: any;
}
interface ParameterType {
	name: string;
	minVal: number;
	maxVal: number;
}
// HTML ELEMENTS
const dropdownItemTemperature = document.getElementById(
	"dropdown-item-temperature",
) as HTMLButtonElement;
const dropdownItemPHLevel = document.getElementById(
	"dropdown-item-ph-level",
) as HTMLButtonElement;
const dropdownItemAmmoniaLevel = document.getElementById(
	"dropdown-item-ammonia-level",
) as HTMLButtonElement;
const dropdownItemOxygenLevel = document.getElementById(
	"dropdown-item-oxygen-level",
) as HTMLButtonElement;
const playBtn = document.getElementById("play-btn") as HTMLButtonElement;
const barChart = document.getElementById("bar-chart") as HTMLCanvasElement;
const lineChart = document.getElementById("line-chart") as HTMLCanvasElement;
const dropdownMenuSelected = document.getElementById(
	"dropdown-menu-selected",
) as HTMLSpanElement;
const sensor1Stop0 = document.getElementById("sensor1-stop-0") as HTMLElement;
const sensor2Stop0 = document.getElementById("sensor2-stop-0") as HTMLElement;
const sensor3Stop0 = document.getElementById("sensor3-stop-0") as HTMLElement;
const sensor1Stop10 = document.getElementById("sensor1-stop-10") as HTMLElement;
const sensor2Stop10 = document.getElementById("sensor2-stop-10") as HTMLElement;
const sensor3Stop10 = document.getElementById("sensor3-stop-10") as HTMLElement;
const clickable = document.getElementsByClassName(
	"clickable",
) as HTMLCollection;

// CONSTANTS
const ANIMATIONSPEED = 500;
const DAYS = 14;
const TEMPERATURE: ParameterType = {
	name: "Temperature",
	minVal: 15,
	maxVal: 30,
};
const PHLEVEL: ParameterType = {
	name: "pH level",
	minVal: 6,
	maxVal: 9,
};
const AMMONIALEVEL: ParameterType = {
	name: "Ammonia level",
	minVal: 7,
	maxVal: 12,
};
const OXYGENLEVEL: ParameterType = {
	name: "Oxygen level",
	minVal: 2,
	maxVal: 5,
};

// SIDE EFFECT VARIABLES
let barChartCanvas: ChartType;
let lineChartCanvas: ChartType;
let dataTemp: number[][];
let parameterTemp: string;

// SIDE EFFECT FUNCTIONS
const renderBarChart = (parameter: string, dataArr: number[]): void => {
	const labels = ["Sensor 1", "Sensor 2", "Sensor 3"];
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
	// @ts-ignore
	barChartCanvas = new Chart(barChart, config);
};
const renderLineChart = (
	parameter: string,
	dataArr: number[][],
	index: number = null,
): void => {
	const sensor1 = dataArr.map((i) => i[0]);
	const sensor2 = dataArr.map((i) => i[1]);
	const sensor3 = dataArr.map((i) => i[2]);
	const labels = dataArr.map((i, index) => `Day ${index + 1}`);
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
		animation: false,
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
	// @ts-ignore
	lineChartCanvas = new Chart(lineChart, config);
};
const selectParameter = (e: any): void => {
	const text = e.target.innerText;
	dropdownMenuSelected.innerText = text;
	let dummyData: number[][];
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
	renderBarChart(text, dummyData[0]);
	renderLineChart(text, dummyData);
};
const disableClickables = (isClickable: boolean): void => {
	for (let i = 0; i < clickable.length; i++) {
		(clickable[i] as HTMLButtonElement).disabled = isClickable;
	}
};
const animateMap = (data: number[]): void => {
	const COLOR0 = ["#b3b300", "#b39800", "#b37400", "#b33000", "#800000"];
	const COLOR10 = ["yellow", "gold", "orange", "#ff4500", "red"];
	let sensor1Stop0Color,
		sensor2Stop0Color,
		sensor3Stop0Color,
		sensor1Stop10Color,
		sensor2Stop10Color,
		sensor3Stop10Color: string;
	for (let i = 15, j = 0; i <= 30; i += 3, j++) {
		if (i < data[0]) {
			sensor1Stop0Color = COLOR0[j];
			sensor1Stop10Color = COLOR10[j];
		}
		if (i < data[1]) {
			sensor2Stop0Color = COLOR0[j];
			sensor2Stop10Color = COLOR10[j];
		}
		if (i < data[2]) {
			sensor3Stop0Color = COLOR0[j];
			sensor3Stop10Color = COLOR10[j];
		}
	}
	if (data[0] >= 30) {
		sensor1Stop0Color = COLOR0[COLOR0.length - 1];
		sensor1Stop10Color = COLOR10[COLOR10.length - 1];
	}
	if (data[1] >= 30) {
		sensor2Stop0Color = COLOR0[COLOR0.length - 1];
		sensor2Stop10Color = COLOR10[COLOR10.length - 1];
	}
	if (data[2] >= 30) {
		sensor3Stop0Color = COLOR0[COLOR0.length - 1];
		sensor3Stop10Color = COLOR10[COLOR10.length - 1];
	}
	sensor1Stop0.setAttribute("style", `stop-color: ${sensor1Stop0Color}`);
	sensor2Stop0.setAttribute("style", `stop-color: ${sensor2Stop0Color}`);
	sensor3Stop0.setAttribute("style", `stop-color: ${sensor3Stop0Color}`);
	sensor1Stop10.setAttribute("style", `stop-color: ${sensor1Stop10Color}`);
	sensor2Stop10.setAttribute("style", `stop-color: ${sensor2Stop10Color}`);
	sensor3Stop10.setAttribute("style", `stop-color: ${sensor3Stop10Color}`);
};
const playAnimation = (): void => {
	disableClickables(true);
	for (let i = 0; i < DAYS; i++) {
		setTimeout(() => {
			animateMap(dataTemp[i]);
			renderLineChart(parameterTemp, dataTemp, i);
			renderBarChart(parameterTemp, dataTemp[i]);
			if (i === DAYS - 1) disableClickables(false);
		}, i * ANIMATIONSPEED);
	}
};

// FRUITFUL FUNCTIONS
const generateDailyDummyData = (
	days: number,
	min: number,
	max: number,
): number[][] => {
	const arr: number[][] = [];
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
	const dummyData = generateDailyDummyData(
		DAYS,
		TEMPERATURE.minVal,
		TEMPERATURE.maxVal,
	);
	parameterTemp = TEMPERATURE.name;
	dataTemp = dummyData;
	renderBarChart(TEMPERATURE.name, dummyData[0]);
	renderLineChart(TEMPERATURE.name, dummyData);
});
playBtn.addEventListener("click", playAnimation);
dropdownItemTemperature.addEventListener("click", (e) => selectParameter(e));
dropdownItemPHLevel.addEventListener("click", (e) => selectParameter(e));
dropdownItemAmmoniaLevel.addEventListener("click", (e) => selectParameter(e));
dropdownItemOxygenLevel.addEventListener("click", (e) => selectParameter(e));
