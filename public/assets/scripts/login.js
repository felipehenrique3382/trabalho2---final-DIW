const urlUsuarios = "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/usuarios";

// CADASTRAR
async function cadastrarUsuario(event) {
  const login = document.getElementById("login").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!login || !nome || !email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  // verifica email já cadastrado
  const existe = await fetch(`${urlUsuarios}?email=${email}`).then((r) =>
    r.json(),
  );
  if (existe.length > 0) {
    alert("Este e-mail já está cadastrado");
    return;
  }

  const novoUsuario = { login, nome, email, senha };

  const res = await fetch(urlUsuarios, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novoUsuario),
  });

  if (res.ok) {
    alert("Usuário cadastrado com sucesso!");
    document.getElementById("formCadastro").reset();

    let modal = bootstrap.Modal.getInstance(
      document.getElementById("modalCadastro"),
    );
    modal.hide();
  }
}

// LOGIN
async function fazerLogin(event) {
  event.preventDefault();

  const loginDigitado = document.getElementById("loginInput").value.trim();
  const senhaDigitada = document.getElementById("senhaInput").value.trim();

  const usuarios = await fetch(
    `${urlUsuarios}?login=${loginDigitado}&senha=${senhaDigitada}`,
  ).then((r) => r.json());

  if (usuarios.length === 1) {
    const usuario = usuarios[0];

    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    alert("Login realizado com sucesso!");

    window.location.href = "./home.html";
  } else {
    alert("Login ou senha incorretos!");
  }
}

// EVENTOS
document
  .getElementById("btnCadastrar")
  .addEventListener("click", cadastrarUsuario);
document.getElementById("formLogin").addEventListener("submit", fazerLogin);


