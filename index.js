//get timezone from environment variables
const timezone = process.env.TIMEZONE || "America/Montreal"

//get current date and time
const now = new Date()

//format current time
const hour = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    hour: "2-digit",
    hour12: false
}).format(now)

//run this script only if the time is 11pm (cron is UTC strictly, and daylight savings will make it drift, so we check the time here)
if (hour !== "23") {
    console.log("Current time is not 11 PM yet. Exiting without running the streak saver script.")
    process.exit(0)
}

import puppeteer from "puppeteer"

//insert this in all error catches (if in doubt, run the streak saver)
const panicRun = () => {
    console.log("Something is wrong. Streak saver script should run.")
    process.exit(1)
}

//get the github username of the person running this from environment variables (planted from context)
const username = process.env.GITHUB_REPOSITORY_OWNER || "dxxxxy"

//open browser
const browser = await puppeteer.launch()

//open a new page
const page = await browser.newPage()

//emulate timezone to get correct contribution graph
await page.emulateTimezone(timezone)

//navigate to the user's github profile
await page.goto(`https://github.com/${username}`)

//wait for the contribution graph to load
const contributionDiv = await page.waitForSelector(".js-yearly-contributions").catch(panicRun)

//format current date
const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
}).format(now)

//find the td cell with data-date="xxxx-xx-xx" for current date
const tdCell = await contributionDiv.$(`td[data-date="${date}"]`).catch(panicRun)

//check if td cell has aria-describedby="contribution-graph-legend-level-0" for no contributions
const ariaDescribedby = await tdCell.evaluate(el => el.getAttribute("aria-describedby")).catch(panicRun)

//do not run if everything checks out
if (ariaDescribedby === "contribution-graph-legend-level-0") {
    console.log("No contributions found for today. Streak saver script should run.")
    process.exit(1)
} else {
    console.log("Contributions found for today. Streak saver script should not run.")
    process.exit(0)
}