import { Router} from "express";
import usuarioController from "../usuarios/usuario.controller.js";
import produtoController from "../produtos/produto.controller.js";
import carrinhoController from "../carrinho/carrinho.controller.js";

const rotasAdmin = Router();

rotasAdmin.get("/usuarios", usuarioController.listar);
rotasAdmin.post("/produtos", produtoController.adicionar);
rotasAdmin.delete("/carrinho", carrinhoController.removerItem);
rotasAdmin.get("/listarCarrinhos", carrinhoController.listarCarrinhos);


export default rotasAdmin;