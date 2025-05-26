const express = require('express')
const app = express()
const handlebars = require('express-handlebars').engine
const bodyParser = require('body-parser')
const { where } = require('sequelize')
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./projetoweb-9c5af-aaa23-firebase-adminsdk-fbsvc-9070fa53a5.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({extends: false}))
app.use(bodyParser.json())
app.use(express.static('css'));

const hbs = handlebars({
    dafaultLayout: "main",
    helpers: {
        eq: (a, b) => a == b,
    },
})

app.engine('handlebars', hbs)

app.get('/', function(req, res){
    res.render("primeira_pagina")
})

app.post("/cadastrar", function (req, res) {
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Agendamento adicionado')
        res.redirect("/consulta")
 
    }).catch(function(erro){
        res.redirect("Erro ao criar o post: " +erro)
    })
   
 })

 app.post("/editar/:id", async (req, res) => {
  const id = req.params.id
  try {
    await db.collection('agendamentos').doc(id).update({
      nome: req.body.nome,
      telefone: req.body.telefone,
      origem: req.body.origem,
      data_contato: req.body.data_contato,
      observacao: req.body.observacao
    })
    res.redirect("/consulta")
  } catch (erro) {
    res.send("Erro ao atualizar agendamento: " + erro)
  }
})


 app.get('/consulta', async(req, res) =>{
     try {
    const snapshot = await db.collection('agendamentos').get()
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    res.render("consulta", { posts })
  } catch (erro) {
    res.send("Erro ao consultar agendamentos: " + erro)
  }
})

 app.get("/excluir/:id", async (req, res) => {
  try {
    await db.collection('agendamentos').doc(req.params.id).delete()
    res.redirect("/consulta")
  } catch (erro) {
    res.send("Erro ao excluir agendamento: " + erro)
  }
})


 app.get("/editar/:id", async (req, res) => {
  try {
    const doc = await db.collection('agendamentos').doc(req.params.id).get()
    if (!doc.exists) {
      return res.send("Agendamento não encontrado.")
    }
    res.render("editar", { post: { id: doc.id, ...doc.data() } })
  } catch (erro) {
    res.send("Erro ao carregar agendamento para edição: " + erro)
  }
})

app.get('/confirmacao', function (req, res){
    res.render('confirmacao')
})

app.listen(8081, function(){
    console.log('Servidor Ativo!')
})