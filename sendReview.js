import nodemailer from "nodemailer"
import fs from "fs"
import sent from "./sent.json" assert { type: 'json' }
import review1 from "./review1.json" assert { type: 'json' }
import review2 from "./review2.json" assert { type: 'json' }

const getReviewItem = (link, type) => {
    const word = sent[link]

    return `
        <p>${word}:&nbsp;<a href="${link}">${link}</a></p>
        <div style="display: flex;">
            <button style="background-color: green; margin-right: 20px;"><a href="http://52.194.225.132/review${type}.html/?isCorrect=1&link=${encodeURI(link)}" style="color: white; text-decoration: none;">Correct</a></button>
            <button style="background-color: red;"><a href="http://52.194.225.132/review${type}.html/?isCorrect=0&link=${encodeURI(link)}" style="color: white; text-decoration: none;">Incorrect</a></button>
        </div>
        <br/>
        -----------------------------------
        <br/>
    `
}

const sendReviewMail = () => {
    const review1Items = review1.map((link) => getReviewItem(link, "1"))
    const review2Items = review2[0].map((link) => getReviewItem(link, "2"))

    const mailOptions = {
        from: `"sanzerinf@gmail.com"`,
        to: "akkimysite@gmail.com",
        subject: "Morning review",
        html: `
        <html>
        <body>
            ${review1Items.join("")}
            ${review2Items.join("")}
        </body>
        </html>
        `
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
                const review2Copy = [...review2]
                review2Copy.shift()
                review2Copy.push([])
                fs.writeFileSync("./review2.json", JSON.stringify(review2Copy, null, 2), "utf8");
            } catch(err) {
                console.log(err)
            }
            console.log("Email has been sent");
            res.send(info);
        }
    });
}

sendReviewMail()