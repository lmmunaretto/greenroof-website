
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const response = await fetch(`${API_BASE_URL}/api/Usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("token", data.token);

    var deveTrocar = getDeveTrocarSenhaFromToken();
    if (deveTrocar == "True") {
      window.location.href = "./trocar_senha.html";
      return;
    }

    window.location.href = "./produtos.html";
  } else {
    document.getElementById("loginMessage").innerText =
      "Login falhou! Verifique suas credenciais.";
  }
});
