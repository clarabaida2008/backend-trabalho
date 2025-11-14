import usuarioController from "../usuarios/usuario.controller.js";
import produtoController from "../produtos/produto.controller.js";
import { Router } from "express";
import carrinhoController from "../carrinho/carrinho.controller.js";

const rotasAutenticadas = Router();

rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
rotasAutenticadas.get("/carrinho", carrinhoController.listar);
rotasAutenticadas.delete("/carrinho", carrinhoController.remover);
rotasAutenticadas.put("/carrinho/quantidade", carrinhoController.atualizarQuantidade);
rotasAutenticadas.post("/removerItem", carrinhoController.removerItem);

// 🆕 Nova rota: excluir todo o conteúdo do carrinho (atividade)
rotasAutenticadas.delete("/carrinho/todos", carrinhoController.excluirCarrinhoInteiro);

export default rotasAutenticadas;
