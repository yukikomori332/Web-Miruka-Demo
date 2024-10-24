let initializedHistory = false;

// 新しくタブを開いたとき
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        // テスト
        // console.log("loading...");
    }

    if (changeInfo.status === 'complete') {
        // テスト
        // console.log("complete!");

        chrome.storage.local.get(["history"], (result) => {
            const today = new Date();
            const todayToString = today.toLocaleDateString();

            // ローカルストレージの履歴を格納
            const history = result.history || [];

            // 今日の日付の記録がなければ、記録を新規作成
            const todayRecord = history.find(item => item.date === todayToString);
            if (todayRecord) {
                todayRecord.count++;
            }
            else if (!todayRecord && !initializedHistory) {
                // 今週の月曜日が始まった時間を取得
                const dayOfWeek = today.getDay();
                const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                const sameTimeThisMonday = new Date(today.setDate(today.getDate() - diff));
                const beginTimeThisMonday = new Date(sameTimeThisMonday.toLocaleDateString());

                // テスト
                // console.log(sameTimeThisMonday);
                // console.log(beginTimeThisMonday);

                // 今週分の記録を作成
                for (let i = 0; i < 7; i++) {
                    const date = new Date(beginTimeThisMonday.getTime() + i * 24 * 60 * 60 * 1000);
                    const dateToString = date.toLocaleDateString();

                    // 履歴に追加
                    history.push({
                        date: dateToString,
                        count: history.find(item => item.date === dateToString)?.count || 0
                    });
                }
            }

            // テスト
            // console.log(history);

            // 履歴を保存
            chrome.storage.local.set({ history: history });
        });
    }
});
