const express = require('express');
const bancodedados = require('../bancodedados');

function verificarSenha(req, res, next) {
  const senhaBanco = req.query.senha_banco;

  if (!senhaBanco) {
    return res.status(400).json({ mensagem: 'A senha do banco deve ser informada' });
  }

  if (senhaBanco !== bancodedados.banco.senha) {
    return res.status(401).json({ mensagem: 'A senha do banco informada é inválida' });
  }
  next();
}

function listarContas(req, res) {
  const contasBancarias = bancodedados.contas;
  res.status(200).json(contasBancarias);
}

function validarDadosUsuarios(data) {
  const { nome, cpf, data_nascimento, telefone, email, senha } = data;
  return !nome || !cpf || !data_nascimento || !telefone || !email || !senha
}

function encontrarConta(numeroConta) {
  return bancodedados.contas.find(conta => conta.numero === numeroConta);
}

function criarUsuario(data) {
  const { nome, cpf, data_nascimento, telefone, email, senha } = data;
  return {
    nome,
    cpf,
    data_nascimento,
    telefone,
    email,
    senha,
  }
}

function criarConta(req, res, next) {
  if (validarDadosUsuarios(req.body)) {
    return res.status(400).json({ mensagem: 'preencha todos os campos' });
  }

  const usuario = criarUsuario(req.body)
  const dadosExistentes = bancodedados.contas.some(conta => conta.usuario.cpf === usuario.cpf || conta.usuario.email === usuario.email);

  if (dadosExistentes) {
    return res.status(400).json({ mensagem: 'Já existe uma conta com o cpf ou e-mail informado' });
  }

  const numeroConta = (bancodedados.contas.length + 1).toString();

  const novaConta = {
    numero: numeroConta,
    saldo: 0,
    usuario: usuario
  };

  bancodedados.contas.push(novaConta);

  return res.status(201).send();
}

function atualizarUsuarioConta(req, res, next) {
  if (validarDadosUsuarios(req.body)) {
    return res.status(400).json({ mensagem: 'preencha todos os campos' });
  }
  const usuario = criarUsuario(req.body)
  const numeroConta = req.params.numeroConta;
  const conta = encontrarConta(numeroConta);

  if (!conta) {
    return res.status(404).json({ mensagem: 'Conta não encontrada' });
  }

  const dadosExistentes = bancodedados.contas.some(conta => {
    return (conta.usuario.cpf === usuario.cpf || conta.usuario.email === usuario.email) && conta.numero !== numeroConta;
  });

  if (dadosExistentes) {
    return res.status(400).json({ mensagem: 'CPF ou e-mail já existente em outra conta' });
  }

  conta.usuario.nome = usuario.nome;
  conta.usuario.cpf = usuario.cpf;
  conta.usuario.data_nascimento = usuario.data_nascimento;
  conta.usuario.telefone = usuario.telefone;
  conta.usuario.email = usuario.email;
  conta.usuario.senha = usuario.senha;

  return res.status(204).send();
}

function excluirConta(req, res, next) {
  const numeroConta = req.params.numeroConta;
  const conta = encontrarConta(numeroConta);

  if (!conta) {
    return res.status(404).json({ mensagem: 'Conta não encontrada' });
  }

  if (conta.saldo !== 0) {
    return res.status(400).json({ mensagem: 'A conta só pode ser removida se o saldo for zero' });
  }

  bancodedados.contas = bancodedados.contas.filter(conta => conta.numero !== numeroConta);

  return res.status(204).send();
}

function verificarCredenciais(numero_conta, senha) {
  const conta = encontrarConta(numero_conta);
  if (!conta) {
      return { erro: 'Conta bancária não encontrada!' };
  }

  if (conta.usuario.senha !== senha) {
      return { erro: 'Senha inválida' };
  }

  return { conta };
}

function saldoConta(req, res) {
  const { numero_conta, senha } = req.query;
  const { erro, conta } = verificarCredenciais(numero_conta, senha);

  if (erro) {
      return res.status(erro === 'Conta bancária não encontrada!' ? 404 : 401).json({ mensagem: erro });
  }

  const saldo = conta.saldo;
  return res.status(200).json({ saldo });
}

function filtrarTransacoes(transacao, numero_conta, campo) {
  return transacao.filter(transacao => transacao[campo] === numero_conta);
}

function extrato(req, res) {
  const { numero_conta, senha } = req.query;
  const { erro, conta } = verificarCredenciais(numero_conta, senha);

  if (erro) {
      return res.status(erro === 'Conta bancária não encontrada!' ? 404 : 401).json({ mensagem: erro });
  }

  const extratos = {
      depositos: filtrarTransacoes(bancodedados.depositos, numero_conta, 'numero_conta'),
      saques: filtrarTransacoes(bancodedados.saques, numero_conta, 'numero_conta'),
      transferenciasEnviadas: filtrarTransacoes(bancodedados.transferencias, numero_conta, 'numero_conta_origem'),
      transferenciasRecebidas: filtrarTransacoes(bancodedados.transferencias, numero_conta, 'numero_conta_destino')
  };

  return res.status(200).json(extratos);
}

module.exports = {
  verificarSenha,
  listarContas,
  criarConta,
  atualizarUsuarioConta,
  excluirConta,
  saldoConta,
  extrato
};