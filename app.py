from flask import Flask, render_template, request, redirect, url_for, flash
import sqlite3
import re

app = Flask(__name__)
app.secret_key = 'coude-qa-2026'
DB = 'usuarios.db'

# ---------- banco de dados ----------
def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS usuarios (
                id      INTEGER PRIMARY KEY AUTOINCREMENT,
                nome    TEXT    NOT NULL,
                email   TEXT    NOT NULL UNIQUE,
                senha   TEXT    NOT NULL
            )
        ''')

# ---------- validações ----------
def validar(nome, email, senha, ignorar_email=None):
    erros = {}
    if not nome or not nome.strip():
        erros['nome'] = 'Nome é obrigatório'
    if not email or not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        erros['email'] = 'E-mail inválido'
    if senha is not None and len(senha) < 8:
        erros['senha'] = 'Senha deve ter no mínimo 8 caracteres'
    if not erros.get('email'):
        with get_db() as conn:
            row = conn.execute(
                'SELECT id FROM usuarios WHERE email = ?', (email,)
            ).fetchone()
            if row and (ignorar_email is None or row['id'] != ignorar_email):
                erros['email'] = 'E-mail já cadastrado'
    return erros

# ---------- rotas ----------
@app.route('/')
def index():
    return redirect(url_for('listar'))

@app.route('/usuarios')
def listar():
    busca = request.args.get('busca', '').strip()
    with get_db() as conn:
        if busca:
            usuarios = conn.execute(
                "SELECT * FROM usuarios WHERE nome LIKE ?", (f'%{busca}%',)
            ).fetchall()
        else:
            usuarios = conn.execute("SELECT * FROM usuarios").fetchall()
    return render_template('lista.html', usuarios=usuarios, busca=busca)

@app.route('/novo', methods=['GET', 'POST'])
def novo():
    erros = {}
    dados = {}
    if request.method == 'POST':
        dados = {
            'nome':  request.form.get('nome', '').strip(),
            'email': request.form.get('email', '').strip(),
            'senha': request.form.get('senha', ''),
        }
        erros = validar(dados['nome'], dados['email'], dados['senha'])
        if not erros:
            with get_db() as conn:
                conn.execute(
                    'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
                    (dados['nome'], dados['email'], dados['senha'])
                )
            flash('Usuário criado com sucesso!', 'sucesso')
            return redirect(url_for('listar'))
    return render_template('form.html', erros=erros, dados=dados, acao='novo')

@app.route('/editar/<int:id>', methods=['GET', 'POST'])
def editar(id):
    with get_db() as conn:
        usuario = conn.execute('SELECT * FROM usuarios WHERE id = ?', (id,)).fetchone()
    if not usuario:
        flash('Usuário não encontrado', 'erro')
        return redirect(url_for('listar'))

    erros = {}
    dados = dict(usuario)
    if request.method == 'POST':
        dados = {
            'nome':  request.form.get('nome', '').strip(),
            'email': request.form.get('email', '').strip(),
        }
        erros = validar(dados['nome'], dados['email'], senha=None, ignorar_email=id)
        if not erros:
            with get_db() as conn:
                conn.execute(
                    'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
                    (dados['nome'], dados['email'], id)
                )
            flash('Usuário atualizado com sucesso!', 'sucesso')
            return redirect(url_for('listar'))
    return render_template('form.html', erros=erros, dados=dados, acao='editar', id=id)

@app.route('/deletar/<int:id>', methods=['POST'])
def deletar(id):
    with get_db() as conn:
        usuario = conn.execute('SELECT * FROM usuarios WHERE id = ?', (id,)).fetchone()
        if not usuario:
            flash('Usuário não encontrado', 'erro')
        else:
            conn.execute('DELETE FROM usuarios WHERE id = ?', (id,))
            flash('Usuário removido com sucesso!', 'sucesso')
    return redirect(url_for('listar'))

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=3000)
