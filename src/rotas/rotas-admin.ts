import { Router} from "express";
import usuarioController from "../usuarios/usuario.controller.js";
import produtoController from "../produtos/produto.controller.js";

const rotasAdmin = Router();

rotasAdmin.get("/usuarios", usuarioController.listar);
rotasAdmin.post("/produtos", produtoController.adicionar);


export default rotasAdmin;