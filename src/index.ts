import 'dotenv/config'
import rotasAutenticadas from './rotas/rotas-autenticadas.js';
import rotasNaoAutenticadas from './rotas/rotas-nao-autenticadas.js';
import rotasAdmin from './rotas/rotas-admin.js';
import Auth from './middleware/auth.js';
import AuthAdmin from './middleware/auth-admin.js';
import cors from 'cors';
import { Router } from 'express';
import express from 'express';



const app = express();
const router = Router();

app.use(cors())
app.use(express.json());

app.use(express.static('public'));

app.use(rotasNaoAutenticadas)
app.use(Auth)
app.use(rotasAutenticadas);
app.use(AuthAdmin)
app.use(rotasAdmin)

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});

export default router;