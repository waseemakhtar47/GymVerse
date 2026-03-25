const express = require('express')
const app = express()
const path = require('path')
const port = 3000


//parsers
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//serve static files
app.use(express.static(path.join(__dirname,'public')))
//setting up view engine
app.set('view engine','ejs')


//routes
app.get('/',(req,res)=>{
    res.render('index')
})

app.listen(3000,()=>{
    console.log(`Server is running on port ${port}`)
})