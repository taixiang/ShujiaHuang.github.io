function Store() {
  this.data = {}
}

Store.prototype.set = function(k, v) {
  this.data['__key__' + k] = v
}

Store.prototype.remove = function(k) {
  delete this.data['__key__' + k]
}

Store.prototype.clear = function() {
  this.data = {}
}

Store.prototype.getValues = function() {
  var ret = []
  for (var key in this.data) {
    ret.push(this.data[key])
  }
  return ret
}

Store.prototype.fromArr = function(arr) {
  var self = this
  if (arr) {
    arr.forEach(function(v) {
      self.set(v, v)
    })
  }
}

function toLetters(num) {
  var mod = num % 26,
    pow = (num / 26) | 0,
    out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z')
  return pow ? toLetters(pow) + out : out
}

var QuestionUtils = (function() {
  var exports = {}

  var stores = []
  exports.stores = []

  exports.getAllValues = function() {
    if (!stores) {
      return []
    }
    return stores.map(function(store, index) {
      return {
        key: index,
        value: store.getValues()
      }
    })
  }

  exports.itemData = function() {
    return []
  }

  exports.getStore = function() {
    return []
  }

  function renderEachQuestion(rowIndex, question, dl, d, s) {
    $.each(d, function(i, item) {
      var className = 'def'
      if (s.indexOf(i) > -1) {
        className = className + ' active'
      }

      dl.append(
        '<dd class="'+className+'" data-i="' +
          i +
          '">' +
          '<div class="content"><div class="inner">' +
          item.body +
          '</div></div><div class="label">' +
          toLetters(i + 1) +
          '</div> </dd>'
      )
    })
  }
  exports.renderEachQuestion = renderEachQuestion

  // 释放上一次数据
  function release(dom) {
    dom.off('click')
    dom.html('')
    stores = []
    dom.removeClass()
  }

  function render(dom, arrayRes, options) {
    if (!arrayRes) {
      return
    }

    release(dom)

    var firstQuestion = arrayRes[0]
    dom.addClass('qtype' + firstQuestion.qtype)

    $.each(arrayRes, function(questionIndex, question) {
      var newStore = new Store()

      var dl = $('<dl data-row="' + questionIndex + '"></dl>')
      var title = '&nbsp;'
      if (question.title) {
        title = question.title
      }
      if (options && options.title) {
        dl.append(
          '<dt class="def" >' +
            '<div class="content"><div class="inner">' +
            title +
            '</div></div><div class="label">' +
            question.index +
            '. </div> </dt>'
        )
      }
      if (question.qtype === 0 || question.qtype === 1) {
        var d = exports.itemData(questionIndex, question)
        var s = exports.getStore(questionIndex, question)

        newStore.fromArr(s)

        renderEachQuestion(questionIndex, question, dl, d, s)
      }
      dom.append(dl)

      stores.push(newStore)
    })

    if (firstQuestion.qtype === 0) {
      dom.on('click', 'dd', function() {
        var self = $(this)
        var dl = self.parent()
        var rowIndex = dl.data('row')
        var i = self.data('i')
        dl.find('dd').removeClass('active')
        self.addClass('active')

        stores[rowIndex].clear()
        stores[rowIndex] && stores[rowIndex].set(i, i)
        if (options && options.onSelected) {
          options.onSelected(
            firstQuestion.qtype,
            stores[rowIndex],
            rowIndex,
            i,
            stores
          )
        }
      })
    } else if (firstQuestion.qtype === 1) {
      //多选
      dom.on('click', 'dd', function() {
        var self = $(this)
        var dl = self.parent()
        var rowIndex = dl.data('row')
        var i = self.data('i')
        if (self.hasClass('active')) {
          self.removeClass('active')
          stores[rowIndex] && stores[rowIndex].remove(i)
        } else {
          self.addClass('active')
          stores[rowIndex] && stores[rowIndex].set(i, i)
        }
        if (options && options.onSelected) {
          options.onSelected(
            firstQuestion.qtype,
            stores[rowIndex],
            rowIndex,
            i,
            stores
          )
        }
      })
    }
  }

  exports.render = render

  return exports
})()
