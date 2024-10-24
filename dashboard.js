let img = document.getElementById("character_image");
img.src = "images/character.gif";
img.width = "320";
img.height = "320";

let initializedHistory = false;
let historyData = {}
let chart;

const btns = document.querySelectorAll('.btn');
btns.forEach(btn => {
    // ボタンをクリックしたとき
    btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const period = btn.dataset.period;

        // グラフを更新
        updateChart(period);
    });
});

// 1ヶ月前〜今週分の記録（サンプルデータ）を作成する関数
const createSampleData = (history) => {
    // 今日が始まった日時を取得
    const today = new Date(new Date().toLocaleDateString());
    // 今週の月曜日が始まった日時を取得
    const day = new Date();
    const dayOfWeek = day.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const sameTimeThisMonday = new Date(day.setDate(day.getDate() - diff));
    const beginTimeThisMonday = new Date(sameTimeThisMonday.toLocaleDateString());
    // 2ヶ月前の月曜日が始まった日時を取得
    const beginTimeTwoMonthsAgoMonday = new Date(beginTimeThisMonday.getTime() - (56 * 24 * 60 * 60 * 1000));

    // 2ヶ月前〜今週分の記録（サンプルデータ）を作成
    const maxCount = 100;
    for (let i = 0; i < 63; i++) {
        const date = new Date(beginTimeTwoMonthsAgoMonday.getTime() + i * 24 * 60 * 60 * 1000);
        const dateToString = date.toLocaleDateString();

        // 履歴に追加
        history.push({
            date: dateToString,
            count: history.find(item => item.date === dateToString)?.count || today > date ? Math.floor(Math.random() * (maxCount + 1)) : 0,
        });
    }

    // 今日の閲覧回数を1回追加
    const todayRecord = history.find(item => item.date === today.toLocaleDateString());
    todayRecord.count++;
}

// 泡を生成する関数
const createBubble = (area) => {
    const bubbleEl = document.createElement('span');
    bubbleEl.className = 'bubble';
    const minSize = 10;
    const maxSize = 25;
    const size = Math.random() * (maxSize + 1 - minSize) + minSize;
    bubbleEl.style.width = `${size}px`;
    bubbleEl.style.height = `${size}px`;
    bubbleEl.style.left = Math.random() * innerWidth + 'px';
    area.appendChild(bubbleEl);

    // 一定時間が経てば泡を消す
    setTimeout(() => {
        bubbleEl.remove();
    }, 8000);
}

// HTML文書を読み込んだとき、グラフを更新
document.addEventListener('DOMContentLoaded', () => {
    // 初期化が済んでいなければ
    if (!initializedHistory) {
        // 今日の日付を取得
        const today = new Date();
        const todayToString = today.toLocaleDateString();

        // ローカルストレージの履歴を格納
        const history = historyData.history || [];

        // 今日の日付の記録がなければ、サンプルデータを新規作成
        const todayRecord = history.find(item => item.date === todayToString);
        if (todayRecord) {
            todayRecord.count++;
        }
        else {
            // サンプルデータを作成
            createSampleData(history);

            // 履歴を保存
            historyData["history"] = history;

            // 初期化を完了
            initializedHistory = true;
        }
    }

    // アクティブなボタンのテキストを取得
    btns.forEach(btn => {
        if (btn.className === "btn active") {
            const period = btn.dataset.period;

            // グラフを更新
            updateChart(period);
        }
    });

    // 泡を生成するエリアを取得
    const area = document.getElementById("bubble_area");
    // インターバルを設定
    const intervals = [2000, 4000, 5000, 7000];
    let num = 0;
    // 一定時間ごとに泡を生成
    setInterval(() => {
        num = intervals[Math.floor(Math.random() * intervals.length)];
        createBubble(area);
    }, intervals[num])
});

// グラフを作成する関数
const createChart = (data, totalCount) => {
    // データが存在しなければ
    if (!data) return;

    // 日付と遷移回数を抽出
    const labels = data.map(record => record.date);
    const counts = data.map(record => record.count);

    // 合計値を反映
    document.getElementById('totalValue').textContent = totalCount.toString();

    // Chart.jsでグラフ作成
    const ctx = document.getElementById('chart').getContext('2d');

    // グラフが存在するなら
    if (chart) {
        // 破棄する
        chart.destroy();
    }

    chart = new Chart(ctx, {
        // グラフの種類
        type: 'bar',
        // グラフの各項目で表示するデータ
        data: {
            labels: labels,
            datasets: [{
                label: '閲覧回数',
                data: counts,
                backgroundColor: 'rgba(50, 130, 197, 1)',
                borderColor: 'rgba(50, 130, 197, 1)',
                borderWidth: 1,
                borderRadius: 9999,
            }]
        },       
        // グラフのオプション
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        color: 'rgba(50, 130, 197, 0.2)',
                    },
                    ticks: {
                        color: 'rgba(50, 130, 197, 1)',
                    },
                    border: {
                        color: 'rgba(50, 130, 197, 0.2)',
                    }
                },
                y: {
                    grid: {
                        display: false,
                        color: 'rgba(50, 130, 197, 0.2)',
                    },
                    ticks: {
                        min: 0,
                        max: 100,
                        suggestedMin: 0,
                        suggestedMax: 100,
                        stepSize: 100,
                        color: 'rgba(50, 130, 197, 1)',
                    },
                    border: {
                        color: 'rgba(50, 130, 197, 0)',
                    }
                }
            },
        }
    });
}


// グラフを更新する関数
const updateChart = (period) => {
    const history = historyData.history || [];
    let chartData;
    let totalCount = 0;

    switch(period) {
    case 'daily':
        chartData = getDailyData(history);
        totalCount = getTotalCount(period, chartData);
        break;
    case 'weekly':
        chartData = getWeeklyData(history);
        totalCount = getTotalCount(period, chartData);
        break;
    case 'monthly':
        chartData = getMonthlyData(history);
        totalCount = getTotalCount(period, chartData);
        break;
    }

    // グラフを作成
    createChart(chartData, totalCount);
}

const getDailyData = (history) => {
    // 今週の月曜日が始まった日時を取得
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const sameTimeThisMonday = new Date(today.setDate(today.getDate() - diff));
    const beginTimeThisMonday = new Date(sameTimeThisMonday.toLocaleDateString());
    // 来週の月曜日が始まった日時を取得
    const beginTimeNextMonday = new Date(beginTimeThisMonday.getTime() + (7 * 24 * 60 * 60 * 1000));

    let dailyData = [];

    history.forEach(record => {
        // 履歴から日時を取得
        const recordDate = new Date(record.date);

        // 今週分の記録をデータに追加
        if (recordDate >= beginTimeThisMonday && recordDate < beginTimeNextMonday) {
            // 履歴の日付を取得
            const recordDateToString = recordDate.toLocaleDateString();

            // データに追加
            dailyData.push({
                date: recordDateToString.slice(5),
                count: history.find(item => item.date === recordDateToString)?.count || 0
            });
        }
    });

    return dailyData;
}

const getWeeklyData = (history) => {
    // 今週の月曜日が始まった日時を取得
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const sameTimeThisMonday = new Date(today.setDate(today.getDate() - diff));
    const beginTimeThisMonday = new Date(sameTimeThisMonday.toLocaleDateString());

    // 前後2週間分の月曜日が始まった日時を取得
    const beginTimeBeforeLastMonday = new Date(beginTimeThisMonday.getTime() - (14 * 24 * 60 * 60 * 1000));
    const beginTimeLastMonday = new Date(beginTimeThisMonday.getTime() - (7 * 24 * 60 * 60 * 1000));
    const beginTimeNextMonday = new Date(beginTimeThisMonday.getTime() + (7 * 24 * 60 * 60 * 1000));
    const beginTimeAfterNextMonday = new Date(beginTimeThisMonday.getTime() + (14 * 24 * 60 * 60 * 1000));
    const beginTimeAfterNextNextMonday = new Date(beginTimeThisMonday.getTime() + (21 * 24 * 60 * 60 * 1000));

    let weeklyData = [];
    let weeklyTotals = {};

    // 週間データを作成
    weeklyData.push({ date: createWeeklyLabel(beginTimeBeforeLastMonday), count: 0 });
    weeklyData.push({ date: createWeeklyLabel(beginTimeLastMonday), count: 0 });
    weeklyData.push({ date: createWeeklyLabel(beginTimeThisMonday), count: 0 });
    weeklyData.push({ date: createWeeklyLabel(beginTimeNextMonday), count: 0 });
    weeklyData.push({ date: createWeeklyLabel(beginTimeAfterNextMonday), count: 0 });

    history.forEach(record => {
        // 履歴から日付を取得
        const recordDate = new Date(record.date);

        // 2週間前の記録をデータに追加
        if (recordDate >= beginTimeBeforeLastMonday && recordDate < beginTimeLastMonday) {
            // ラベルを作成
            const weeklyLabel = createWeeklyLabel(beginTimeBeforeLastMonday);

            // まだデータが存在していなければ
            if (!weeklyTotals[weeklyLabel]) {
                // 仮のデータを挿入
                weeklyTotals[weeklyLabel] = 0;
            }

            // ラベルと週の合計回数を対応させ、週の合計回数をカウントする
            weeklyTotals[weeklyLabel] += record.count;
        }
        // 1週間前の記録をデータに追加
        else if (recordDate >= beginTimeLastMonday && recordDate < beginTimeThisMonday) {
            // ラベルを作成
            const weeklyLabel = createWeeklyLabel(beginTimeLastMonday);

            // まだデータが存在していなければ
            if (!weeklyTotals[weeklyLabel]) {
                // 仮のデータを挿入
                weeklyTotals[weeklyLabel] = 0;
            }

            // ラベルと週の合計回数を対応させ、週の合計回数をカウントする
            weeklyTotals[weeklyLabel] += record.count;
        }
        // 今週の記録をデータに追加
        else if (recordDate >= beginTimeThisMonday && recordDate < beginTimeNextMonday) {
            // ラベルを作成
            const weeklyLabel = createWeeklyLabel(beginTimeThisMonday);

            // まだデータが存在していなければ
            if (!weeklyTotals[weeklyLabel]) {
                // 仮のデータを挿入
                weeklyTotals[weeklyLabel] = 0;
            }

            // ラベルと週の合計回数を対応させ、週の合計回数をカウントする
            weeklyTotals[weeklyLabel] += record.count;
        }
        // 1週後の記録をデータに追加
        else if (recordDate >= beginTimeNextMonday && recordDate < beginTimeAfterNextMonday) {
            // ラベルを作成
            const weeklyLabel = createWeeklyLabel(beginTimeNextMonday);

            // まだデータが存在していなければ
            if (!weeklyTotals[weeklyLabel]) {
                // 仮のデータを挿入
                weeklyTotals[weeklyLabel] = 0;
            }

            // ラベルと週の合計回数を対応させ、週の合計回数をカウントする
            weeklyTotals[weeklyLabel] += record.count;
        }
        // 2週後の記録をデータに追加
        else if (recordDate >= beginTimeAfterNextMonday && recordDate < beginTimeAfterNextNextMonday) {
            // ラベルを作成
            const weeklyLabel = createWeeklyLabel(beginTimeAfterNextMonday);

            // まだデータが存在していなければ
            if (!weeklyTotals[weeklyLabel]) {
                // 仮のデータを挿入
                weeklyTotals[weeklyLabel] = 0;
            }

            // ラベルと週の合計回数を対応させ、週の合計回数をカウントする
            weeklyTotals[weeklyLabel] += record.count;
        }
    });

    // 集計したデータを週間データに統合
    const labels = Object.keys(weeklyTotals);
    const counts = Object.values(weeklyTotals);
    for (let i = 0; i < labels.length; i++) {
        weeklyData.map(data => {
            if (data.date === labels[i]) {
                data.count = counts[i];
            }
        });
    }

    return weeklyData;
}

const getMonthlyData = (history) => {
    // 今月の初日を取得
    const today = new Date();
    today.setDate(1);
    const firstDayToString = today.toLocaleDateString();

    // 前後2ヶ月の月数を取得
    const currentMonth = new Date(firstDayToString);
    const monthBeforeLast = new Date(new Date(firstDayToString).setMonth(currentMonth.getMonth() - 2));
    const lastMonth = new Date(new Date(firstDayToString).setMonth(currentMonth.getMonth() - 1));
    const nextMonth = new Date(new Date(firstDayToString).setMonth(currentMonth.getMonth() + 1));
    const twoMonthsLater = new Date(new Date(firstDayToString).setMonth(currentMonth.getMonth() + 2));
    const threeMonthsLater = new Date(new Date(firstDayToString).setMonth(currentMonth.getMonth() + 3));

    let monthlyData = [];
    let monthlyTotals = {};

    // 月間データを作成
    monthlyData.push({ date: `${monthBeforeLast.getMonth() + 1}`, count: 0 });
    monthlyData.push({ date: `${lastMonth.getMonth() + 1}`, count: 0 });
    monthlyData.push({ date: `${currentMonth.getMonth() + 1}`, count: 0 });
    monthlyData.push({ date: `${nextMonth.getMonth() + 1}`, count: 0 });
    monthlyData.push({ date: `${twoMonthsLater.getMonth() + 1}`, count: 0 });

    history.forEach(record => {
        // 履歴から日付を取得
        const recordDate = new Date(record.date);

        // 2ヶ月前の記録をデータに追加
        if (recordDate >= monthBeforeLast && recordDate < lastMonth) {
            // ラベルを作成
            const monthLabel = `${monthBeforeLast.getMonth() + 1}`;

            // まだデータが存在していなければ
            if (!monthlyTotals[monthLabel]) {
                // 仮のデータを挿入
                monthlyTotals[monthLabel] = 0;
            }
            
            // ラベルと月の合計回数を対応させ、月の合計回数をカウントする
            monthlyTotals[monthLabel] += record.count;
        }
        // 1ヶ月前の記録をデータに追加
        else if (recordDate >= lastMonth && recordDate < currentMonth) {
            // ラベルを作成
            const monthLabel = `${lastMonth.getMonth() + 1}`;

            // まだデータが存在していなければ
            if (!monthlyTotals[monthLabel]) {
                // 仮のデータを挿入
                monthlyTotals[monthLabel] = 0;
            }
            
            // ラベルと月の合計回数を対応させ、月の合計回数をカウントする
            monthlyTotals[monthLabel] += record.count;
        }
        // 今月の記録をデータに追加
        else if (recordDate >= currentMonth && recordDate < nextMonth) {
            // ラベルを作成
            const monthLabel = `${currentMonth.getMonth() + 1}`;

            // まだデータが存在していなければ
            if (!monthlyTotals[monthLabel]) {
                // 仮のデータを挿入
                monthlyTotals[monthLabel] = 0;
            }
            
            // ラベルと月の合計回数を対応させ、月の合計回数をカウントする
            monthlyTotals[monthLabel] += record.count;
        }
        // 1ヶ月後の記録をデータに追加
        else if (recordDate >= nextMonth && recordDate < twoMonthsLater) {
            // ラベルを作成
            const monthLabel = `${nextMonth.getMonth() + 1}`;

            // まだデータが存在していなければ
            if (!monthlyTotals[monthLabel]) {
                // 仮のデータを挿入
                monthlyTotals[monthLabel] = 0;
            }
            
            // ラベルと月の合計回数を対応させ、月の合計回数をカウントする
            monthlyTotals[monthLabel] += record.count;
        }
        // 2ヶ月後の記録をデータに追加
        else if (recordDate >= twoMonthsLater && recordDate < threeMonthsLater) {
            // ラベルを作成
            const monthLabel = `${twoMonthsLater.getMonth() + 1}`;

            // まだデータが存在していなければ
            if (!monthlyTotals[monthLabel]) {
                // 仮のデータを挿入
                monthlyTotals[monthLabel] = 0;
            }
            
            // ラベルと月の合計回数を対応させ、月の合計回数をカウントする
            monthlyTotals[monthLabel] += record.count;
        }
    });

    // 集計したデータを月間データに統合
    const labels = Object.keys(monthlyTotals);
    const counts = Object.values(monthlyTotals);
    for (let i = 0; i < labels.length; i++) {
        monthlyData.map(data => {
            if (data.date === labels[i]) {
                data.count = counts[i];
            }
        });
    }

    return monthlyData;
}

const createWeeklyLabel = (date) => {
    // 日曜日を取得
    const thisSunday = new Date(date.getTime() + (6 * 24 * 60 * 60 * 1000));
    // ラベルを作成
    const weeklyLabel = `${date.toLocaleDateString().slice(5)}-${thisSunday.toLocaleDateString().slice(5)}`;

    return weeklyLabel;
}

const getTotalCount = (period, data) => {
    // 日付と遷移回数を抽出
    const labels = data.map(record => record.date);
    const counts = data.map(record => record.count);

    // 今日の日時を取得
    const today = new Date();

    // 各種のページ遷移の合計回数を算出
    let totalCount = 0;
    switch(period) {
        case 'daily':
            // 今日の日付を取得
            const dateToString = today.toLocaleDateString().slice(5);
            // 今日のページ遷移の合計回数を算出
            for (let i = 0; i < counts.length; i++){
                if (dateToString === labels[i]) {
                    totalCount += counts[i];
                }
            }

            return totalCount;
        case 'weekly':
            // 今週の月曜日が始まった時間を取得
            const dayOfWeek = today.getDay();
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const sameTimeThisMonday = new Date(today.setDate(today.getDate() - diff));
            const beginTimeThisMonday = new Date(sameTimeThisMonday.toLocaleDateString());
            // 日曜日を取得
            const thisSunday = new Date(beginTimeThisMonday.getTime() + (6 * 24 * 60 * 60 * 1000));
            // 今週のページ遷移の合計回数を算出
            for (let i = 0; i < counts.length; i++) {
                if (`${beginTimeThisMonday.toLocaleDateString().slice(5)}-${thisSunday.toLocaleDateString().slice(5)}` === labels[i]) {
                    totalCount += counts[i];
                }
            }

            return totalCount;
        case 'monthly':
            // 現在の月数を取得
            const monthNumber = today.getMonth() + 1;
            // 今月のページ遷移の合計回数を算出
            for (let i = 0; i < counts.length; i++){
                if (monthNumber.toString() === labels[i]) {
                    totalCount += counts[i];
                }
            }

            return totalCount;
    }
}
