const express = require('express');
const router = express();
const contaControladora = require('./controladores/conta');
const transacoesControladora = require('./controladores/transacoes');

router.get('/contas', contaControladora.verificarSenha, contaControladora.listarContas);
router.post('/contas', contaControladora.criarConta);
router.put('/contas/:numeroConta/usuario', contaControladora.atualizarUsuarioConta);
router.delete('/contas/:numeroConta', contaControladora.excluirConta);
router.post('/transacoes/depositar', transacoesControladora.depositar);
router.post('/transacoes/sacar', transacoesControladora.sacarDinheiro);
router.post('/transacoes/transferir', transacoesControladora.transferir);
router.get('/contas/saldo', contaControladora.saldoConta);
router.get('/contas/extrato', contaControladora.extrato);

module.exports = router;