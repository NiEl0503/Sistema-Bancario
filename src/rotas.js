const express = require('express');
const router = express();
const contaControladora = require('./controladores/conta');


router.get('/contas', contaControladora.verificarSenha, contaControladora.listarContas);
router.post('/contas', contaControladora.criarConta);
router.put('/contas/:numeroConta/usuario', contaControladora.atualizarUsuarioConta);
router.delete('/contas/:numeroConta', contaControladora.excluirConta);


module.exports = router;