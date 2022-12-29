

// 执行一个队列的 promise 并以 promise 返回
/**
 * @param promise   要执行的 promise，可以自行封装一次
 * @param arr       数组，参数集合，记得和 promise 匹配
 * @param doPromiseReturn   如果需要对 promise 的结果进行处理，可以使用这个参数
 * @returns {Promise<unknown>}
 */
var runPromiseByArrReturnPromise = (promise,arr,doPromiseReturn) => {
    let doing = false;
    doPromiseReturn = doPromiseReturn || (_=>_);
    return new Promise(s => {
        let _id = setInterval(() => {
            if (!doing) {
                doing = true;
                if (arr.length) {
                    let id = arr.pop();
                    promise(id)
                        .then(o => {
                            doPromiseReturn(o,id);
                            doing = false;
                        });
                } else {
                    clearInterval(_id);
                    s();
                }
            }
        },500);
    });
}
var arr = [];
for (var i = 2;i < 47;i++) arr.push(i);
runPromiseByArrReturnPromise(fetchPage.fetch,arr,function () {
    console.log('over');
}).then(()=>{
    console.log('total over');
});

const fetchPage = (function () {
    let all = [];
    let d = document.createElement('div');
    const getList = function (text) {
        d.innerHTML = text;
        let n = new Array(...d.getElementsByClassName('list')[0].getElementsByTagName('li')).filter(_=>!_.classList.contains('line')).map(li => {
            return li.innerHTML;
        });
        all = all.concat(n);
        return true;
    };
    return {
        fetch(page) {
            return fetch(`http://www.nhc.gov.cn/xcs/yqtb/list_gzbd_${page}.shtml`).then(_=>_.text()).then(getList)
        },
        getAll() {
            return all;
        }
    }
})();


function checkList(list) {
    let d = new Date();
    let t = 0;
    d.setHours(8);
    d.setMinutes(0);
    for (let i = 0;i < 1200;i++) {
        d.setTime(d.getTime() - 1000 * 3600 * 24);
        t = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
        if (!list.includes(t)) {
            console.log(d.toISOString());
        }
    }
}

const fetchOnePage = (function () {
    let all = {};
    let d = document.createElement('div');
    const text2linkAndDate = function (text) {
        d.innerHTML = text;
        return {
            link: d.getElementsByTagName('a')[0].getAttribute('href'),
            date: d.getElementsByTagName('span')[0].innerText.replace(/-/g,'')
        }
    };
    const getContent = function (content,date) {
        d.innerHTML = content;
        all[date] = d.querySelector('#xw_box').innerHTML;
    };
    return {
        fetch(text) {
            // text = "  <a href=\"/xcs/yqtb/202212/7272431ee60c4f4d953b0c16257c230e.shtml\" target=\"_blank\" title=\"说明\">说明</a><span class=\"ml\">2022-12-25</span>",
            let obj = text2linkAndDate(text);
            return fetch(`http://www.nhc.gov.cn${obj.link}`).then(_=>_.text()).then(_=>getContent(_,obj.date));
        },
        getAll() {
            return all;
        }
    }
})();
