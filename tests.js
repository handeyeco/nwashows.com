function _generateMockShow(extend = {}) {
  const base = {
    title: "This is the name of the show",
    description: "This is the description of the show",
    eventLink: "https://stubs.net/tickets/4577/danielle-nicole",
    venueName: "George's Majestic Lounge",
    venueLocation: "https://goo.gl/maps/xvDGNH7bRvTPcVKT6",
    lineup: "This Is A Band, Cool Band Name, The Neatos",
    date: (new Date()).toISOString().split('T')[0],
    time: "19:00",
    cost: "20.00",
    ageLimit: "All ages",
    type: "music",
  }

  return {...base, ...extend}
}

const __tests__ = {
  [`processList returns something`]: () => {
    const rv = processList([])
    return !!rv
  },
  [`processList doesn't filter beginning of day`]: () => {
    const time = '00:00'
    const rv = processList([
      _generateMockShow({ time })
    ])
    return Object.values(rv)[0][0].time === time
  }, 
}

function runTests() {
  let failed = 0
  for (const [testName, test] of Object.entries(__tests__)) {
    const passed = test()
    if (!passed) {
      failed++
    }
    console.log(`${passed ? '||' : '=>'} ${testName}: ${passed ? 'passed' : 'failed!!!'}`)
  }

  console.log('======================')
  console.log(`${failed} failed tests`)
}

runTests()