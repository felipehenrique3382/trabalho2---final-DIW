document.addEventListener("DOMContentLoaded", () => {
  const usuario = localStorage.getItem("usuarioLogado");
  let user = null;
  try {
    user = usuario ? JSON.parse(usuario) : null;
  } catch (e) {
    console.warn("usuarioLogado inválido no localStorage:", usuario);
    localStorage.removeItem("usuarioLogado");
    user = null;
  }

  const menu = document.getElementById("menu-links");
  if (!menu) {
    console.warn("Elemento #menu-links não encontrado. Verifique o HTML da navbar.");
    return;
  }


  const prevUserInfo = menu.querySelector(".user-info-item");
  if (prevUserInfo) prevUserInfo.remove();

  // Remove link de login só se o usuário estiver logado
  if (user) {
    const loginAnchor = menu.querySelector('a[href="login.html"]');
    if (loginAnchor) {
      const parentLi = loginAnchor.closest("li");
      if (parentLi) parentLi.remove();
    }

    // Cria item com nome + botão sair e adiciona no final
    const li = document.createElement("li");
    li.className = "nav-item user-info-item d-flex align-items-center";
    li.style.gap = "0.5rem";

    li.innerHTML = `
      <span class="nav-link text-white p-0">Olá, <strong>${escapeHtml(user.nome || user.login || "Usuário")}</strong></span>
      <button id="logoutBtn" class="btn btn-sm btn-outline-light ms-2">Sair</button>
    `;

    menu.appendChild(li);

    // Attacha listener
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("usuarioLogado");
        // reload mantém você na mesma página (ou redireciona para login)
        window.location.href = "login.html";
      });
    }
  } else {
    // usuário não logado -> garante que exista o link login (apenas se não existir)
    let loginExists = menu.querySelector('a[href="login.html"]');
    if (!loginExists) {
      const li = document.createElement("li");
      li.className = "nav-item";
      li.innerHTML = `<a class="nav-link active me-4 text-white" href="login.html">Login</a>`;
      menu.appendChild(li);
    }
  }

  // pequena função de escape para evitar injeção via localStorage
  function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

});
