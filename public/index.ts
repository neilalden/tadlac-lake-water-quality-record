// INTERFACES & TYPES
interface ChartType {
	[key: string]: any;
}
interface ParameterType {
	name: string;
	minVal: number;
	maxVal: number;
	scaleInterval: number;
}
interface DataType {
	timeGathered: Date;
	parameter: string;
	area1: number;
	area2: number;
	area3: number;
}
interface DataStateType {
	[key: string]: any;
}
// @ts-ignore
const firestore = firebase.firestore();
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
const dropdownMenuSelected = document.getElementById(
	"dropdown-menu-selected",
) as HTMLSpanElement;
const barChart = document.getElementById("bar-chart") as HTMLCanvasElement;
const lineChart = document.getElementById("line-chart") as HTMLCanvasElement;
const area1Stop0 = document.getElementById("area1-stop-0") as HTMLElement;
const area2Stop0 = document.getElementById("area2-stop-0") as HTMLElement;
const area3Stop0 = document.getElementById("area3-stop-0") as HTMLElement;
const area1Stop10 = document.getElementById("area1-stop-10") as HTMLElement;
const area2Stop10 = document.getElementById("area2-stop-10") as HTMLElement;
const area3Stop10 = document.getElementById("area3-stop-10") as HTMLElement;
const clickables = document.getElementsByClassName(
	"clickable",
) as HTMLCollection;
const svgPaths = document.getElementsByTagName("path") as HTMLCollection;
const barScaleUnits = document.getElementsByClassName(
	"bar-text",
) as HTMLCollection;

// CONSTANTS
const ANIMATIONSPEED = 500;
const DAYS = 14;
const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"June",
	"July",
	"Aug",
	"Sept",
	"Oct",
	"Nov",
	"Dec",
];
const COLOR0 = [
	"#007399",
	"#248f8f",
	"#00b36b",
	"#33cc00",
	"#99cc00",
	"#b3b300",
	"#b39800",
	"#b37400",
	"#b33000",
	"#800000",
];
const COLOR10 = [
	"#0099cc",
	"#33cccc",
	"#00ff99",
	"#66ff33",
	"#ccff33",
	"yellow",
	"gold",
	"orange",
	"#ff4500",
	"red",
];
const TEMPERATURE: ParameterType = {
	name: "Temperature",
	minVal: 0,
	maxVal: 30,
	scaleInterval: 6,
};
const PHLEVEL: ParameterType = {
	name: "pH level",
	minVal: 0,
	maxVal: 10,
	scaleInterval: 2,
};
const AMMONIALEVEL: ParameterType = {
	name: "Ammonia level",
	minVal: 0,
	maxVal: 8,
	scaleInterval: 1.6,
};
const OXYGENLEVEL: ParameterType = {
	name: "Oxygen level",
	minVal: 0,
	maxVal: 10,
	scaleInterval: 2,
};

// SIDE EFFECT VARIABLES
let barChartCanvas: ChartType;
let lineChartCanvas: ChartType;
let parameterState: ParameterType;

// STATE VARIABLES
const dataState: DataStateType = {};

// SIDE EFFECT FUNCTIONS
const renderBarChart = (parameter: ParameterType, data: number[]): void => {
	const parameterName =
		parameter.name === TEMPERATURE.name
			? parameter.name + " °C"
			: parameter.name;

	const labels = ["Area 1", "Area 2", "Area 3"];
	const chartData = {
		labels: labels,
		datasets: [
			{
				label: parameterName,
				data: [data[0], data[1], data[2]],
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
		data: chartData,
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
	parameter: ParameterType,
	data: number[][],
	index: number,
	date = null,
): void => {
	const parameterName =
		parameter.name === TEMPERATURE.name
			? parameter.name + " °C"
			: parameter.name;
	const area1 = data.map((i) => i[0]);
	const area2 = data.map((i) => i[1]);
	const area3 = data.map((i) => i[2]);
	const labels = data.map((i, index) => `Day ${index + 1}`);
	const chartData = {
		labels: date ? date : labels,
		datasets: [
			{
				label: `Area 1 ${parameterName}`,
				data: area1,
				fill: false,
				borderColor: "rgb(136, 200, 247)",
				tension: 0.2,
			},
			{
				label: `Area 2 ${parameterName}`,
				data: area2,
				fill: false,
				borderColor: "rgb(17, 146, 238)",
				tension: 0.2,
			},
			{
				label: `Area 3 ${parameterName}`,
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
		onClick: (e) => lineChartClick(e, parameter, data),
		plugins: {
			autocolors: false,
			legend: {
				display: false,
				events: [],
			},
			annotation: {
				annotations: {
					line1: {
						type: "line",
						mode: "vertical",
						xMin: index != null ? index : data.length - 1,
						xMax: index != null ? index : data.length - 1,
						borderColor: "red",
						borderWidth: 3,
					},
				},
			},
		},
	};
	const config = {
		type: "line",
		data: chartData,
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
const renderMap = (parameter: ParameterType, data: number[]): void => {
	let area1Stop0Color,
		area2Stop0Color,
		area3Stop0Color,
		area1Stop10Color,
		area2Stop10Color,
		area3Stop10Color: string;
	for (
		let i = parameter.minVal, j = 1;
		i <= parameter.maxVal;
		i += parameter.scaleInterval, j += 2
	) {
		// this logic is up for debate, i may be confused
		if (i >= parameter.maxVal) j -= 2;
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

	area1Stop0.setAttribute(
		"style",
		`stop-color: ${area1Stop0Color ? area1Stop0Color : "#9cc0fa"}`,
	);
	area2Stop0.setAttribute(
		"style",
		`stop-color: ${area2Stop0Color ? area2Stop0Color : "#9cc0fa"}`,
	);
	area3Stop0.setAttribute(
		"style",
		`stop-color: ${area3Stop0Color ? area3Stop0Color : "#9cc0fa"}`,
	);
	area1Stop10.setAttribute(
		"style",
		`stop-color: ${area1Stop10Color ? area1Stop10Color : "#9cc0fa"}`,
	);
	area2Stop10.setAttribute(
		"style",
		`stop-color: ${area2Stop10Color ? area2Stop10Color : "#9cc0fa"}`,
	);
	area3Stop10.setAttribute(
		"style",
		`stop-color: ${area3Stop10Color ? area3Stop10Color : "#9cc0fa"}`,
	);
};
const renderBarScale = (parameter: ParameterType): void => {
	for (
		let i = parameter.minVal + parameter.scaleInterval, j = 0;
		i <= parameter.maxVal;
		i += parameter.scaleInterval, j++
	)
		document.getElementById(`bar-text-${j + 1}`).textContent = i.toFixed(2);
};
const renderAll = (parameter, data, i, date = null) => {
	renderLineChart(parameter, data, i, date);
	renderBarChart(parameter, data[i]);
	renderMap(parameter, data[i]);
	renderBarScale(parameter);
};
const lineChartClick = (
	e: any,
	parameter: ParameterType,
	data: number[][],
): void => {
	// @ts-ignore
	const canvasPosition = Chart.helpers.getRelativePosition(e, lineChartCanvas);
	const dataX = lineChartCanvas.scales.x.getValueForPixel(canvasPosition.x);
	// const dataY = lineChartCanvas.scales.y.getValueForPixel(canvasPosition.y);
	renderAll(parameter, data, dataX);
};
// selectParameter && playAnimation requires global state
const selectParameter = async (e: any): Promise<void> => {
	const text = e.target.innerText;
	let fetchedData: DataType[];
	const data = [];
	dropdownMenuSelected.innerText = text;
	if (TEMPERATURE.name === text) parameterState = TEMPERATURE;
	if (PHLEVEL.name === text) parameterState = PHLEVEL;
	if (AMMONIALEVEL.name === text) parameterState = AMMONIALEVEL;
	if (OXYGENLEVEL.name === text) parameterState = OXYGENLEVEL;
	const key = parameterState.name;
	if (!dataState[key]) {
		fetchedData = await fetchData(parameterState, DAYS);
		fetchedData.map((item) => {
			data.push([item.area1, item.area2, item.area3]);
		});
	} else {
		dataState[key].map((item) => {
			data.push([item.area1, item.area2, item.area3]);
		});
	}

	renderAll(parameterState, data, data.length - 1);
};
const playAnimation = (): void => {
	const key = parameterState.name;
	const data = [];
	dataState[key].map((item, index) => {
		data.push([item.area1, item.area2, item.area3]);
	});
	for (let i = 0; i < data.length; i++) {
		disableClickables(true);
		setTimeout(() => {
			renderAll(parameterState, data, i);
			if (i === data.length - 1) disableClickables(false);
		}, i * ANIMATIONSPEED);
	}
};
const disableClickables = (isClickable: boolean): void => {
	Array.from(clickables).forEach(
		(clickable) => ((clickable as HTMLButtonElement).disabled = isClickable),
	);
};
const svgPathMouseOver = (i: number): void => {
	document.getElementById(`area-text-${i + 1}`).style.visibility = "visible";
};
const svgPathMouseLeave = (i: number): void => {
	document.getElementById(`area-text-${i + 1}`).style.visibility = "hidden";
};
const fetchData = async (
	parameter: ParameterType,
	days: number,
): Promise<DataType[]> => {
	const records = await firestore
		.collection("records")
		.where("parameter", "==", parameter.name)
		.orderBy("timeGathered", "desc")
		.limit(days)
		.get();
	const arr: DataType[] = [];
	records.forEach((doc) => {
		arr.push(doc.data());
	});
	return arr;
};
// EVENT LISTENERS
window.addEventListener("load", async (e) => {
	const fetchedData = await fetchData(TEMPERATURE, DAYS);

	// UPDATE GLOBAL STATE
	parameterState = TEMPERATURE;
	const key = parameterState.name;
	dataState[key] = fetchedData;

	const lineChartXLabel = [];
	const data = [];
	fetchedData.map((item: any, index) => {
		data.push([item.area1, item.area2, item.area3]);
		const date = item.timeGathered.toDate();
		const day = date.getDate();
		const month = date.getMonth();
		const year = date.getFullYear();
		// const hour = date.getHours();
		// const minute = date.getMinutes();
		// const ampm = hour > 12 ? "pm" : "am";
		// `${hour > 12 ? hour - 12 : hour}:${minute} ${ampm}`;
		lineChartXLabel.unshift(`${MONTHS[month]}/${day}/${year}`);
	});
	renderAll(TEMPERATURE, data, data.length - 1, lineChartXLabel);
});
Array.from(svgPaths).forEach((svgPath, index) => {
	svgPath.addEventListener("mouseover", () => svgPathMouseOver(index));
	svgPath.addEventListener("mouseleave", () => svgPathMouseLeave(index));
});
playBtn.addEventListener("click", playAnimation);
dropdownItemTemperature.addEventListener("click", (e) => selectParameter(e));
dropdownItemPHLevel.addEventListener("click", (e) => selectParameter(e));
dropdownItemAmmoniaLevel.addEventListener("click", (e) => selectParameter(e));
dropdownItemOxygenLevel.addEventListener("click", (e) => selectParameter(e));

// FRUITFUL FUNCTIONS
// const generateDailyDummyData = (
// 	days: number,
// 	min: number,
// 	max: number,
// ): number[][] => {
// 	const arr: number[][] = [];
// 	for (let i = 0; i < days; i++) {
// 		const area1 = Math.random() * (max - min + 1) + min;
// 		const area2 = Math.random() * (max - min + 1) + min;
// 		const area3 = Math.random() * (max - min + 1) + min;
// 		arr.push([
// 			parseFloat(area1.toFixed(2)),
// 			parseFloat(area2.toFixed(2)),
// 			parseFloat(area3.toFixed(2)),
// 		]);
// 	}
// 	return arr;
// };
