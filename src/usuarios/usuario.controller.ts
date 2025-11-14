import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class UsuarioController {

    async adicionar(req: Request, res: Response) {
        const { nome, idade, email, senha, tipo } = req.body;

        if (!nome || !email || !senha || !idade) {
            return res.status(400).json({
                mensagem: "Dados incompletos (nome, email, senha, idade)"
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // Se quiser criar admin, você envia tipo: "admin" no body
        const novoUsuario = {
            nome,
            idade,
            email,
            senha: senhaCriptografada,
            tipo: tipo === "admin" ? "admin" : "comum"
        };

        const resultado = await db.collection("usuarios").insertOne(novoUsuario);

        return res.status(201).json({
            ...novoUsuario,
            _id: resultado.insertedId
        });
    }

    async listar(req: Request, res: Response) {
        const usuarios = await db.collection("usuarios").find().toArray();
        return res.status(200).json(usuarios);
    }

    async login(req: Request, res: Response) {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ mensagem: "Email e senha são obrigatórios!" });
        }

        const usuario = await db.collection("usuarios").findOne({ email });

        if (!usuario)
            return res.status(400).json({ mensagem: "Usuário Incorreto!" });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida)
            return res.status(400).json({ mensagem: "Senha Inválida!" });

        // token com id, nome e tipo do usuário
        const token = jwt.sign(
            {
                usuarioId: usuario._id,
                nome: usuario.nome,
                tipo: usuario.tipo || "comum"
            },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );

        return res.status(200).json({ token });
    }
}

export default new UsuarioController();
