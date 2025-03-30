const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração para armazenar uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

let users = []; // Aqui ficam os dados dos usuários (em memória)
let posts = []; // Aqui ficam os posts (em memória)

// Rota para registrar um usuário
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { email, password: hashedPassword };
    users.push(user);
    res.json({ message: 'Usuário registrado com sucesso!' });
});

// Rota para login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ email }, 'secrettoken', { expiresIn: '1h' });
        res.json({ message: 'Login bem-sucedido', token });
    } else {
        res.status(401).json({ message: 'Email ou senha incorretos' });
    }
});

// Rota para upload de fotos/vídeos
app.post('/upload', upload.single('file'), (req, res) => {
    const { description } = req.body;
    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    const post = { description, fileUrl };
    posts.push(post);
    res.json({ message: 'Post enviado com sucesso!' });
});

// Rota para ver os posts
app.get('/posts', (req, res) => {
    res.json(posts);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
