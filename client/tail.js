(function() {

function ago (msec) {
  let secs,mins,hrs,days,weeks,months,years
  secs = msec/1000
  if ((mins = secs/60) < 2) return `${Math.round(secs)} seconds`
  if ((hrs = mins/60) < 2) return `${Math.round(mins)} minutes`
  if ((days = hrs/24) < 2) return `${Math.round(hrs)} hours`
  if ((weeks = days/7) < 2) return `${Math.round(days)} days`
  if ((months = days/31) < 2) return `${Math.round(weeks)} weeks`
  if ((years = days/365) < 2) return `${Math.round(months)} months`
  return `${Math.round(years)} years`
}

/*
const expand = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*(.+?)\/g, '<i>$1</i>')
};

const absolute = (url) => {
  // https://github.com/bitinn/node-fetch/issues/481
  return url.replace(/^(https?:)\/([^\/])/,`$1//${location.host}/$2`)
}

const parse = (text) => {
  var schedule = {sites:{}, chunk:'hour', interval:5000, keep:24}
  let output = text.split(/\r?\n/).map (line => {
    var m
    if (m = line.match(/^HOUR (\d+)$/)) {
      schedule.chunk = 'hour'
      schedule.interval = 1000*60*60 / m[1]
    } else if (m = line.match(/^DAY (\d+)$/)) {
      schedule.chunk = 'day'
      schedule.interval = 1000*60*60*24 / m[1]
    } else if (m = line.match(/^MONTH (\d+)$/)) {
      schedule.chunk = 'month'
      schedule.interval = 1000*60*60*24*30 / m[1]
    } else if (m = line.match(/^KEEP (\d+)$/)) {
      schedule.keep = m[1]*1
    } else if (m = line.match(/^SENSOR (\w+) (https?:\S+)$/)) {
      schedule.sites[m[1]] = absolute(m[2])
      line = `SENSOR <a href="${absolute(m[2])}" target=_blank>${m[1]} <img src="/images/external-link-ltr-icon.png"></a>`
    } else {
      line = `<font color=gray>${expand(line)}</font>`
    }
    return line
  }).join('<br>')
  return {output, schedule}
}
*/

const lap = ($item) => {
  let ticks = $item[0].ticks
  ticks.start = ticks.end
  ticks.end = ticks.now = Date.now()
}

const caption = ($item) => {
  let ticks = $item[0].ticks
  let now = ticks.now = Date.now()
  let lap = ticks.start ? `${ago(ticks.end-ticks.start)} lap, ` : ''
  let run = ticks.end ? `${ago(ticks.now-ticks.end)} waiting` : ''
  return `${lap} ${run}`
}

const consumes = {
  '.server-source': ($item, result) => {
    lap($item)
    $item.find('.content').html(`
      <p class=caption>${caption($item)}</p>
      <pre>${JSON.stringify(result,null,2)}</pre>
    `)
  }
}

const listener = (e) => {
  // Find all items for the tail plugin in the lineup
  // For each, find items of the consuming type earlier in the page
  // If pageItem is one of those, forward the event on to the item specific handler
  // The item specific handler then chooses whether to act on it
  //console.log("In listener for", e.pageItem, "with result", e.result)
  $('.tail').each((i, item) => {
    if(!item.consuming || item.consuming.indexOf(e.pageItem) == -1) return
    consumes[e.type]($(item), e.result)
  })
}

if (Object.keys(consumes).length > 1) {
  console.log("WARN: Consuming data from multiple capabilities is not implemented!")
}
Object.keys(consumes).forEach(c => {
  console.log('Tail is registering as a listener for', c, 'events')
  document.addEventListener(c, listener)
})

// If there are .server-source's in the DOM, this will only be calleed
// once they have been initialized.
const emit = ($item, item) => {
  // TODO: Rework in order to support multiple types.
  $item[0].consuming = []
  $item[0].ticks = {}
  console.log('emitting', item)
  console.log('emitting tail')
  $item.empty()
  $item.append(`
    <div style="background-color:#eee; padding:15px; margin-block-start:1em; margin-block-end:1em;">
    No sources found.
    </div>`);
};

const bind = ($item, item) => {
  // TODO: Allow editing of content / create DSL to configure # of entries to keep.
  let candidates = $(`.item:lt(${$('.item').index($item)})`).filter(".server-source")
  // TODO: Only find those before...
  let sources = []
  if (candidates.size()) {
    $item.empty()
    // TODO: Check on ordering...
    let service = candidates[candidates.length-1].service()
    console.log('service', service)
    let pageItem = `${service.page}/${service.id}`
    $item[0].consuming.push(pageItem)
    $item[0].ticks.end = Date.now()
    $item.append(`
      <div style="background-color:#eee; padding:15px; margin-block-start:1em; margin-block-end:1em;">
      Tailing ${pageItem}
      <div class="content"><p class=caption></p></div>
      </div>`);
    const tick = () => {$item.find('.content p').text(caption($item))}
    tick()
    clearInterval($item[0].interval)
    $item[0].interval = setInterval(tick, 1000)
    return
  }

  /*
  $item.dblclick(() => {
    return wiki.textEditor($item, item);
  });

  let $button = $item.find('button')
  let parsed = parse(item.text)

  const action = (command) => {
    $button.prop('disabled',true)
    $page = $item.parents('.page')
    if($page.hasClass('local')) {
      return
    }
    slug = $page.attr('id').split('_')[0]
  }
  $button.click(event => action({action:$button.text(),schedule:parsed.schedule}))
  action({})
  */
}

console.log('hello from tail!')
console.log(typeof window)
console.log(window)
if (typeof window !== "undefined" && window !== null) {
  window.plugins.tail = {consumes, emit, bind};
}
}).call(this);
