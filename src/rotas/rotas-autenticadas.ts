import usuarioController from "../usuarios/usuario.controller.js";
import produtoController from "../produtos/produto.controller.js";

import { Router} from "express";
import carrinhoController from "../carrinho/carrinho.controller.js";

const rotasAutenticadas = Router();

//Criando rotasAutenticadas para os usuários
rotasAutenticadas.post("/usuarios", usuarioController.adicionar);
rotasAutenticadas.get("/usuarios", usuarioController.listar);


//rotasAutenticadas para produtos
rotasAutenticadas.post("/produtos", produtoController.adicionar);
rotasAutenticadas.get("/produtos", produtoController.listar);


//Ainda vamos ter que criar as rotasAutenticadas para carrinho e produtos
rotasAutenticadas.post("/adicionarItem", carrinhoController.adicionarItem);
//Tarefa para casa :)
// Rota para listar o carrinho (retorna total recalculado)
rotasAutenticadas.post("/carrinho", carrinhoController.listar);
// Rota para remover todo o carrinho do usuário (requisição autenticada)
rotasAutenticadas.delete("/carrinho", carrinhoController.remover);

export default rotasAutenticadas;