const apiKey = "AIzaSyBJ4Z6R7zhn9lCSN798FsqFI7kampyxbws";
// https://sheets.googleapis.com/v4/spreadsheets/1NDlQ2VmnsG3dMxci4oDB8OgmcSDvWoSBFoZz3htsgcw/values/Sheet1!A:D?key=AIzaSyAA4WB41zB6JjoxoK9cB7qK-rtkbQsqpss
async function authedGET(url) {
  return fetch(`${url}?key=${apiKey}`);
}

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const YEARS = [2022, 2023, 2024, 2025, 2026, 2027];

async function convertFirstRowIntoCols(values) {
  if (values.length > 1) {
    let res = [];
    const headers = values[0].map((v) => v.toLowerCase().replace(" ", ""));
    console.log({ headers });
    for (let i = 1; i < values.length; i++) {
      let obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = values[i][j];
      }
      res.push(obj);
    }
    return res;
  }

  return null;
}

const monthEl = document.getElementById("monthSelector");
const yearEl = document.getElementById("yearSelector");
const noDataEl = document.getElementById("noData");
const chartEl = document.getElementById("main");

MONTHS.forEach((month, i) => {
  const option = document.createElement("option");
  option.value = i;
  option.innerHTML = month;
  monthEl.appendChild(option);
});
YEARS.forEach((year) => {
  const option = document.createElement("option");
  option.value = year;
  option.innerHTML = year;
  yearEl.appendChild(option);
});

let data;

let selectedMonthIndex = null;
let selectedYear = null;
monthEl.addEventListener("change", (e) => {
  selectedMonthIndex = Number.parseInt(e.target.value);
  updateMonthYear();
});
yearEl.addEventListener("change", (e) => {
  selectedYear = e.target.value;
  updateMonthYear();
});

const updateMonthYear = () => {
  if (selectedYear != null && selectedMonthIndex != null) {
    showMonthYear(data, selectedMonthIndex + 1, selectedYear);
    currentMonthSelectedStr = `${MONTHS[selectedMonthIndex]}-${selectedYear}`;
  }
};

let myChart = echarts.init(document.getElementById("main"));
const tableCont = document.getElementById("tablecont");
const tableDwnldBtn = document.getElementById("tableDownloadBtn");

let dataToShow = {
  x: [],
  y: [],
};

const showMonthYear = (dataset, month, year) => {
  tableDwnldBtn.classList.remove("hidden"); // Tampilkan tombol download ketika ada setidaknya satu bulan dipilih

  dataToShow = {
    x: [],
    y: [],
  };

  // ============ Untuk chart ============
  for (let i = 0; i < dataset.length; i++) {
    const it = dataset[i];
    //  Filter by month and year

    const itDate = it[dateKey].split(" ")[0].split("/");
    const itMonth = Number.parseInt(itDate[0]);
    const itYear = itDate[2].length == 4 ? itDate[2] : `20${itDate[2]}`;

    console.log("tes", { itDate, itMonth, month, itYear, year });

    if (itMonth == month && itYear == year) {
      dataToShow.x.push(`${it[dateKey]} ${it[timeKey]}`);

      const B = 2.5;
      const Q = 1.76 * B * Math.pow(it[waterLevelKey], 3.0 / 2.0);

      if (Q < 0) {
        // Jika negatif, anggap 0
        dataToShow.y.push(0);
      } else {
        const Qrounded = Q.toFixed(2); // Dua angka dibelakang koma
        dataToShow.y.push(Qrounded);
      }
    }
  }

  if (dataToShow.x.length == 0 && dataToShow.y.length == 0) {
    noDataEl.classList.remove("hidden");
    tableCont.classList.add("hidden");
    chartEl.classList.add("hidden");
    tableDwnldBtn.classList.add("hidden");
    return;
  } else {
    noDataEl.classList.add("hidden");
    tableCont.classList.remove("hidden");
    chartEl.classList.remove("hidden");
    tableDwnldBtn.classList.remove("hidden");
  }

  // Specify the configuration items and data for the chart
  var option = {
    title: {
      text: "Debit Air per Bulan",
    },
    tooltip: {},
    legend: {
      data: ["Debit Air m³/detik"],
      show: false
    },
    xAxis: {
      data: dataToShow.x,
      name: "Tanggal",
      nameTextStyle: {
        fontWeight: 'bolder',
        fontSize: 18,
      },
      axisLabel: {
        // fontWeight: 'bolder',
        // fontSize: 18,
        formatter: (function(value){
          let label = value.split(" ")[0]
          if (label) {
            label = label.split("/")[1]
          }
          return label;
        })
      }
    },
    yAxis: {
      name: "Debit (m³/detik)",
      nameTextStyle: {
        fontWeight: 'bolder',
        fontSize: 18,
      },
      position: "left",
      nameLocation: "center",
    },
    series: [
      {
        name: "Debit Air m³/detik",
        type: "bar",
        data: dataToShow.y,
        // label: {
        //   show: true,
        //   // position: [5,-15], //put the label where you want
        //   // formatter: function(params){
        //   //   return params.name //display series name
        //   // }
        // }
      },
    ],
  };

  // Display the chart using the configuration items and data just specified.
  myChart.setOption(option);

  // ============ Untuk table ============
  tableCont.innerHTML = "";
  const tbl = document.createElement("table");
  tbl.id = "newCreatedTable";
  tbl.style.width = "100%";
  tbl.setAttribute("border", "1");
  const tbdy = document.createElement("tbody");

  // Buat header table
  const thead = document.createElement("tr"); // row
  thead.classList.add("tablehead");
  const thead1 = document.createElement("td"); // column waktu
  thead1.appendChild(document.createTextNode("Waktu"));
  const thead2 = document.createElement("td"); // column waktu
  thead2.appendChild(document.createTextNode("Debit Air m³/detik"));
  thead.appendChild(thead1);
  thead.appendChild(thead2);
  tbdy.appendChild(thead);

  for (let i = 0; i < dataToShow.x.length; i++) {
    const x = dataToShow.x[i];
    const y = dataToShow.y[i];

    const tr = document.createElement("tr"); // row
    const td1 = document.createElement("td"); // column waktu
    td1.appendChild(document.createTextNode(x));

    const td2 = document.createElement("td"); // column waktu
    td2.appendChild(document.createTextNode(`${y} m³/detik`));

    tr.appendChild(td1);
    tr.appendChild(td2);
    tbdy.appendChild(tr);
  }

  tbl.appendChild(tbdy);
  tableCont.appendChild(tbl);
};

let currentMonthSelectedStr = null;

authedGET(`${baseEndpoint}/${sheetName}!${columnKeyRange}`).then(async (v) => {
  const response = await v.json();
  const values = response.values;
  data = await convertFirstRowIntoCols(values);
  console.log({ response, data });

  // let availMonthYearStr = new Set();
  // for (let it of data) {
  //   availMonthYearStr.add(
  //     `${it["date"].split("/")[0]}-${it["date"].split("/")[2]}`
  //   );
  // }
});

// Quick and simple export target #table_id into a csv
function download_table_as_csv(table_id, separator = ",", fname = null) {
  // Select rows from table_id
  var rows = document.querySelectorAll("table#" + table_id + " tr");
  // console.log("rows", rows);
  // Construct csv
  var csv = [];
  for (var i = 0; i < rows.length; i++) {
    var row = [],
      cols = rows[i].querySelectorAll("td, th");
    for (var j = 0; j < cols.length; j++) {
      // Clean innertext to remove multiple spaces and jumpline (break csv)
      var data = cols[j].innerText
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace(/(\s\s)/gm, " ");
      // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
      data = data.replace(/"/g, '""');
      // Push escaped string
      row.push('"' + data + '"');
    }
    csv.push(row.join(separator));
  }
  var csv_string = csv.join("\n");
  // Download it

  var filename = fname
    ? fname
    : "export_" + table_id + "_" + new Date().toLocaleDateString() + ".csv";
  var link = document.createElement("a");
  link.style.display = "none";
  link.setAttribute("target", "_blank");
  link.setAttribute(
    "href",
    "data:text/csv;charset=utf-8," + encodeURIComponent(csv_string)
  );
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

tableDwnldBtn.addEventListener("click", () => {
  download_table_as_csv(
    "newCreatedTable",
    ",",
    `Export ${currentMonthSelectedStr}.csv`
  );
});
