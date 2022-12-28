//Carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()//Chamamos a função do express construtor???
//express é um módulo com mais funcionalidades que o http que vem por padrão 
//express tbm é de simples funcionalidade
const mongoose = require('mongoose')
const admin = require('./routes/admin') //já vem todas as rotas que criamos
const path = require('path')//Módulo path serve para trabalharmos com diretórios(manipular pastas)
const session = require('express-session')
const flash = require('connect-flash')
require('./models/postagens')
const Postagem = mongoose.model('postagens')
require('./models/categories')
const categoria = mongoose.model('categorias')

//Configurações
//sessão
app.use(session({
    secret: 'cursodenode',
    resave: true,
    saveUninitialized: true
}))
//flash
app.use(flash())
//middlewar
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    next()
})
//body Parser
//Body parser serve para receber dados de qualquer formulário de maneira eficiente
    app.use(bodyParser.urlencoded({extended:true}))
    app.use(bodyParser.json())
//hendlebars eficiente para a exibição do front-end
    app.engine('handlebars',handlebars.engine({defaulyLayout: 'main'}))
    app.set('view engine','handlebars')
//mongoose
    mongoose.Promise = global.Promise
    mongoose.connect('mongodb://localhost/blogapp').then(()=>{
        console.log("conectado com sucesso")
    }).catch((err)=>{
        console.log('erro ao se conectar '+err)
    })
//Public
    //a pasta q guarda nossos arquivos estaticos é a public
    app.use(express.static(path.join(__dirname,'public')))
    /*app.use((req,res,next)=>{
       
        next()
    })*/
//Rotas
//rota sem prefixo (usada no arquivo principal pra indicar rota principal) app.get('/'(req,res))
//localhost:8081/admin/posts ou /admin/ => prefixo criado abaixo
//oq permite criar um prefixo com um grupo de rotas é o metodo router
app.use('/admin',admin)
app.get('/',(req,res)=>{
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
        res.render('index',{postagens: postagens})    
    }).catch((error)=>{
        req.flash('error_msg','Houve um erro interno')
        res.redirect('/404')
    })
    
})

app.get('/postagem/:slug',(req,res)=>{
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
        if(postagem){
            res.render('postagem/index',{postagem: postagem})
        }else{
            req.flash('error_msg','Esta postagem não existe')
            res.redirect('/')
        }
    }).catch((error)=>{
        req.flash('error_msg','Houve um erro interno')
        res.redirect('/')
    })
})

app.get('/categorias',(req,res)=>{
    categoria.find().lean().then((categorias)=>{
        res.render('categorias/index',{categorias})
    }).catch((error)=>{
        req.flash('error_msg','Houve um erro interno ao listar as categorias')
        res.redirect('/')
    })
})

app.get('/categorias/:slug',(req,res)=>{
    categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
        if(categoria){
            Postagem.find({categoria: categoria._id}).then((postagens)=>{
                res.render('categorias/postagens',{postagens:postagens,categoria:categoria})
            }).catch((error)=>{
                req.flash('error_msg','Houve um erro ao listar os posts')
                res.redirect('/')
            })
        }else{
            req.flash('error_msg','Está categoria não exise')
            res.redirect('/')
        }
    }).catch((error)=>{
        app.flash('error_msg','Houve um erro interno ao carregar a página desta categoria')
        res.redirect('/')
    })
})

app.get('/404',(req,res)=>{
    res.send('Erro 404!')
})

app.get('/posts',(req,res)=>{
    res.send('posts route')
})


//Relacionado ao servidor
const PORT = 8081
app.listen(PORT,()=>{
    console.log('servidor está rodando')
})
