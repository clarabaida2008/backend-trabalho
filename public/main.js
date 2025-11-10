document.getElementById('limpar').addEventListener('click', async () => {
  const tokenInput = document.getElementById('token');
  const saida = document.getElementById('saida');
  const token = tokenInput.value.trim();
  if (!token) {
    saida.textContent = 'Informe um token JWT válido no campo acima.';
    return;
  }

  try {
    const resp = await fetch('/carrinho', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // O backend atual espera o usuarioId no body em alguns métodos,
      // porém o middleware Auth preenche req.usuarioId a partir do token.
      // Não enviamos body aqui; o servidor deve extrair o usuário do token.
    });

    const texto = await resp.text();
    let saidaTexto = `Status: ${resp.status}\n`;
    try {
      const json = JSON.parse(texto);
      saidaTexto += JSON.stringify(json, null, 2);
    } catch (e) {
      saidaTexto += texto;
    }
    saida.textContent = saidaTexto;
  } catch (err) {
    saida.textContent = 'Erro: ' + err.message;
  }
});
