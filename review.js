import express from 'express'
import fs from 'fs'
import review1 from './review1.json' assert { type: 'json' }
import review2 from './review2.json' assert { type: 'json' }

const app = express()
const port = 3000

app.get('/review1', (req, res) => {
  const isCorrect = req.query.isCorrect
  const link = decodeURI(req.query.link)

  // If the answer is correct, remove the link from review1 and move it review2 for 7 days
  if (isCorrect === "1") {
    const review1Copy = review1.filter(l => l !== link)
    fs.writeFileSync("./review1.json", JSON.stringify(review1Copy, null, 2), "utf8");
    const review2Copy = [...review2]
    review2Copy[6].push(link)
    
    fs.writeFileSync("./review2.json", JSON.stringify(review2Copy, null, 2), "utf8");
  }
  res.send("Done")
})

app.get('/review2', (req, res) => {
  const isCorrect = req.query.isCorrect
  const link = decodeURI(req.query.link)

  // If the answer is incorrect, add the link back to review1
  if (isCorrect === "0") {
    const review1Copy = [...review1Copy, link]
    fs.writeFileSync("./review1.json", JSON.stringify(review1Copy, null, 2), "utf8");
  }
  res.send("Done")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})