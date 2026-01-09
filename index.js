import puppeteer from "puppeteer"

const run = () => {
    console.log("Contributions not found for today. Streak saver script should run.")
    process.exit(1)
}

//get the github username of the person running this from environment variables (planted from context)
const username = process.env.GITHUB_REPOSITORY_OWNER || "dxxxxy"

//get timezone from environment variables
const timezone = process.env.TIMEZONE || "America/Montreal"

//open browser
const browser = await puppeteer.launch()

//open a new page
const page = await browser.newPage()

//emulate timezone to get correct contribution graph
await page.emulateTimezone(timezone)

//navigate to the user's github profile
await page.goto(`https://github.com/${username}`)

//wait for the contribution graph to load
const contributionDiv = await page.waitForSelector(".js-yearly-contributions").catch(run)

//get and format today's date
const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
}).format(new Date())

//find the td cell with data-date="xxxx-xx-xx" for today's date
const tdCell = await contributionDiv.$(`td[data-date="${date}"]`).catch(run)

//check if td cell has aria-describedby="contribution-graph-legend-level-0" for no contributions
const ariaDescribedby = await tdCell.evaluate(el => el.getAttribute("aria-describedby")).catch(run)

//invert return values (1 means something amiss and we want to run it. 0 means all good (this also affects process.exit codes))
if (ariaDescribedby === "contribution-graph-legend-level-0") run()
else {
    console.log("Contributions found for today. Streak saver script should not run.")
    process.exit(0)
}