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
const datePicker = document.getElementById("date-picker") as HTMLInputElement;
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
const DAYS = 5;
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
	scaleInterval: 3,
};
const PHLEVEL: ParameterType = {
	name: "pH level",
	minVal: 0,
	maxVal: 10,
	scaleInterval: 1,
};
const AMMONIALEVEL: ParameterType = {
	name: "Ammonia level",
	minVal: 0,
	maxVal: 8,
	scaleInterval: 0.8,
};
const OXYGENLEVEL: ParameterType = {
	name: "Oxygen level",
	minVal: 0,
	maxVal: 10,
	scaleInterval: 1,
};

// SIDE EFFECT VARIABLES
let barChartCanvas: ChartType;
let lineChartCanvas: ChartType;
// STATE VARIABLES
let parameterGlobalState: ParameterType;
let dateGlobalState: Date;
let dataGlobalState: DataStateType = {};
let lineChartXLabelGlobalState: string[];

// SIDE EFFECT FUNCTIONS
const renderMap = (parameter: ParameterType, data: number[]): void => {
	let area1Stop0Color,
		area2Stop0Color,
		area3Stop0Color,
		area1Stop10Color,
		area2Stop10Color,
		area3Stop10Color: string;
	for (
		let i = parameter.minVal, j = 0;
		i <= parameter.maxVal;
		i += parameter.scaleInterval, j += 1
	) {
		// this logic is up for debate, i may be confused
		if (i >= parameter.maxVal) j -= 1;
		if (i <= data[0]) {
			area1Stop0Color = COLOR0[j];
			area1Stop10Color = COLOR10[j];
		}
		if (i <= data[1]) {
			area2Stop0Color = COLOR0[j];
			area2Stop10Color = COLOR10[j];
		}
		if (i <= data[2]) {
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
const renderLineChart = (
	parameter: ParameterType,
	data: number[][],
	index: number,
	date: string[],
): void => {
	const parameterName =
		parameter.name === TEMPERATURE.name
			? parameter.name + " °C"
			: parameter.name;
	const area1 = data.map((i) => i[0]);
	const area2 = data.map((i) => i[1]);
	const area3 = data.map((i) => i[2]);
	const chartData = {
		labels: date,
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
		onClick: (e) => lineChartClick(e, parameter, data, date),
		plugins: {
			autocolors: false,
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
const renderBarScale = (parameter: ParameterType): void => {
	for (
		let i = parameter.minVal, j = 0;
		i <= parameter.maxVal;
		i += parameter.scaleInterval * 2, j++
	) {
		const element = document.getElementById(`bar-text-${j}`);
		if (element) element.textContent = i.toFixed(2);
	}
};
const renderAll = (
	parameter: ParameterType,
	data: number[][],
	index: number,
	date: string[],
) => {
	renderLineChart(parameter, data, index, date);
	renderBarChart(parameter, data[index]);
	renderMap(parameter, data[index]);
	renderBarScale(parameter);
};
// requires global state
const lineChartClick = (
	e: any,
	parameter: ParameterType,
	data: number[][],
	date: string[],
): void => {
	// @ts-ignore
	const canvasPosition = Chart.helpers.getRelativePosition(e, lineChartCanvas);
	const dataX = lineChartCanvas.scales.x.getValueForPixel(canvasPosition.x);
	// const dataY = lineChartCanvas.scales.y.getValueForPixel(canvasPosition.y);
	renderAll(parameter, data, dataX, date);
};
const selectParameter = async (e: any): Promise<void> => {
	const data = [];
	const lineChartXLabel = [];
	const text = e.target.innerText;
	let fetchedData: DataType[];
	dropdownMenuSelected.innerText = text;
	if (TEMPERATURE.name === text) parameterGlobalState = TEMPERATURE;
	if (PHLEVEL.name === text) parameterGlobalState = PHLEVEL;
	if (AMMONIALEVEL.name === text) parameterGlobalState = AMMONIALEVEL;
	if (OXYGENLEVEL.name === text) parameterGlobalState = OXYGENLEVEL;
	const key = parameterGlobalState.name + dateGlobalState;
	if (!dataGlobalState[key]) {
		const date = new Date(dateGlobalState);
		const to = new Date(
			date.setDate(date.getDate() + Math.round(DAYS / 2) - 1),
		);
		const from = new Date(
			date.setDate(date.getDate() - Math.round(DAYS / 2) - 2),
		);

		fetchedData = await fetchData(parameterGlobalState, DAYS, from, to);
		fetchedData.map((item: any) => {
			const date = item.timeGathered.toDate();
			const day = date.getDate();
			const month = date.getMonth();
			const year = date.getFullYear();
			lineChartXLabel.unshift(`${MONTHS[month]}/${day}/${year}`);
			data.push([item.area1, item.area2, item.area3]);
		});
	} else {
		dataGlobalState[key].map((item: any) => {
			const date = item.timeGathered.toDate();
			const day = date.getDate();
			const month = date.getMonth();
			const year = date.getFullYear();
			lineChartXLabel.unshift(`${MONTHS[month]}/${day}/${year}`);
			data.push([item.area1, item.area2, item.area3]);
		});
	}

	lineChartXLabelGlobalState = lineChartXLabel;
	renderAll(
		parameterGlobalState,
		data,
		data.length == 5 ? Math.round(data.length / 2) - 1 : data.length - 1,
		lineChartXLabelGlobalState,
	);
};
const playAnimation = (): void => {
	const key = parameterGlobalState.name + dateGlobalState;
	const data = [];
	dataGlobalState[key].map((item, index) => {
		data.push([item.area1, item.area2, item.area3]);
	});
	for (let i = 0; i < data.length; i++) {
		disableClickables(true);
		setTimeout(() => {
			renderAll(parameterGlobalState, data, i, lineChartXLabelGlobalState);
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
	from: Date,
	to: Date,
): Promise<DataType[]> => {
	const records = await firestore
		.collection("records")
		.where("parameter", "==", parameter.name)
		.where("timeGathered", ">=", from)
		.where("timeGathered", "<=", to)
		.orderBy("timeGathered", "desc")
		.limit(days)
		.get();
	const arr: DataType[] = [];
	records.forEach((doc) => {
		arr.push(doc.data());
	});
	if (arr.length === 0)
		document.getElementsByClassName("alert")[0].classList.add("show");
	return arr;
};

// EVENT LISTENERS
window.addEventListener("load", async (e) => {
	// @ts-ignore
	document
		.getElementsByClassName("btn-close")[0]
		.addEventListener("click", () => {
			document.getElementsByClassName("alert")[0].classList.remove("show");
		});

	const date = new Date("2022-04-13");

	datePicker.max = new Date().toISOString().split("T")[0];
	datePicker.valueAsDate = date;

	const to = new Date(date.setDate(date.getDate() + Math.round(DAYS / 2) - 1));
	const from = new Date(
		date.setDate(date.getDate() - Math.round(DAYS / 2) - 2),
	);
	const fetchedData = await fetchData(TEMPERATURE, DAYS, from, to);

	const lineChartXLabel = [];
	const data = [];
	fetchedData.map((item: any, index) => {
		const date = item.timeGathered.toDate();
		const day = date.getDate();
		const month = date.getMonth();
		const year = date.getFullYear();
		// const hour = date.getHours();
		// const minute = date.getMinutes();
		// const ampm = hour > 12 ? "pm" : "am";
		// `${hour > 12 ? hour - 12 : hour}:${minute} ${ampm}`;
		lineChartXLabel.unshift(`${MONTHS[month]}/${day}/${year}`);
		data.push([item.area1, item.area2, item.area3]);
	});

	// UPDATE GLOBAL STATE
	dateGlobalState = new Date("2022-04-13");
	const key = TEMPERATURE.name + dateGlobalState;
	dataGlobalState[key] = fetchedData;
	parameterGlobalState = TEMPERATURE;

	lineChartXLabelGlobalState = lineChartXLabel;
	renderAll(
		TEMPERATURE,
		data,
		data.length == 5 ? Math.round(data.length / 2) - 1 : data.length - 1,
		lineChartXLabel,
	);
});

Array.from(svgPaths).forEach((svgPath, index) => {
	svgPath.addEventListener("mouseover", () => svgPathMouseOver(index));
	svgPath.addEventListener("mouseleave", () => svgPathMouseLeave(index));
});
datePicker.addEventListener("change", async (e: Event) => {
	const date = new Date((e.target as HTMLInputElement).value);
	const to = new Date(date.setDate(date.getDate() + Math.round(DAYS / 2) - 1));
	const from = new Date(
		date.setDate(date.getDate() - Math.round(DAYS / 2) - 2),
	);
	const fetchedData = await fetchData(parameterGlobalState, DAYS, from, to);

	const lineChartXLabel = [];
	const data = [];
	fetchedData.map((item: any, index) => {
		const date = item.timeGathered.toDate();
		const day = date.getDate();
		const month = date.getMonth();
		const year = date.getFullYear();
		lineChartXLabel.unshift(`${MONTHS[month]}/${day}/${year}`);
		data.push([item.area1, item.area2, item.area3]);
	});
	dateGlobalState = new Date((e.target as HTMLInputElement).value);
	const key = parameterGlobalState.name + dateGlobalState;
	dataGlobalState[key] = fetchedData;
	lineChartXLabelGlobalState = lineChartXLabel;
	renderAll(
		parameterGlobalState,
		data,
		data.length == 5 ? Math.round(data.length / 2) - 1 : data.length - 1,
		lineChartXLabel,
	);
});
dropdownItemTemperature.addEventListener("click", (e) => selectParameter(e));
dropdownItemPHLevel.addEventListener("click", (e) => selectParameter(e));
dropdownItemAmmoniaLevel.addEventListener("click", (e) => selectParameter(e));
dropdownItemOxygenLevel.addEventListener("click", (e) => selectParameter(e));
playBtn.addEventListener("click", playAnimation);
