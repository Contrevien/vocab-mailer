import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import AdBlockerPlugin from "puppeteer-extra-plugin-adblocker"
import nodemailer from "nodemailer"
import fs from "fs"
import sent from "./sent.json" assert { type: 'json' }
import review1 from "./review1.json" assert { type: 'json' }

puppeteer.use(StealthPlugin())
puppeteer.use(AdBlockerPlugin({ blockTrackers: true }))

const getQuotes = async (sent) => {
  const browser = await puppeteer.launch({
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto("https://japanesetest4you.com/jlpt-n1-vocabulary-list/", {
    waitUntil: "domcontentloaded"
  });

  await page.screenshot({ path: "./test.png" })

  await page.waitForSelector("#main #content .entry a", { timeout: 5_000 });

  let details = await page.evaluate(() => {
    const vocabsLength = document.querySelectorAll("#main #content .entry a").length;
    const vocab = document.querySelector(`#main #content .entry p:nth-of-type(${Math.floor(Math.random() * vocabsLength)}) a`)
    
    const link = vocab.getAttribute("href")
    const text = vocab.innerHTML;
    return { text, link }
  });

  while (!!sent[details.link]) {
    details = await page.evaluate(() => {
        const vocabsLength = document.querySelectorAll("#main #content .entry a").length;
        const vocab = document.querySelector(`#main #content .entry p:nth-of-type(${Math.floor(Math.random() * vocabsLength)}) a`)
        
        const link = vocab.getAttribute("href")
        const text = vocab.innerHTML;
        return { text, link }
      });
  }


  sendMail(details.text, details.link)

  await browser.close()
};


const sendMail = (subject, link) => {
    const mailOptions = {
        from: `"sanzerinf@gmail.com"`,
        to: "akkimysite@gmail.com",
        subject: subject,
        html: `<html><a href="${link}">Read more</a></html>`
    };
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "sanzerinf@gmail.com",
            pass: "bavykvyxjrzghfvd"
        }
    });

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
            res.status(400);
            res.send({error: "Failed to send email"});
        } else {
            try {
                const sentCopy = {...sent}
                sentCopy[link] = subject.split(" ")[0]
                fs.writeFileSync("./sent.json", JSON.stringify(sentCopy, null, 2), "utf8");
                const review1Copy = [...review1]
                review1Copy.push(link)
                fs.writeFileSync("./review1.json", JSON.stringify(review1Copy, null, 2), "utf8");
            } catch(err) {
                console.log(err)
            }
            console.log("Email has been sent");
            res.send(info);
        }
    });
}

getQuotes(sent);