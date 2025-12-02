import { Router } from "express";
import carrinhoController from "../carrinho/carrinho.controller.js";
import pagamentoController from "../pagamento/pagamento.controller.js";

const rotasAutenticadas = Router();

rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
rotasAutenticadas.get("/carrinho", carrinhoController.listar);
rotasAutenticadas.delete("/carrinho", carrinhoController.remover);
rotasAutenticadas.put("/carrinho/quantidade", carrinhoController.atualizarQuantidade);
rotasAutenticadas.post("/removerItem", carrinhoController.removerItem);
rotasAutenticadas.delete("/carrinho/todos", carrinhoController.excluirCarrinhoInteiro);
rotasAutenticadas.post("/pagamento", pagamentoController.adicionarPagamento);

export default rotasAutenticadas;
