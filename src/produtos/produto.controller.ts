import { Request, Response } from 'express';
import { db } from '../database/banco-mongo.js';
class ProdutoController {
    async adicionar(req: Request, res: Response) {
        const { nome, preco, descricao, urlfoto, categoria } = req.body;
        const produto = { nome, preco, descricao, urlfoto, categoria };
        const resposta = await db.collection('produtos').insertOne(produto);
        res.status(201).json({ ...produto, _id: resposta.insertedId });
    }
    async listar(req: Request, res: Response) {
        const search = (req.query.search as string || '').trim();
        const filter = search
            ? {
                $or: [
                    { nome: { $regex: search, $options: 'i' } },
                    { categoria: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const produtos = await db.collection('produtos').find(filter).toArray();
        res.status(200).json(produtos);
    }
    async editar(req: Request, res: Response) {
        const { id } = req.params
        const { nome, preco, descricao, urlfoto, categoria } = req.body
        const update: any = {}
        if (nome) update.nome = nome
        if (preco) update.preco = preco
        if (descricao) update.descricao = descricao
        if (urlfoto) update.urlfoto = urlfoto
        if (categoria) update.categoria = categoria
        const ObjectId = require('mongodb').ObjectId
        const resultado = await db.collection('produtos').updateOne({ _id: new ObjectId(id) }, { $set: update })
        if (resultado.matchedCount === 0) return res.status(404).json({ mensagem: 'Produto não encontrado' })
        res.status(200).json({ mensagem: 'Produto atualizado' })
    }
    async excluir(req: Request, res: Response) {
        const { id } = req.params
        const ObjectId = require('mongodb').ObjectId
        const resultado = await db.collection('produtos').deleteOne({ _id: new ObjectId(id) })
        if (resultado.deletedCount === 0) return res.status(404).json({ mensagem: 'Produto não encontrado' })
        res.status(200).json({ mensagem: 'Produto removido' })
    }
}
export default new ProdutoController();