// auth.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface RequestAuth extends Request {
  usuarioId?: string;
  tipo?: string;
}

function Auth(req: RequestAuth, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ mensagem: "Token não fornecido!" });

  // Garante que o header tenha o formato "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ mensagem: "Formato do token inválido!" });

  const token = parts[1];
  if (!token) return res.status(401).json({ mensagem: "Token inválido!" });

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).json({ mensagem: "Token inválido!" });
    }

    // decoded pode ser string ou object; garantir que é object e tenha as claims esperadas
    if (typeof decoded === "string" || !decoded) {
      return res.status(401).json({ mensagem: "Payload inválido!" });
    }

    // usar as propriedades do payload (assumindo que o token foi gerado com { usuarioId, tipo })
    // o TypeScript não conhece a estrutura, fazemos um cast seguro:
    const payload = decoded as { usuarioId?: string; tipo?: string };

    if (!payload.usuarioId || !payload.tipo) {
      return res.status(401).json({ mensagem: "Payload inválido!" });
    }

    req.usuarioId = payload.usuarioId;
    req.tipo = payload.tipo;

    next();
  });
}

export default Auth;
