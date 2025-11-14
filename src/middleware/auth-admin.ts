// auth.admin.ts
import { Response, NextFunction } from "express";
import { RequestAuth } from "./auth.js";

function AuthAdmin(req: RequestAuth, res: Response, next: NextFunction) {

    if (req.tipo !== "admin") {
        return res.status(403).json({ mensagem: "Acesso negado! Apenas administradores." });
    }

    console.log("Acesso Administrador LIBERADO para:", req.usuarioId);
    next();
}

export default AuthAdmin;
