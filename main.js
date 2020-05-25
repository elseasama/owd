var presentCovidStat = [];
var pageCount = 1;
var activePage = 1;

var getData = (url) => {
    return fetch(url).then((res) => {
        return res.json();
    }).then(json => {
        getPresentData(json);
    })
}

function checkIfUndefined(data, placeHolder) {
    if(data !== undefined && data !== "")
        return data;
    return placeHolder;
}

function editData(data) {
    let editedData = {
        location: checkIfUndefined(data.location,"Not available"),
        aged_65_older: checkIfUndefined(data.aged_65_older,"Not available"),
        diabetes_prevalence: checkIfUndefined(data.diabetes_prevalence,"Not available"),
        gdp_per_capita: checkIfUndefined(data.gdp_per_capita,"Not available"),
        median_age: checkIfUndefined(data.median_age,"Not available"),
        new_deaths: checkIfUndefined(data.new_deaths,"Not available"),
        population: checkIfUndefined(data.population,"Not available"),
        total_cases: checkIfUndefined(data.total_cases,"Not available"),
        total_cases_per_million: checkIfUndefined(data.total_cases_per_million,"Not available"),
        total_deaths: checkIfUndefined(data.total_deaths,"Not available"),
        total_deaths_per_million: checkIfUndefined(data.total_deaths_per_million,"Not available"),
        new_cases: checkIfUndefined(data.new_cases,"Not available"),
    }
    return editedData;
}

getPresentData = (json) => {
    let totalStats = json;
    var countryKeys = Object.keys(totalStats);
    countryKeys.forEach((key, index) => {
        let countryTotalStats = totalStats[key];
        let presentData = countryTotalStats[countryTotalStats.length - 1]
        presentData.new_cases = presentData.total_cases - countryTotalStats[countryTotalStats.length - 2].total_cases;
        presentCovidStat.push(editData(presentData));

        if((index + 1) % 20 === 0)
            pageCount = pageCount + 1;
    });
    console.log(presentCovidStat)
    render(presentCovidStat);
    renderPageNos(pageCount);

    document.querySelectorAll(".pagination .page").forEach(page => {
        page.addEventListener("click", changePage);
    })
}

function renderPageNos(count = pageCount) {
    var pageNo = "";
    var pageDiv = document.getElementsByClassName("pagination")[0];

    for(let i =1; i<=count; i++) {
        pageNo = pageNo + `<span class="page">${i}</span>`;
    }
    pageDiv.innerHTML = pageNo;
}

function changePage(e) {
    let pageNo = Number(e.target.innerHTML);
    activePage = pageNo;

    document.querySelectorAll(".pagination .page").forEach(page => {
        if(page.className.includes("active")) {
            page.className = "page";
        }
    });
    e.target.className = "page active";
    render(presentCovidStat);
}

function render(data) {
    var table = document.getElementById("showData");
    
    var tableData = "";

    data.forEach((stat, index) => {
        let from = (activePage * 20) - 20;
        let to = activePage * 20;
        if(index >= from && index < to) {
            tableData = tableData + `<tr>
            <td>${index + 1}</td>
            <td>${stat.location}</td>
            <td>${stat.total_cases}</td>
            <td class="${stat.new_cases > 0 ? "warning" : ""}">${stat.new_cases}</td>
            <td>${stat.total_deaths}</td>
            <td class="${stat.new_deaths > 0 ? "negative" : ""}">${stat.new_deaths}</td>
            <td>${stat.median_age}</td>
            <td>${stat.total_cases_per_million}</td>
            <td>${stat.total_deaths_per_million}</td>
            <td>${stat.population}</td><tr/>`
        }
    })

    table.getElementsByTagName("tbody")[0].innerHTML = tableData;
}

function sortTable(e) {
    let availableSorts = ["location", "total_cases", "median_age", "total_cases_per_million", "total_deaths_per_million", "new_cases", "total_deaths", "new_deaths", "population"]
    let sortBy = availableSorts.find(opt => e.target.className.indexOf(opt) !== -1);

    presentCovidStat.sort((a, b) => {
        let start = a[sortBy] === "Not available" ? 0 : a[sortBy];
        let end = b[sortBy] === "Not available" ? 0 : b[sortBy];
        console.log(start, end);
        return start - end;
    });

    if(e.target.className.includes("ascending")) {
        e.target.className = sortBy + " descending";
        render(presentCovidStat.reverse());
    } else if(e.target.className.includes("descending")) {
        e.target.className = sortBy + " ascending";
        render(presentCovidStat);
    } else {
        if(document.querySelector("#showData th.ascending"))
            document.querySelector("#showData th.ascending").className = document.querySelector("#showData th.ascending").className.replace(" ascending", "")
        else if(document.querySelector("#showData th.descending"))
            document.querySelector("#showData th.descending").className = document.querySelector("#showData th.descending").className.replace(" descending", "")

        e.target.className = sortBy + " descending";
        render(presentCovidStat.reverse());
    }
}

document.querySelectorAll("table th").forEach(thead => {
    thead.addEventListener("click", sortTable);
})

getData("https://covid.ourworldindata.org/data/owid-covid-data.json");