function processList(input) {
  if (!Array.isArray(input)) {
    throw new Error("processList needs an array");
  }

  const beginningOfDay = new Date();
  beginningOfDay.setHours(0, 0, 0, 0);

  let list = input.reduce((acc, e) => {
    // Filter events before today and group dates
    e.datetime = new Date(`${e.date}T${e.time}`);
    if (e.datetime.getTime() >= beginningOfDay.getTime()) {
      acc[e.date] = acc[e.date] || [];
      acc[e.date].push(e);
    }

    return acc;
  }, {});

  // Sort events by time within date groups
  Object.keys(list).forEach((date) => {
    list[date] = list[date].sort((a, b) => {
      return a.datetime.getTime() - b.datetime.getTime();
    });
  });

  // Sort and stash dates
  list.__sortedDates = Object.keys(list).sort((a, b) => {
    let aInt = parseInt(a.replaceAll("-", ""));
    let bInt = parseInt(b.replaceAll("-", ""));
    return aInt - bInt;
  });

  return list;
}

const _dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thurday",
  "Friday",
  "Saturday",
];
const _monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
function formatDateHeader(dateStr) {
  const date = new Date(`${dateStr}T00:00+00:00`);

  const day = _dayNames[date.getUTCDay()];
  const month = _monthNames[date.getUTCMonth()];
  return `${day} - ${month} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function generateEventHtml(event) {
  const eventLI = document.createElement("li");
  eventLI.className = "event-listing";

  // convert military time
  let [hours, minutes] = event.time.split(":");
  let am = true;
  let parsedHours = parseInt(hours);
  if (parsedHours >= 12) {
    am = false;
    if (parsedHours > 12) {
      parsedHours -= 12;
    }
  }

  eventLI.innerHTML = `
  <p>
    <a class="event-listing__link" href="${event.eventLink}" target="_blank">${
    event.title || event.lineup
  }</a>
    ${
      event.venueLink
        ? `at <a class="event-listing__venue" href="${event.venueLink}" target="_blank">${event.venueName}</a>`
        : `at <span class="event-listing__venue">${event.venueName}</span>`
    }
    <span class="event-listing__details">
      ${parsedHours}:${minutes}${am ? "am" : "pm"}
    </span>
    </p>
    ${event.title ? `<p class="event-listing__lineup">${event.lineup}</p>` : ""}
  `;

  return eventLI;
}

function generateDayHtml(list, date) {
  const dayLI = document.createElement("li");
  dayLI.className = "day-listing";

  const dayHead = document.createElement("h3");
  dayHead.innerText = formatDateHeader(date);
  dayLI.append(dayHead);

  const dayUL = document.createElement("ul");
  list[date].forEach((event) => {
    dayUL.append(generateEventHtml(event));
  });
  dayLI.append(dayUL);

  return dayLI;
}

function generateListHtml(list) {
  if (!list) {
    throw new Error("renderList not provided an input");
  }

  const baseUL = document.createElement("ul");
  list.__sortedDates.forEach((date) => {
    baseUL.append(generateDayHtml(list, date));
  });

  return baseUL;
}

function renderList(list, isSearching) {
  const mount = document.getElementById("showlist-mount");
  mount.innerHTML = "";

  const isEmpty = list.__sortedDates.length === 0;
  if (isSearching && isEmpty) {
    mount.innerHTML = `<p class="empty-list">Sorry, we couldn't find what you were looking for.</p>`;
    return;
  } else if (isEmpty) {
    mount.innerHTML = `<p class="empty-list">We don't know about any shows right now. Feel free to submit one!</p>`;
    return;
  }

  const html = generateListHtml(list);
  mount.append(html);
}

function filterList(event) {
  const lowerSearch = event.target.value.toLowerCase();
  const filtered = __the__list__.filter((l) => {
    if (!lowerSearch) return true;

    return (
      l.title.toLocaleLowerCase().includes(lowerSearch) ||
      l.venueName.toLocaleLowerCase().includes(lowerSearch) ||
      l.lineup.toLocaleLowerCase().includes(lowerSearch)
    );
  });

  const newList = processList(filtered);
  renderList(newList, lowerSearch);
}

function main() {
  const list = processList(__the__list__);
  renderList(list);

  const searchInput = document.getElementById("search-input");
  searchInput.oninput = filterList;
}

main();
