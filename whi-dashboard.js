// ===================================================================
// Constants
// ===================================================================

const COLOR_SCALE = [
    [0,    "#67001f"],
    [0.17, "#b2182b"],
    [0.33, "#d6604d"],
    [0.5,  "#f7f7f7"],
    [0.67, "#92c5de"],
    [0.83, "#2166ac"],
    [1,    "#053061"]
];
const COLOR_COUNTRIES = ["#1f77b4", "#ff7f0e", "#2ca02c", "#9467bd", "#8c564b"];
const REGION_COLORS = {
    "Western Europe":"#1f77b4","North America":"#ff7f0e",
    "Australia and New Zealand":"#2ca02c","Latin America and Caribbean":"#d62728",
    "Eastern Asia":"#9467bd","Southeastern Asia":"#8c564b",
    "Central and Eastern Europe":"#e377c2","Middle East and Northern Africa":"#7f7f7f",
    "Sub-Saharan Africa":"#bcbd22","Southern Asia":"#17becf"
};
const ISO_CODES = {
    "Finland":"FIN","Denmark":"DNK","Iceland":"ISL","Israel":"ISR","Netherlands":"NLD",
    "Sweden":"SWE","Norway":"NOR","Luxembourg":"LUX","Switzerland":"CHE","Australia":"AUS",
    "New Zealand":"NZL","Costa Rica":"CRI","Canada":"CAN","Germany":"DEU","United Kingdom":"GBR",
    "Ireland":"IRL","United States":"USA","Czech Republic":"CZE","Belgium":"BEL","France":"FRA",
    "Austria":"AUT","Singapore":"SGP","Taiwan":"TWN","Taiwan Province of China":"TWN",
    "Romania":"ROU","Uruguay":"URY","Japan":"JPN","South Korea":"KOR","Slovenia":"SVN",
    "Italy":"ITA","Spain":"ESP","Poland":"POL","Lithuania":"LTU","Latvia":"LVA","Estonia":"EST",
    "Slovak Republic":"SVK","Hungary":"HUN","Cyprus":"CYP","Greece":"GRC","Portugal":"PRT",
    "Croatia":"HRV","Montenegro":"MNE","Serbia":"SRB","Brazil":"BRA","Mexico":"MEX","Chile":"CHL",
    "Argentina":"ARG","Colombia":"COL","Peru":"PER","Bolivia":"BOL","Ecuador":"ECU","Paraguay":"PRY",
    "Venezuela":"VEN","Nicaragua":"NIC","Panama":"PAN","Guatemala":"GTM","Honduras":"HND",
    "El Salvador":"SLV","Dominican Republic":"DOM","Jamaica":"JAM","Trinidad and Tobago":"TTO",
    "Trinidad & Tobago":"TTO","China":"CHN","Hong Kong":"HKG","Hong Kong S.A.R. of China":"HKG",
    "Thailand":"THA","Malaysia":"MYS","Philippines":"PHL","Indonesia":"IDN","Vietnam":"VNM",
    "Cambodia":"KHM","Myanmar":"MMR","Laos":"LAO","Mongolia":"MNG","India":"IND","Pakistan":"PAK",
    "Bangladesh":"BGD","Nepal":"NPL","Sri Lanka":"LKA","Bhutan":"BTN","Afghanistan":"AFG",
    "Iran":"IRN","Iraq":"IRQ","Turkey":"TUR","Lebanon":"LBN","Jordan":"JOR","Saudi Arabia":"SAU",
    "Kuwait":"KWT","Qatar":"QAT","Bahrain":"BHR","United Arab Emirates":"ARE","Oman":"OMN",
    "Yemen":"YEM","Syria":"SYR","Palestinian Territories":"PSE","State of Palestine":"PSE",
    "Egypt":"EGY","Libya":"LBY","Tunisia":"TUN","Algeria":"DZA","Morocco":"MAR","Sudan":"SDN",
    "Ethiopia":"ETH","Kenya":"KEN","Tanzania":"TZA","Uganda":"UGA","Rwanda":"RWA",
    "Mozambique":"MOZ","Zimbabwe":"ZWE","Zambia":"ZMB","Malawi":"MWI","Madagascar":"MDG",
    "Botswana":"BWA","Namibia":"NAM","South Africa":"ZAF","Lesotho":"LSO","Eswatini":"SWZ",
    "Ghana":"GHA","Nigeria":"NGA","Cameroon":"CMR","Senegal":"SEN","Ivory Coast":"CIV",
    "Mali":"MLI","Burkina Faso":"BFA","Niger":"NER","Chad":"TCD","Guinea":"GIN","Benin":"BEN",
    "Togo":"TGO","Sierra Leone":"SLE","Liberia":"LBR","Gambia":"GMB","Mauritania":"MRT",
    "Gabon":"GAB","Congo (Brazzaville)":"COG","Congo (Kinshasa)":"COD",
    "Central African Republic":"CAF","Burundi":"BDI","Somalia":"SOM","Djibouti":"DJI",
    "Comoros":"COM","Russia":"RUS","Ukraine":"UKR","Belarus":"BLR","Moldova":"MDA",
    "Georgia":"GEO","Armenia":"ARM","Azerbaijan":"AZE","Kazakhstan":"KAZ","Uzbekistan":"UZB",
    "Kyrgyzstan":"KGZ","Tajikistan":"TJK","Turkmenistan":"TKM","Albania":"ALB",
    "Bosnia and Herzegovina":"BIH","Kosovo":"XKX","Macedonia":"MKD",
    "North Macedonia":"MKD","Bulgaria":"BGR","Mauritius":"MUS","South Sudan":"SSD",
    "Niger":"NER","Namibia":"NAM","Chad":"TCD"
};

const LAYOUT_BASE = {
    paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "Inter, sans-serif", size: 11, color: "#1a1a1a" },
    hoverlabel: { bgcolor: "white", bordercolor: "#e0e0e0", font: { family: "Inter", size: 11 } }
};
const PLOTLY_CFG = { displayModeBar: false, responsive: true };

// ===================================================================
// State
// ===================================================================

let allData = [];
let selectedYear = 2025;
let selectedRegion = "";
let selectedCountries = [];
let mapMode = "selection";
let statMode = "mean";   // "mean" | "median"
let ts = null;

// ===================================================================
// Helpers
// ===================================================================

function mean(arr) {
    return arr.length ? arr.reduce((a,b) => a+b, 0) / arr.length : 0;
}

function scoreToColor(s) {
    const norm = Math.max(0, Math.min(1, (s - 2) / 6));
    for (let i = COLOR_SCALE.length - 1; i >= 0; i--) {
        if (norm >= COLOR_SCALE[i][0]) return COLOR_SCALE[i][1];
    }
    return COLOR_SCALE[0][1];
}

function linearRegression(xs, ys) {
    const n = xs.length;
    const mx = mean(xs), my = mean(ys);
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
        num += (xs[i]-mx) * (ys[i]-my);
        den += (xs[i]-mx) ** 2;
    }
    const m = den ? num/den : 0;
    const b = my - m * mx;
    const yPred = xs.map(x => m*x + b);
    const ssTot = ys.reduce((s,y) => s + (y-my)**2, 0);
    const ssRes = ys.reduce((s,y,i) => s + (y-yPred[i])**2, 0);
    const r2 = ssTot ? 1 - ssRes/ssTot : 0;
    const r  = Math.sign(m) * Math.sqrt(Math.max(0, r2));
    return { m, b, r, r2 };
}

function pearson(xs, ys) {
    const mx = mean(xs), my = mean(ys);
    let num = 0, dx2 = 0, dy2 = 0;
    for (let i = 0; i < xs.length; i++) {
        num  += (xs[i]-mx) * (ys[i]-my);
        dx2  += (xs[i]-mx) ** 2;
        dy2  += (ys[i]-my) ** 2;
    }
    return (dx2 && dy2) ? num / Math.sqrt(dx2 * dy2) : 0;
}

function getFilteredData() {
    let d = allData.filter(r => r.Year === selectedYear);
    if (selectedRegion) d = d.filter(r => r.Region === selectedRegion);
    return d;
}

// Find the latest year that has GDP factor data (fallback for years without factors)
function getLatestFactorYear() {
    const years = [...new Set(allData.map(d => d.Year))].filter(Boolean).sort((a,b) => b-a);
    for (const y of years) {
        const hasFactors = allData.some(d =>
            d.Year === y && d.GDP && !isNaN(+d.GDP) && +d.GDP > 0
        );
        if (hasFactors) return y;
    }
    return null;
}

// Get score for a country in a given year
function getCountryScore(country, year) {
    const row = allData.find(d => d.Country === country && d.Year === year);
    return row ? +row["Happiness Score"] : null;
}

// ===================================================================
// Stat Mode Toggle (Ø / Median)
// ===================================================================

function setStatMode(mode) {
    statMode = mode;
    document.getElementById("btnMean").className   = "toggle-btn" + (mode === "mean"   ? " active" : "");
    document.getElementById("btnMedian").className = "toggle-btn" + (mode === "median" ? " active" : "");
    document.getElementById("kpiAvgLabel").textContent = mode === "mean" ? "Durchschnitt" : "Median";
    updateKPIs(getFilteredData());
    drawSparkline();
}

// ===================================================================
// KPI Cards
// ===================================================================

function updateKPIs(data) {
    const sorted = [...data]
        .filter(d => d["Happiness Rank"] && d["Happiness Score"])
        .sort((a,b) => +a["Happiness Rank"] - +b["Happiness Rank"]);

    const scores = data.map(d => +d["Happiness Score"]).filter(v => !isNaN(v) && v > 0);
    const curAvg = scores.length ? mean(scores) : null;
    // Use the most recent year with actual data before selectedYear (handles 2024 gap)
    const allAvailYears = [...new Set(allData.map(d => d.Year))].filter(y => y < selectedYear).sort((a,b) => b-a);
    const prevYear = allAvailYears.length ? allAvailYears[0] : null;
    const prevData = prevYear ? allData.filter(r => r.Year === prevYear) : [];

    // Spitzenreiter
    if (sorted.length > 0) {
        const best = sorted[0];
        const bestScore = +best["Happiness Score"];
        const bestPrev  = getCountryScore(best.Country, prevYear);
        const avgScore  = curAvg ? ((bestScore - curAvg) / curAvg * 100).toFixed(0) : null;
        const avgDist   = curAvg ? (bestScore - curAvg) : null;

        // Calculate streak (how many consecutive years on top)
        let streak = 0;
        const allYears = [...new Set(allData.map(d => d.Year))].filter(Boolean).sort((a,b) => b-a);
        for (const y of allYears) {
            const yData = allData.filter(r => r.Year === y && r["Happiness Score"]);
            if (!yData.length) break;
            const yTop = yData.reduce((a,b) => +a["Happiness Score"] > +b["Happiness Score"] ? a : b);
            if (yTop.Country === best.Country) { streak++; } else { break; }
        }

        document.getElementById("kpiBest").textContent       = best.Country;
        document.getElementById("kpiBestRegion").textContent = best.Region || "";

        // Score line: blue score number + gray streak
        const streakHtml = streak > 1 ? `<span class="streak-info"> · ${streak}× in Folge</span>` : "";
        document.getElementById("kpiBestScore").innerHTML =
            `<span class="score-highlight">${bestScore.toFixed(2)}</span> von 10${streakHtml}`;

        // Trend: positive = green, negative = gray (like VPS .rank-change)
        if (bestPrev !== null) {
            const diff = bestScore - bestPrev;
            const el = document.getElementById("kpiBestTrend");
            el.innerHTML = `${diff >= 0 ? "↑" : "↓"} ${Math.abs(diff).toFixed(2)} zum Vorjahr`;
            el.className = "rank-change " + (diff >= 0 ? "pos" : "neg");
        }

        // Detail: blue "+2.16 über Ø (39%)"
        if (avgDist !== null && avgScore !== null) {
            document.getElementById("kpiBestDetail").innerHTML =
                `<span class="avg-distance">+${avgDist.toFixed(2)} über Ø (${avgScore}%)</span>`;
        }

        // kpi-bottom: Schlusslicht + Spanne
        const worst = sorted[sorted.length - 1];
        const worstScore = +worst["Happiness Score"];
        const gap = bestScore - worstScore;
        const el = document.getElementById("kpiTopBottom");
        if (el) {
            el.innerHTML = '<span class="bottom-label">Schlusslicht: </span>' +
                '<span class="bottom-country">' + worst.Country + '</span>' +
                '<span class="bottom-score"> (' + worstScore.toFixed(2) + ')</span>' +
                '<br><span class="gap-info">Spanne: ' + gap.toFixed(2) + ' Punkte</span>';
        }
    }

    // Durchschnitt / Median (statMode)
    if (scores.length > 0) {
        const sortedSc = [...scores].sort((a,b) => a-b);
        const median = sortedSc.length % 2
            ? sortedSc[Math.floor(sortedSc.length / 2)]
            : (sortedSc[sortedSc.length/2 - 1] + sortedSc[sortedSc.length/2]) / 2;
        const curVal = statMode === "median" ? median : (curAvg || 0);

        document.getElementById("kpiAvg").textContent = curVal.toFixed(2);

        const prevScores = prevData.map(d => +d["Happiness Score"]).filter(v => !isNaN(v) && v > 0);
        if (prevScores.length) {
            const prevSorted = [...prevScores].sort((a,b) => a-b);
            const prevMedian = prevSorted.length % 2
                ? prevSorted[Math.floor(prevSorted.length / 2)]
                : (prevSorted[prevSorted.length/2 - 1] + prevSorted[prevSorted.length/2]) / 2;
            const prevVal = statMode === "median" ? prevMedian : mean(prevScores);
            const diff = curVal - prevVal;
            const el = document.getElementById("kpiAvgTrend");
            el.textContent = `${diff >= 0 ? "↑" : "↓"} ${Math.abs(diff).toFixed(2)} zum Vorjahr`;
            el.className = "kpi-trend " + (diff >= 0 ? "pos" : "neg");
        }
    }

    // Stichprobe
    const sampleEl = document.getElementById("kpiSampleN");
    if (sampleEl) sampleEl.textContent = data.length;
    const pctEl = document.getElementById("kpiSamplePct");
    if (pctEl) pctEl.textContent = "(" + Math.round(data.length / 193 * 100) + "%)";

    // Violin context label
    const violinCtx = document.getElementById("kpiViolinContext");
    if (violinCtx) violinCtx.textContent = data.length + " Länder (" + selectedYear + ")";

    // Gini coefficient + 90/10 ratio + Violin chart
    if (scores.length > 1) {
        const sorted_scores = [...scores].sort((a,b) => a-b);
        const n_s = sorted_scores.length;
        const sumY = sorted_scores.reduce((a,b) => a+b, 0);
        let gini = 0;
        if (sumY > 0) {
            gini = (2 * sorted_scores.reduce((acc,v,i) => acc + (i+1)*v, 0)) / (n_s * sumY) - (n_s+1)/n_s;
            gini = Math.abs(gini);
        }
        const p10 = scores.length >= 10 ? sorted_scores[Math.floor(sorted_scores.length * 0.10)] : sorted_scores[0];
        const p90 = scores.length >= 10 ? sorted_scores[Math.floor(sorted_scores.length * 0.90)] : sorted_scores[sorted_scores.length-1];
        const ratio = p10 > 0 ? p90/p10 : 0;

        const giniEl = document.getElementById("kpiGini");
        if (giniEl) giniEl.textContent = gini.toFixed(3);
        const ratioEl = document.getElementById("kpiRatio");
        if (ratioEl) ratioEl.textContent = ratio.toFixed(2) + "×";

        // Violin chart – horizontal orientation, exactly like VPS
        const violinEl = document.getElementById("kpiViolinChart");
        if (violinEl && typeof Plotly !== "undefined") {
            const emptyY = scores.map(() => "");
            const traces = [
                {
                    type: "violin",
                    x: scores,
                    y: emptyY,
                    orientation: "h",
                    side: "both",
                    line_color: "#2171b5",
                    fillcolor: "rgba(33,113,181,0.25)",
                    meanline_visible: true,
                    meanline_color: "#2171b5",
                    points: false,
                    spanmode: "soft",
                    width: 0.8,
                    hoverinfo: "skip",
                    showlegend: false,
                    name: ""
                }
            ];
            // Selected countries as red dots – same categorical y position as violin
            if (selectedCountries && selectedCountries.length > 0) {
                const selRows = data.filter(d => selectedCountries.includes(d.Country));
                if (selRows.length > 0) {
                    traces.push({
                        type: "scatter",
                        x: selRows.map(d => +d["Happiness Score"]),
                        y: selRows.map(() => ""),
                        mode: "markers",
                        marker: { color: "#e74c3c", size: 10, symbol: "circle",
                                  line: { color: "white", width: 1.5 }, opacity: 1 },
                        text: selRows.map(d => d.Country),
                        customdata: selRows.map(d => [d["Happiness Rank"], d.Region || ""]),
                        hovertemplate: "<b>%{text}</b><br>Score: %{x:.2f}<br>Rang: %{customdata[0]}<br>Region: %{customdata[1]}<extra></extra>",
                        showlegend: false,
                        name: ""
                    });
                }
            }
            Plotly.react("kpiViolinChart", traces, {
                margin: { l: 24, r: 8, t: 6, b: 18 },
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                xaxis: {
                    showgrid: true, gridcolor: "#f0f0f0",
                    showline: true, linecolor: "#e0e0e0", linewidth: 1,
                    tickfont: { size: 8, color: "#999" },
                    range: [0, 10], dtick: 2
                },
                yaxis: { showgrid: false, showline: false, showticklabels: false, zeroline: false },
                showlegend: false,
                hovermode: "closest"
            }, { displayModeBar: false, responsive: true });
        }
    }
}

// ===================================================================
// World Map
// ===================================================================

function setMapMode(mode) {
    mapMode = mode;
    document.getElementById("btnAuswahl").className = "toggle-btn" + (mode === "selection" ? " active" : "");
    document.getElementById("btnAlle").className    = "toggle-btn" + (mode === "all" ? " active" : "");
    drawMap(getFilteredData());
}

function updateMapSubtitle() {
    const regionLabel = selectedRegion || "Alle Regionen";
    document.getElementById("mapSubtitle").textContent = `${selectedYear} · ${regionLabel}`;
}

function drawMap(yearData) {
    updateMapSubtitle();
    const highlightSet = new Set(selectedCountries);
    const valid = yearData.filter(d => ISO_CODES[d.Country]);

    // Single trace: NaN for non-selected in selection mode → renders as landcolor (gray).
    // One trace = colorbar always renders reliably (no 2-trace colorbar conflict).
    const useSelection = mapMode === "selection" && selectedCountries.length > 0;

    const traces = [{
        type: "choropleth", locationmode: "ISO-3",
        locations: valid.map(d => ISO_CODES[d.Country]),
        z: valid.map(d =>
            useSelection && !highlightSet.has(d.Country) ? NaN : +d["Happiness Score"]
        ),
        text: valid.map(d =>
            (!useSelection || highlightSet.has(d.Country))
                ? `<b>${d.Country}</b><br>Score: ${(+d["Happiness Score"]).toFixed(2)}<br>Rang: ${d["Happiness Rank"]}<br>${d.Region || ""}`
                : d.Country
        ),
        hovertemplate: "%{text}<extra></extra>",
        colorscale: COLOR_SCALE, zmin: 2, zmax: 8,
        marker: { line: { color: "#ffffff", width: 0.5 } },
        colorbar: { len: 0.65, thickness: 12,
                    tickfont: {size: 9}, title: {text: "Score", font: {size: 9}} }
    }];

    Plotly.react("worldMap", traces, {
        ...LAYOUT_BASE,
        margin: {l: 0, r: 70, t: 0, b: 0},
        geo: {
            showframe: false, showcoastlines: true, coastlinecolor: "#cccccc",
            showland: true, landcolor: "#f0f0f0",
            showocean: true, oceancolor: "#e8f4f8",
            showlakes: false, projection: {type: "natural earth"}
        },
        showlegend: false
    }, PLOTLY_CFG);
}

// ===================================================================
// Trend Chart – dots only, like VPS
// ===================================================================

function drawTrend() {
    if (selectedCountries.length === 0) {
        Plotly.react("trendChart", [], {
            ...LAYOUT_BASE,
            margin:{l:48,r:16,t:16,b:40},
            annotations:[{
                text:"Länder auswählen, um Trendlinien zu sehen",
                xref:"paper",yref:"paper",x:0.5,y:0.5,
                showarrow:false, font:{size:13,color:"#bbb"}
            }]
        }, PLOTLY_CFG);
        document.getElementById("trendFooter").textContent = "";
        return;
    }

    const years = [...new Set(allData.map(d => d.Year))].filter(Boolean).sort((a,b) => a-b);

    // Determine y-range from data
    let allScores = [];
    selectedCountries.forEach(c => {
        years.forEach(y => {
            const row = allData.find(d => d.Country === c && d.Year === y);
            if (row) allScores.push(+row["Happiness Score"]);
        });
    });
    const yMin = allScores.length ? Math.max(0, Math.floor(Math.min(...allScores) * 2) / 2 - 0.5) : 2;
    const yMax = allScores.length ? Math.min(10, Math.ceil(Math.max(...allScores) * 2) / 2 + 0.5) : 9;

    // Check for 2024 gap (no data for 2024)
    const has2024 = allData.some(d => d.Year === 2024 && d["Happiness Score"]);

    const traces = selectedCountries.map((country, i) => {
        const pts = years.map(y => {
            const row = allData.find(d => d.Country === country && d.Year === y);
            return row ? +row["Happiness Score"] : null;
        });
        return {
            type:"scatter",
            mode:"markers",           // ← dots only, like VPS
            name: country,
            x: years, y: pts,
            marker: { size: 9, color: COLOR_COUNTRIES[i % COLOR_COUNTRIES.length], line:{color:"white",width:1} },
            connectgaps: false,
            hovertemplate: `<b>${country}</b><br>%{x}: %{y:.2f}<extra></extra>`
        };
    });

    const shapes = [];
    const annotations = [];
    if (!has2024) {
        shapes.push({ type:"rect", xref:"x", yref:"paper",
            x0:2023.5, x1:2024.5, y0:0, y1:1,
            fillcolor:"#fee2e2", opacity:0.45, line_width:0 });
        annotations.push({
            x:2024, y:yMax, xref:"x", yref:"y",
            text:"keine Daten", showarrow:false,
            font:{size:9, color:"#e53e3e"}, yanchor:"top"
        });
    }

    Plotly.react("trendChart", traces, {
        ...LAYOUT_BASE,
        margin:{l:48,r:16,t:16,b:48},
        shapes,
        annotations: annotations.length ? annotations : undefined,
        legend:{orientation:"h", y:1.02, yanchor:"bottom", font:{size:10}, xanchor:"left", x:0},
        xaxis:{
            showgrid:true, gridcolor:"#f0f0f0", showline:true, linecolor:"#e0e0e0",
            tickmode:"array", tickvals: years, tickfont:{size:9}
        },
        yaxis:{
            showgrid:true, gridcolor:"#f0f0f0", showline:false, zeroline:false,
            range:[yMin, yMax], title:{text:"Score", font:{size:10}}
        },
        hovermode:"closest"
    }, PLOTLY_CFG);

    const trendFooterEl = document.getElementById("trendFooter");
    if (!has2024) {
        trendFooterEl.innerHTML = '<span class="chart-footnote warning">2024: Keine Daten verfügbar</span>';
    } else {
        const yAxisInfo = `Y-Achse: ${yMin.toFixed(1)}–${yMax.toFixed(1)}`;
        trendFooterEl.innerHTML = '<span class="chart-footnote">' + yAxisInfo + '</span>';
    }
}

// ===================================================================
// Top / Flop – Finland at TOP
// ===================================================================

function drawTopFlop(data) {
    const sorted = [...data]
        .filter(d => d["Happiness Score"] && !isNaN(+d["Happiness Score"]))
        .sort((a,b) => +b["Happiness Score"] - +a["Happiness Score"]);

    const top5  = sorted.slice(0, 5);          // best 5, descending
    const flop5 = sorted.slice(-5).reverse();   // worst 5, worst first (ascending)

    // Plotly horizontal bar: first element = bottom, last = top
    // We want: Finland (best) at TOP → Finland must be LAST → top5 reversed (ascending)
    // And: Afghanistan (worst) at BOTTOM → first in array
    const combined = [...flop5, ...top5.reverse()];
    const scores   = combined.map(d => +d["Happiness Score"]);

    document.getElementById("topFlopSubtitle").textContent = `${selectedYear}`;

    Plotly.react("topFlopChart", [{
        type:"bar", orientation:"h",
        y: combined.map(d => d.Country),
        x: scores,
        marker:{ color: scores.map(s => scoreToColor(s)) },
        text: scores.map(s => s.toFixed(2)),
        textposition:"outside", textfont:{size:10},
        hovertemplate:"<b>%{y}</b><br>Score: %{x:.2f}<extra></extra>"
    }], {
        ...LAYOUT_BASE,
        margin:{l:130,r:52,t:16,b:40},
        xaxis:{showgrid:false,showline:true,linecolor:"#e0e0e0",range:[0,9],
               title:{text:"Happiness Score",font:{size:10}}},
        yaxis:{showgrid:false,showline:false},
        shapes:[{type:"line",x0:5,x1:5,y0:-0.5,y1:9.5,
                 line:{color:"#ccc",width:1,dash:"dot"}}]
    }, PLOTLY_CFG);
}

// ===================================================================
// Regional Analysis
// ===================================================================

function drawRegional(data) {
    const regionMap = {};
    data.forEach(d => {
        const r = d.Region; if (!r) return;
        if (!regionMap[r]) regionMap[r] = [];
        const s = +d["Happiness Score"];
        if (!isNaN(s) && s > 0) regionMap[r].push(s);
    });
    const entries = Object.entries(regionMap)
        .map(([region, scores]) => ({
            region, mean: mean(scores),
            min: Math.min(...scores), max: Math.max(...scores)
        }))
        .sort((a,b) => a.mean - b.mean);

    const globalAvg = mean(data.map(d=>+d["Happiness Score"]).filter(v=>!isNaN(v)&&v>0));
    document.getElementById("regionalSubtitle").textContent = `${selectedYear}`;

    Plotly.react("regionChart", [{
        type:"bar", orientation:"h",
        y: entries.map(e => e.region),
        x: entries.map(e => e.mean),
        error_x:{
            type:"data", symmetric:false,
            array:      entries.map(e => e.max - e.mean),
            arrayminus: entries.map(e => e.mean - e.min),
            color:"#999", thickness:1.5, width:5
        },
        marker:{ color: entries.map(e => scoreToColor(e.mean)) },
        hovertemplate:"<b>%{y}</b><br>Ø %{x:.2f}<extra></extra>"
    }], {
        ...LAYOUT_BASE,
        margin:{l:185,r:24,t:20,b:40},
        xaxis:{showgrid:false,showline:true,linecolor:"#e0e0e0",range:[0,8.5],
               title:{text:"Happiness Score",font:{size:10}}},
        yaxis:{showgrid:false,showline:false,tickfont:{size:9}},
        shapes:[{type:"line",x0:globalAvg,x1:globalAvg,y0:-0.5,y1:entries.length-0.5,
                 line:{color:"#0389CF",width:1.5,dash:"dot"}}],
        annotations:[{x:globalAvg,y:entries.length-0.5,
            text:`Ø ${globalAvg.toFixed(2)}`,showarrow:false,
            font:{size:9,color:"#0389CF"},xanchor:"left",yanchor:"bottom"}]
    }, PLOTLY_CFG);
}

// ===================================================================
// Scatter – with fallback year for GDP data
// ===================================================================

function drawScatter(data) {
    const factorYear = getLatestFactorYear();
    if (!factorYear) return;

    // Use data for selected year, but GDP from factorYear if needed
    let scatterData;
    const hasFactors = data.some(d => d.GDP && !isNaN(+d.GDP) && +d.GDP > 0);

    if (hasFactors) {
        scatterData = data;
    } else {
        // Merge happiness scores from selected year with GDP from factorYear
        const factorRows = allData.filter(d => d.Year === factorYear);
        scatterData = data.map(d => {
            const fRow = factorRows.find(f => f.Country === d.Country);
            return fRow ? { ...d, GDP: fRow.GDP } : d;
        });
    }

    const valid = scatterData.filter(d =>
        d.GDP && d["Happiness Score"] &&
        !isNaN(+d.GDP) && +d.GDP > 0 &&
        !isNaN(+d["Happiness Score"]) && +d["Happiness Score"] > 0
    );
    if (valid.length < 2) return;

    const xs = valid.map(d => +d.GDP);
    const ys = valid.map(d => +d["Happiness Score"]);
    const { m, b, r, r2 } = linearRegression(xs, ys);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);

    const highlightSet = new Set(selectedCountries);
    const rest = valid.filter(d => !highlightSet.has(d.Country));
    const sel  = valid.filter(d =>  highlightSet.has(d.Country));

    const traces = [
        {
            type:"scatter", mode:"markers", name:"Alle Länder",
            x: rest.map(d => +d.GDP), y: rest.map(d => +d["Happiness Score"]),
            text: rest.map(d => d.Country),
            marker:{color:"#666666", size:8, opacity:0.6,
                    line:{color:"white",width:1}},
            hovertemplate:"<b>%{text}</b><br>BIP: %{x:.2f}<br>Score: %{y:.2f}<extra></extra>",
            showlegend:false
        },
        {
            type:"scatter", mode:"lines", name:"Trendlinie",
            x:[xMin,xMax], y:[m*xMin+b, m*xMax+b],
            line:{color:"#999999",width:2,dash:"dash"}, hoverinfo:"skip", showlegend:false
        }
    ];

    if (sel.length) {
        traces.push({
            type:"scatter", mode:"markers",
            x: sel.map(d => +d.GDP), y: sel.map(d => +d["Happiness Score"]),
            text: sel.map(d => d.Country),
            hovertemplate:"<b>%{text}</b><br>BIP: %{x:.2f}<br>Score: %{y:.2f}<extra></extra>",
            marker:{color:"#e74c3c", size:12, line:{color:"white",width:2}},
            showlegend:false
        });
    }

    const isFallback = !hasFactors && factorYear !== selectedYear;
    document.getElementById("scatterSubtitle").textContent =
        `Daten: ${selectedYear}${isFallback ? ` (Faktoren aus ${factorYear})` : ""}`;
    document.getElementById("scatterFooter").textContent =
        `r = ${r.toFixed(2)} · R² = ${r2.toFixed(2)} · p < 0.001`;

    Plotly.react("scatterChart", traces, {
        ...LAYOUT_BASE,
        margin:{l:48,r:16,t:16,b:48},
        xaxis:{showgrid:false,showline:true,linecolor:"#e0e0e0",
               title:{text:"BIP pro Kopf (log.)",font:{size:10}}},
        yaxis:{showgrid:true,gridcolor:"#f0f0f0",showline:false,zeroline:false,
               range:[0,10], title:{text:"Happiness Score",font:{size:10}}},
        showlegend:false
    }, PLOTLY_CFG);
}

// ===================================================================
// Correlation Heatmap – uses ALL years with factor data (like VPS)
// ===================================================================

function drawHeatmap() {
    // Use ALL data with valid GDP (all years with factor data)
    const factorData = allData.filter(d =>
        d.GDP && !isNaN(+d.GDP) && +d.GDP > 0
    );

    const fields = ["Happiness Score","GDP","Social Support","Life Expectancy","Freedom","Generosity","Corruption"];
    const labels = ["Glücklichkeit","BIP","Soz. Unterstützung","Lebenserwartung","Freiheit","Großzügigkeit","Korruption"];
    const n = fields.length;
    const matrix = Array.from({length:n}, () => Array(n).fill(0));
    const rawMatrix = Array.from({length:n}, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const pairs = factorData.filter(d =>
                !isNaN(+d[fields[i]]) && +d[fields[i]] !== 0 &&
                !isNaN(+d[fields[j]]) && +d[fields[j]] !== 0
            );
            if (pairs.length > 2) {
                const r = pearson(pairs.map(d=>+d[fields[i]]), pairs.map(d=>+d[fields[j]]));
                rawMatrix[i][j] = r;
                matrix[i][j] = Math.abs(r);
            }
        }
    }

    Plotly.react("heatmapChart", [{
        type:"heatmap",
        z: matrix, x: labels, y: labels,
        colorscale:[[0,"#ffffff"],[0.33,"#d0d0d0"],[0.67,"#888888"],[1,"#333333"]],
        zmin:0, zmax:1,
        text: rawMatrix.map(row => row.map(v => v.toFixed(2))),
        texttemplate:"%{text}", textfont:{size:9},
        hovertemplate:"%{y} × %{x}<br>r = %{text}<extra></extra>",
        colorbar:{thickness:10,len:0.8,title:{text:"|r|",font:{size:9}},
                  tickvals:[0,0.25,0.5,0.75,1],tickfont:{size:8}}
    }], {
        ...LAYOUT_BASE,
        margin:{l:120,r:50,t:16,b:80},
        xaxis:{showgrid:false,showline:false,tickangle:-40,tickfont:{size:9}},
        yaxis:{showgrid:false,showline:false,tickfont:{size:9},autorange:"reversed"}
    }, PLOTLY_CFG);
}

// ===================================================================
// Sparkline (KPI Card 2) – global avg/median over years
// ===================================================================

function drawSparkline() {
    const el = document.getElementById("kpiSparkline");
    if (!el || typeof Plotly === "undefined") return;

    const years = [...new Set(allData.map(d => d.Year))].filter(Boolean).sort((a,b) => a-b);

    const vals = years.map(y => {
        let yd = allData.filter(d => d.Year === y);
        if (selectedRegion) yd = yd.filter(d => d.Region === selectedRegion);
        const sc = yd.map(d => +d["Happiness Score"]).filter(v => !isNaN(v) && v > 0);
        if (!sc.length) return null;
        if (statMode === "median") {
            const s = [...sc].sort((a,b) => a-b);
            return s.length % 2 ? s[Math.floor(s.length/2)] : (s[s.length/2-1] + s[s.length/2]) / 2;
        }
        return mean(sc);
    });

    const pts = years.map((y,i) => ({y, v: vals[i]})).filter(p => p.v !== null);
    if (!pts.length) return;

    const last = pts[pts.length - 1];
    const allV = pts.map(p => p.v);
    const vMin = Math.min(...allV), vMax = Math.max(...allV);
    const pad  = Math.max((vMax - vMin) * 0.25, 0.08);

    Plotly.react("kpiSparkline",
        [
            {
                type: "scatter", mode: "lines",
                x: pts.map(p => p.y), y: pts.map(p => p.v),
                line: { color: "#2171b5", width: 1.5 },
                hovertemplate: "%{x}: %{y:.2f}<extra></extra>",
                showlegend: false, connectgaps: false
            },
            {
                type: "scatter", mode: "markers",
                x: [last.y], y: [last.v],
                marker: { color: "#e74c3c", size: 8, line: { color: "white", width: 1.5 } },
                hovertemplate: "%{x}: %{y:.2f}<extra></extra>",
                showlegend: false
            }
        ],
        {
            margin: { l: 28, r: 14, t: 4, b: 22 },
            paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)",
            xaxis: {
                showgrid: false, showline: false, zeroline: false,
                tickfont: { size: 8, color: "#999" },
                dtick: 2, tickformat: "d"
            },
            yaxis: {
                showgrid: false, showline: false, zeroline: false,
                tickfont: { size: 8, color: "#999" }, nticks: 3,
                range: [vMin - pad, vMax + pad]
            },
            showlegend: false, hovermode: "closest"
        },
        { displayModeBar: false, responsive: true }
    );
}

// ===================================================================
// Update all charts
// ===================================================================

function updateAll() {
    const data = getFilteredData();
    updateKPIs(data);
    drawSparkline();
    drawMap(data);
    drawTrend();
    drawTopFlop(data);
    drawRegional(data);
    drawScatter(data);
    drawHeatmap();     // heatmap uses ALL data internally
}

// ===================================================================
// Dashboard init
// ===================================================================

function initDashboard(data) {
    allData = data;

    // Year dropdown
    const years = [...new Set(data.map(d => d.Year))].filter(Boolean).sort((a,b) => b-a);
    const yearSel = document.getElementById("yearSelect");
    years.forEach(y => {
        const opt = document.createElement("option");
        opt.value = y; opt.textContent = y;
        yearSel.appendChild(opt);
    });
    selectedYear = years[0];
    yearSel.value = selectedYear;

    // Region dropdown
    const regions = [...new Set(data.map(d => d.Region).filter(Boolean))].sort();
    const regSel = document.getElementById("regionSelect");
    regions.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r; opt.textContent = r;
        regSel.appendChild(opt);
    });

    // Country Tom Select (chip-style multi-select)
    const countries = [...new Set(data.map(d => d.Country).filter(Boolean))].sort();
    const ctySel = document.getElementById("countrySelect");
    countries.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c; opt.textContent = c;
        ctySel.appendChild(opt);
    });

    ts = new TomSelect("#countrySelect", {
        maxItems: 5,
        plugins: ["remove_button"],
        placeholder: "Länder auswählen…",
        onItemAdd: function() {
            selectedCountries = ts.items.slice(0, 5);
            updateAll();
        },
        onItemRemove: function() {
            selectedCountries = ts.items;
            updateAll();
        }
    });

    // Default: top 3 countries for latest year
    const yearData = data
        .filter(d => d.Year === selectedYear && d["Happiness Rank"])
        .sort((a,b) => +a["Happiness Rank"] - +b["Happiness Rank"]);
    selectedCountries = yearData.slice(0, 3).map(d => d.Country);
    selectedCountries.forEach(c => ts.addItem(c, true));

    // Events
    yearSel.addEventListener("change", () => {
        selectedYear = +yearSel.value;
        updateAll();
    });
    regSel.addEventListener("change", () => {
        selectedRegion = regSel.value;
        updateAll();
    });

    // Show dashboard
    document.getElementById("loading").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    // Double rAF: ensures browser calculates grid layout widths before Plotly renders.
    // Without this, charts render at wrong (pre-layout) width and get clipped by overflow:hidden.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            updateAll();
            // Secondary resize pass after 200ms for any chart that still has wrong size
            setTimeout(() => {
                document.querySelectorAll(".js-plotly-plot").forEach(el => {
                    if (el.id) Plotly.Plots.resize(el.id);
                });
            }, 200);
        });
    });
}

// ===================================================================
// Load CSV
// ===================================================================

Papa.parse("https://raw.githubusercontent.com/swrobuts/dav/main/data/whr_combined_2015_2025.csv", {
    download: true, header: true, dynamicTyping: true,
    complete: function(results) {
        initDashboard(results.data.filter(d => d.Country));
    },
    error: function(err) {
        document.getElementById("loading").innerHTML =
            `<div style="text-align:center;font-family:Inter,sans-serif;">
                <p style="color:#e53e3e;font-weight:600;">Fehler beim Laden der Daten</p>
                <p style="color:#999;font-size:0.82rem;margin-top:0.5rem;">${err.message||"Netzwerkfehler"}</p>
             </div>`;
    }
});