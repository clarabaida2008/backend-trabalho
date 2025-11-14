import { Request, Response } from "express";
import { ObjectId } from "bson";
import { db } from "../database/banco-mongo.js";

interface ItemCarrinho {
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    nome: string;
}

interface Carrinho {
    usuarioId: string;
    itens: ItemCarrinho[];
    dataAtualizacao: Date;
    total: number;
}

interface Produto {
    _id: ObjectId;
    nome: string;
    preco: number;
    descricao: string;
    urlfoto: string;
}

interface RequestAuth extends Request {
    usuarioId?: string;
}

class CarrinhoController {
    // ✅ Adicionar item ao carrinho
    async adicionarItem(req: RequestAuth, res: Response) {
        const { produtoId, quantidade } = req.body as { usuarioId: string; produtoId: string; quantidade: number };
        const usuarioId = req.usuarioId;

        if (!usuarioId)
            return res.status(401).json({ mensagem: "Você precisa estar autenticado para adicionar produtos ao carrinho." });

        const produto = await db.collection<Produto>("produtos").findOne({ _id: ObjectId.createFromHexString(produtoId) });
        if (!produto)
            return res.status(404).json({ mensagem: "Produto não encontrado. Ele pode ter sido removido do catálogo." });

        const nomeProduto = produto.nome;
        const precoProduto = produto.preco;

        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId: usuarioId });

        // Cria novo carrinho se não existir
        if (!carrinho) {
            const novoCarrinho: Carrinho = {
                usuarioId: usuarioId,
                itens: [{
                    produtoId: produtoId,
                    quantidade: quantidade,
                    precoUnitario: precoProduto,
                    nome: nomeProduto
                }],
                dataAtualizacao: new Date(),
                total: precoProduto * quantidade
            };

            const resposta = await db.collection<Carrinho>("carrinhos").insertOne(novoCarrinho);
            return res.status(201).json({
                mensagem: "Produto adicionado ao carrinho com sucesso!",
                ...novoCarrinho,
                _id: resposta.insertedId
            });
        }

        // Atualiza carrinho existente
        const itemExistente = carrinho.itens.find(item => item.produtoId === produtoId);
        if (itemExistente) {
            itemExistente.quantidade += quantidade;
        } else {
            carrinho.itens.push({
                produtoId: produtoId,
                quantidade: quantidade,
                precoUnitario: precoProduto,
                nome: nomeProduto
            });
        }

        carrinho.total += precoProduto * quantidade;
        carrinho.dataAtualizacao = new Date();

        await db.collection<Carrinho>("carrinhos").updateOne(
            { usuarioId: usuarioId },
            { $set: { itens: carrinho.itens, total: carrinho.total, dataAtualizacao: carrinho.dataAtualizacao } }
        );

        return res.status(200).json({ mensagem: "Carrinho atualizado com sucesso!", carrinho });
    }

    // ✅ Remover item do carrinho
    async removerItem(req: RequestAuth, res: Response) {
        const { produtoId } = req.body;
        const usuarioId = req.usuarioId;

        if (!usuarioId)
            return res.status(401).json({ mensagem: "Você precisa estar autenticado para remover produtos do carrinho." });

        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId });
        if (!carrinho)
            return res.status(404).json({ mensagem: "Seu carrinho não foi encontrado." });

        const itemExistente = carrinho.itens.find(item => item.produtoId === produtoId);
        if (!itemExistente)
            return res.status(404).json({ mensagem: "Este produto não está no seu carrinho." });

        const filtrados = carrinho.itens.filter(item => item.produtoId !== produtoId);
        const total = filtrados.reduce((total, item) => total + item.precoUnitario * item.quantidade, 0);

        await db.collection<Carrinho>("carrinhos").updateOne(
            { usuarioId },
            { $set: { itens: filtrados, total, dataAtualizacao: new Date() } }
        );

        return res.status(200).json({ mensagem: "Item removido do carrinho com sucesso!" });
    }

    // ✅ Atualizar quantidade de um item
    async atualizarQuantidade(req: RequestAuth, res: Response) {
        const { produtoId, quantidade } = req.body;
        const usuarioId = req.usuarioId;

        if (!usuarioId)
            return res.status(401).json({ mensagem: "Você precisa estar autenticado para atualizar o carrinho." });

        if (!produtoId || quantidade === undefined)
            return res.status(400).json({ mensagem: "Produto e quantidade são obrigatórios." });

        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId });
        if (!carrinho)
            return res.status(404).json({ mensagem: "Seu carrinho não foi encontrado." });

        const itemExistente = carrinho.itens.find(item => item.produtoId === produtoId);
        if (!itemExistente)
            return res.status(404).json({ mensagem: "Produto não encontrado no carrinho." });

        if (quantidade <= 0) {
            carrinho.itens = carrinho.itens.filter(item => item.produtoId !== produtoId);
        } else {
            itemExistente.quantidade = quantidade;
        }

        carrinho.total = Math.max(0, carrinho.itens.reduce((total, item) => total + item.precoUnitario * item.quantidade, 0));
        carrinho.dataAtualizacao = new Date();

        await db.collection<Carrinho>("carrinhos").updateOne(
            { usuarioId },
            { $set: { itens: carrinho.itens, total: carrinho.total, dataAtualizacao: carrinho.dataAtualizacao } }
        );

        return res.status(200).json({ mensagem: "Quantidade atualizada com sucesso!", carrinho });
    }

    // ✅ Listar carrinho do usuário logado
    async listar(req: RequestAuth, res: Response) {
        const usuarioId = req.usuarioId;

        if (!usuarioId)
            return res.status(401).json({ mensagem: "Você precisa estar autenticado para ver seu carrinho." });

        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId });
        if (!carrinho)
            return res.status(404).json({ mensagem: "Seu carrinho ainda está vazio." });

        const total = carrinho.itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);
        if (carrinho.total !== total) {
            carrinho.total = total;
            carrinho.dataAtualizacao = new Date();
            await db.collection<Carrinho>("carrinhos").updateOne(
                { usuarioId },
                { $set: { total: carrinho.total, dataAtualizacao: carrinho.dataAtualizacao } }
            );
        }

        return res.status(200).json(carrinho);
    }

    // ✅ Remover carrinho inteiro do banco
    async remover(req: RequestAuth, res: Response) {
        const usuarioId = req.usuarioId || (req.body && req.body.usuarioId);
        if (!usuarioId)
            return res.status(401).json({ mensagem: "Você precisa estar autenticado para excluir seu carrinho." });

        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId });
        if (!carrinho)
            return res.status(404).json({ mensagem: "Carrinho não encontrado." });

        await db.collection<Carrinho>("carrinhos").deleteOne({ usuarioId });
        return res.status(200).json({ mensagem: "Carrinho excluído com sucesso!" });
    }

    // ✅ Esvaziar carrinho (zerar itens e total)
    async excluirCarrinhoInteiro(req: RequestAuth, res: Response) {
        const usuarioId = req.usuarioId;

        if (!usuarioId)
            return res.status(401).json({ mensagem: "Você precisa estar autenticado para esvaziar o carrinho." });

        const carrinho = await db.collection<Carrinho>("carrinhos").findOne({ usuarioId });
        if (!carrinho)
            return res.status(404).json({ mensagem: "Carrinho não encontrado para este usuário." });

        carrinho.itens = [];
        carrinho.total = 0;
        carrinho.dataAtualizacao = new Date();

        await db.collection<Carrinho>("carrinhos").updateOne(
            { usuarioId },
            { $set: { itens: carrinho.itens, total: carrinho.total, dataAtualizacao: carrinho.dataAtualizacao } }
        );

        return res.status(200).json({ mensagem: "Seu carrinho foi esvaziado com sucesso!" });
    }

    // ✅ Listar todos os carrinhos (apenas ADMIN)
    async listarTodos(req: RequestAuth, res: Response) {
        const usuario = (req as any).usuario;

        if (!usuario || usuario.tipo !== "ADMIN")
            return res.status(403).json({ mensagem: "Acesso negado. Apenas administradores podem listar todos os carrinhos." });

        const carrinhos = await db.collection<Carrinho>("carrinhos").find().toArray();
        if (!carrinhos || carrinhos.length === 0)
            return res.status(404).json({ mensagem: "Nenhum carrinho encontrado no sistema." });

        const usuarios = await db.collection("usuarios").find().toArray();

        const resultado = carrinhos.map(c => {
            const dono = usuarios.find(u => u._id.toString() === c.usuarioId);
            return { ...c, nomeUsuario: dono ? dono.nome : "Usuário não encontrado" };
        });

        return res.status(200).json(resultado);
    }
}

export default new CarrinhoController();
