function processList(input) {
  if (!Array.isArray(input)) {
    throw new Error('processList needs an array')
  }

  const beginningOfDay = new Date()
  beginningOfDay.setHours(0,0,0,0)

  
  let list = input.reduce((acc, e) => {
    // Filter events before today and group dates
    e.datetime = new Date(`${e.date}T${e.time}`)
    if (e.datetime.getTime() >= beginningOfDay.getTime()) {
      acc[e.date] = acc[e.date] || []
      acc[e.date].push(e)
    }

    return acc
  }, {})

  // Sort events by time within date groups
  Object.keys(list).forEach(date => {
    list[date] = list[date].sort((a, b) => {
      return a.datetime.getTime() - b.datetime.getTime()
    })
  })

  // Sort and stash dates
  list.__sortedDates = Object.keys(list).sort((a, b) => {
    let aInt = parseInt(a.replace('-', ''))
    let bInt = parseInt(b.replace('-', ''))
    return aInt - bInt
  })

  return list
}

const _dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thurday',
  'Friday',
  'Saturday',
]
const _monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
function formatDateHeader(dateStr) {
  const date = new Date(`${dateStr}T00:00+00:00`)

  const day = _dayNames[date.getUTCDay()]
  const month = _monthNames[date.getUTCMonth()]
  return `${day} - ${month} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
}

function generateEventHtml(event) {
  const eventLI = document.createElement('li')
  eventLI.className = 'event-listing'

  // convert military time
  let [hours, minutes] = event.time.split(':')
  let am = true
  let parsedHours = parseInt(hours)
  if (parsedHours >= 12) {
    am = false
    if (parsedHours > 12) {
      parsedHours -= 12
    }
  }

  eventLI.innerHTML = `
    <span class="event-listing__title">${event.title || event.lineup}</span>
    ${
      event.venueLink
        ? `at <a class="event-listing__venue" href="${event.venueLink}" target="_blank">${event.venueName}</a>` 
        : `at <span class="event-listing__venue">${event.venueName}</span>`
    }
    <span class="event-listing__details">[${parsedHours}:${minutes}${am ? 'am' : 'pm'} - ${event.ageLimit}]</span>
    ${
      event.title ? `<br><span class="event-listing__lineup">&#x21B3; ${event.lineup}</span>` : ''
    }
  `

  return eventLI
}

function generateDayHtml(list, date) {
  const dayLI = document.createElement('li')

  const dayHead = document.createElement('h3')
  dayHead.innerText = formatDateHeader(date)
  dayLI.append(dayHead)

  const dayUL = document.createElement('ul')
  list[date].forEach(event => {
    dayUL.append(generateEventHtml(event))
  })
  dayLI.append(dayUL)

  return dayLI
}

function generateListHtml(list) {
  if (!list) {
    throw new Error('renderList not provided an input')
  }

  const baseUL = document.createElement('ul')
  list.__sortedDates.forEach(date => {
    baseUL.append(generateDayHtml(list, date))
  })

  return baseUL
}

function renderList(list) {
  const mount = document.getElementById('showlist-mount')
  const html = generateListHtml(list)
  mount.append(html)
}

function main() {
  const list = processList(__the__list__)
  renderList(list)
}

main()