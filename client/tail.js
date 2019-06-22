(function() {
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

const consumes = {
  '.server-source': ($item, item, data) => {
    $item.clear()
    $item.append(`
      <div style="background-color:#eee; padding:15px; margin-block-start:1em; margin-block-end:1em;">
      ${new Date()} - ${data}
      </div>`);
  }
}

const listener = (...args) => {
  console.log(args)
  // Find all items for the tail plugin in the lineup
  // For each, find items of the consuming type earlier in the page
  // If slugItem is one of those, forward the event on to the item specific handler
  // The item specific handler then chooses whether to act on it
  console.log("In listener for", e.slugItem, "with result", e.result)
  $('.tail').each((i, item) => {
    console.log(item, item.consuming)
    if(item.consuming.find(e.slugItem) != -1) {
      $item.find(".tail").empty().append("div").text(new Date() + e.result)
    }
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
  let candidates = $(`.item:lt(${$('.item').index($item)})`)
  // TODO: Only find those before...
  let who = candidates.filter('.server-source')
  let sources = []
  if (who.size()) {
    $item.empty()
    // TODO: Check on ordering...
    let service = who[0].service()
    console.log('service', service)
    let slugItem = `${service.slug}/${service.id}`
    $item.append(`
      <div style="background-color:#eee; padding:15px; margin-block-start:1em; margin-block-end:1em;">
      Tailing ${slugItem}
      <div class="tail"></div>
      </div>`);
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
