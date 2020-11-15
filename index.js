import lighthouse from 'lighthouse'
import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'

export const launchChromiumBrowser = () => {
    return puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox'],
        headless: true
    })
}

export const getWebsiteUrl = () => {
    let websiteUrl = process.env.WEBSITE_URL
    if (websiteUrl) {
        return websiteUrl
    }
    console.error('No URL provided for the analysis.')
    process.exit(1)
}

export const getBrowserWsPort = (browser) => parseInt(new URL(browser.wsEndpoint()).port, 10)

export const runLighthouseAnalysis = (url, port) => {
    return lighthouse(url, {
        port,
        output: process.env.OUTPUT_FORMAT || 'json',
        logLevel: 'error'
    })
}

export const writeResultsToFile = (analysisResults) => {
    const outputFormat = analysisResults.lhr.configSettings.output
    writeFileSync(`/output/results.${outputFormat}`, analysisResults.report, { encoding: 'utf-8' })
}

export const logResultsToConsole = (analysisResults) => {
    console.log(`Lighthouse results per categories:`)
    Object.values(analysisResults.lhr.categories).forEach(({ title, score }) => {
        console.log(`${title}: ${score * 100}`)
    })
}

(async () => {
    try {
        const browser = await launchChromiumBrowser()

        const analysisResults = await runLighthouseAnalysis(getWebsiteUrl(), getBrowserWsPort(browser))

        writeResultsToFile(analysisResults)

        logResultsToConsole(analysisResults)

        await browser.close()

        process.exit(0)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
})()
