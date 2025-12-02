import Stripe from "stripe";
import { RequestAuth } from "../middleware/auth.js";
import { db } from "../database/banco-mongo.js";
import { Request, Response } from "express";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

class PagamentoController {
    async adicionarPagamento(req: RequestAuth, res: Response) {
        // Buscar o carrinho do usuário (utilize req.usuarioId ou req.body conforme sua modelagem)
        // O amount aqui deve vir em centavos — vamos calcular a partir do carrinho do usuário (mais seguro)
        const usuarioId = req.usuarioId;
        if (!usuarioId)
            return res.status(401).json({ mensagem: "Você precisa estar autenticado para realizar um pagamento." });

        const carrinho = await db.collection("carrinhos").findOne({ usuarioId });
        if (!carrinho || !carrinho.itens || carrinho.itens.length === 0)
            return res.status(400).json({ mensagem: "Carrinho vazio. Não é possível processar o pagamento." });

        // Recalcula o total a partir dos itens (em reais), converte para centavos e arredonda
        const total = carrinho.itens.reduce((soma: number, item: any) => soma + (item.precoUnitario * item.quantidade), 0);
        const amount: number = Math.max(0, Math.round(total * 100));

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: "brl",
                payment_method_types: ["card"],
                metadata: {
                    pedido_id: req.body?.pedido_id ?? "123",
                },
            });

            // Retornamos clientSecret e amount (em centavos) para facilitar verificação no frontend
            return res.json({ clientSecret: paymentIntent.client_secret, amount });
        } catch (err) {
            if (err instanceof Error) return res.status(400).json({ mensagem: err.message });
            return res.status(400).json({ mensagem: "Erro de pagamento desconhecido!" });
        }
    }
}

export default new PagamentoController();

