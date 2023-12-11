import express from "express"

import{fileURLToPath} from 'url'
import{join, dirname} from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 5000;

app.set('view engine', 'pug')
app.set('views', 'src/views')
app.use('/js',express.static(join(__dirname,'src', 'js')))
app.use('/img', express.static(join(__dirname, 'src', 'img')))
app.get("/", (req, res, next)=>{
    return res.render('index')
})
app.listen(PORT,() => {
    console.log(PORT)
})