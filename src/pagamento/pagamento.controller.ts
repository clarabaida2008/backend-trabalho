import Stripe from "stripe";
import { RequestAuth } from "../middleware/auth.js";
import { Request, Response } from "express";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

class PagamentoController {
    // Handler para POST /criar-pagamento-cartao
    async adicionarPagamento(req: RequestAuth, res: Response) {
        // Buscar o carrinho do usuário (utilize req.usuarioId ou req.body conforme sua modelagem)
        // O amount aqui deve vir em centavos — exemplo usa valor enviado no body ou um default
        const amount: number = Number(req.body?.amount ?? 5000);

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: "brl",
                payment_method_types: ["card"],
                metadata: {
                    pedido_id: req.body?.pedido_id ?? "123",
                },
            });

            return res.json({ clientSecret: paymentIntent.client_secret });
        } catch (err) {
            if (err instanceof Error) return res.status(400).json({ mensagem: err.message });
            return res.status(400).json({ mensagem: "Erro de pagamento desconhecido!" });
        }
    }
}

export default new PagamentoController();

