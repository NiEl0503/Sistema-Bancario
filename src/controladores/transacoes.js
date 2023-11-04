const express = require('express');
const bancodedados = require('../bancodedados');

function validarDadosUsuarios(data) {
    const { numero_conta, valor } = data;
    return !numero_conta || !valor || valor <= 0;
}

function encontrarConta(numero_conta) {
    return bancodedados.contas.find(conta => conta.numero === numero_conta);
}

function depositar(req, res, next) {
    const { numero_conta, valor } = req.body;
  
    if (validarDadosUsuarios(req.body) || !numero_conta || !valor) {
        return res.status(400).json({ mensagem: 'O número da conta e o valor são obrigatórios e o valor deve ser positivo' });
    }
   
    const conta = encontrarConta(numero_conta);
    if (!conta) {
      return res.status(404).json({ mensagem: 'Conta não encontrada' });
    }
  
    conta.saldo += valor;
  
    const transacoes = {
      data: new Date().toLocaleString(),
      numero_conta,
      valor
    };
  
    bancodedados.depositos.push(transacoes);
  
    res.status(204).send();
}

function validarDados(data) {
    const { numero_conta, valor, senha } = data;
    return !numero_conta || !valor || !senha;
}

function validarSaldoSuficiente(conta, valor) {
    return conta.saldo >= valor;
}

function sacarDinheiro(req, res, next) {
    const { numero_conta, valor, senha } = req.body;
    if (validarDados(req.body)) {
        return res.status(400).json({ mensagem: 'Número da conta, valor e senha são obrigatórios' });
    }

    const conta = encontrarConta(numero_conta);

    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta não encontrada' });
    }

    if (conta.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'Senha inválida' });
    }

    if (!validarSaldoSuficiente(conta, valor)) {
        return res.status(403).json({ mensagem: 'Saldo insuficiente para fazer o saque' });
    }

    conta.saldo -= valor;

    const transacao = {
        data: new Date().toLocaleString(),
        numero_conta: numero_conta,
        valor: valor
    };

    bancodedados.saques.push(transacao);

    return res.status(204);
}

function transferir(req, res, next) {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ mensagem: 'Número da conta de origem, número da conta de destino, valor e senha são obrigatórios' });
    }

    const contaOrigem = encontrarConta(numero_conta_origem);
    const contaDestino = encontrarConta(numero_conta_destino);

    if (!contaOrigem || !contaDestino) {
        return res.status(404).json({ mensagem: 'Conta de origem ou conta de destino não encontrada' });
    }

    if (contaOrigem.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'Senha inválida para a conta de origem' });
    }

    if (!validarSaldoSuficiente(contaOrigem, valor)) {
        return res.status(403).json({ mensagem: 'Saldo insuficiente na conta de origem para fazer a transferência' });
    }

    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    const transacao = {
        data: new Date().toLocaleString(),
        numero_conta_origem,
        numero_conta_destino,
        valor
    };

    bancodedados.transferencias.push(transacao);

    res.status(204).send();
}

module.exports = {
    depositar,
    sacarDinheiro,
    transferir
};