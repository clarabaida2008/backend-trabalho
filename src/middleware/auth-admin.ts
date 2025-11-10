import {Request, Response, NextFunction} from 'express'

interface RequestAuth extends Request{
    usuarioId?:string
    tipo?:string
}

function AuthAdmin (req:RequestAuth,res:Response,next:NextFunction){
        if(req.tipo !=="admin"){
            return res.status(403).json({mensagem:"Acesso negado! Apenas administradores."})
        } else {
            console.log("Acesso de administrador concedido.")
        }
        next()
}

export default AuthAdmin