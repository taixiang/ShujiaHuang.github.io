function toLetters(num) {
    var mod = num % 26,
        pow = (num / 26) | 0,
        out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z')
    return pow ? toLetters(pow) + out : out
}

var components = {}

components.createQuestionBody = function(dom, text) {
    var div = $('<div class="def-body"></div>')
    div.html(text)
    dom.append(div)
}

components.createAnswers = function(dom, ret, options) {
    var d = ret.data
    var myanwser = ret.ans
    var dl = $('<dl class="defines"></dl>')
    if (options) {
        var title = options.title ? (options.title + '').trim() : '&nbsp;'
        var label = options.label
        if (!title || title.length < 1) {
            title = '&nbsp;'
        }
        dl.append(
            '<dt class="def" >' +
            '<div class="content"><div class="inner">' +
            title +
            '</div></div><div class="label">' +
            label +
            '. </div> </dt>'
        )
    }

    $.each(d, function(i, item) {
        var className = 'def'

        if (item.is_answer) {
            className += ' is_answer'
        }

        if (myanwser) {
            if (myanwser.indexOf(item.uuid) > -1) {
                className += ' is_my_answer'
            }
        }

        dl.append(
            '<dd class="' +
            className +
            '" data-i="' +
            i +
            '">' +
            '<div class="content"><div class="inner">' +
            item.body +
            '</div></div><div class="label">' +
            toLetters(i + 1) +
            '</div> </dd>'
        )
    })

    dom.append(dl)
}

components.createDifficultItem = function(content, d) {
    var item = $('<div class="item"></div>')
    item.html('<div><span>' + d[0] + '</span>' + d[1] + '</div>')
    content.append(item)
}

components.createDifficult = function(dom, d) {
    var div = $('<div class="difficult"></div>')
    var divcontent = $('<div class="content"></div>')
    var divrole = $('<div class="role"></div>')

    // components.createDifficultItem(divcontent, [
    //   '用时：',
    //   '1'
    // ])

    if (d.hasOwnProperty('get_difficulty_display')) {
        components.createDifficultItem(divcontent, [
            '难度：',
            d.get_difficulty_display
        ])
    }

    // components.createDifficultItem(divcontent, [
    //   '全站正确率：',
    //   '1'
    // ])

    div.append(divcontent)
    div.append(divrole)
    dom.append(div)
}

components.createAnalysisItem = function(content, d) {
    var item = $('<div class="item"></div>')
    item.html(
        '<div><div class="title">' +
        d[0] +
        '</div><div class="body">' +
        d[1] +
        '</div></div>'
    )
    content.append(item)
}

components.createAnalysis = function(dom, d, analysis) {
    var div = $('<div class="analysis"></div>')

    if (analysis) {
        components.createAnalysisItem(div, ['解析', analysis])
    }

    if (d.chapter) {
        var html = d.chapter
            .map(function(v) {
                return v.name
            })
            .join()
        components.createAnalysisItem(div, ['知识点', html])
    }

    // components.createAnalysisItem(div, [
    //   '考频',
    //   '这里是一大段解析这里是一大段解析这里是一大段解析这里是一大段解析这里是一大段解析这里是一大段解析'
    // ])

    dom.append(div)
}

components.create = function(selector, options) {
    var ret = {}
    ret.dom = $(selector)

    if (!options) {
        options = {
            type: 0,
            getAnwsers: function() {
                return []
            }
        }
    }

    ret.init = function() {}

    ret.release = function() {
        ret.dom.removeClass()
        ret.dom.html('')
    }

    ret.render = function(answer) {
        ret.release()
        ret.dom.addClass('webview' + options.type)
        if (ret.beforeRender) {
            ret.beforeRender(answer, options)
        }
    }

    ret.init()

    return ret
}
