// Obtém o token do localStorage
function getToken() {
  return localStorage.getItem("token");
}

/**
* Decodifica o payload do token JWT de forma segura e retorna como objeto
*/
function decodeTokenPayload() {
  const token = getToken();
  if (!token) return null;

  try {
      const payload = token.split(".")[1];
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
  } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      return null;
  }
}

/**
* Obtém o 'role' do payload do token
* @returns {string|null} - O role do usuário (ex: "Admin" ou "Cliente") ou null se não estiver presente
*/
function obterRoleDoToken() {
  const decodedPayload = decodeTokenPayload();
  return decodedPayload ? decodedPayload["role"] : null;
}

/**
* Verifica o 'role' e exibe/oculta links de acordo
*/
function verificarRole() {
  const role = obterRoleDoToken();
  const fornecedoresLink = document.getElementById("fornecedoresLink");

  if (fornecedoresLink) {
      fornecedoresLink.style.display = role === "Admin" ? "block" : "none";
  }
}

/**
* Função para inicializar a página de login e redirecionamento baseado em role
*/
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
      loginForm.addEventListener("submit", async (event) => {
          event.preventDefault();
          await handleLogin();
      });
  }

  // Verifica o role e redireciona ou ajusta elementos conforme o role
  verificarRole();
});

/**
* Realiza o login e armazena o token e role no localStorage
*/
async function handleLogin() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
      displayError("Por favor, insira o e-mail e a senha.");
      return;
  }

  try {
      const response = await fetch(`${API_BASE_URL}/api/Usuarios/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors ? errorData.errors.join(", ") : "Erro ao autenticar.");
      }

      const data = await response.json();
      if (data.succeeded) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", obterRoleDoToken()); // Armazena role do payload

          var deveTrocar = getDeveTrocarSenhaFromToken();
          if (deveTrocar) {
            window.location.href = "./trocar_senha.html";
            return;
          }

          redirectToHomePage();
      } else {
          displayError("Erro ao autenticar. Verifique suas credenciais.");
      }
  } catch (error) {
      displayError(error.message);
  }
}

/**
* Redireciona o usuário para a página inicial com base no role
*/
function redirectToHomePage() {
  const homePage = "produtos.html";
  window.location.href = homePage;
}

/**
* Exibe uma mensagem de erro
*/
function displayError(message) {
  const loginMessage = document.getElementById("loginMessage");
  loginMessage.textContent = message;
  loginMessage.style.color = "red";
}

/**
* Função para logout do usuário
*/
function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

/**
* Obtém o 'usuarioId' do payload do token
* @returns {string|null} - O ID do usuário ou null se não estiver presente
*/
function getUserIdFromToken() {
  const decodedPayload = decodeTokenPayload();
  return decodedPayload ? decodedPayload["usuarioId"] : null;
}

/**
* Obtém o 'clienteId' do payload do token
* @returns {string|null} - O ID do cliente ou null se não estiver presente
*/
function getClienteIdFromToken() {
  const decodedPayload = decodeTokenPayload();
  return decodedPayload ? decodedPayload["clienteId"] : null;
}

/**
* Verifica se o usuário deve trocar a senha com base no token
* @returns {boolean|null} - true se deve trocar senha, false caso contrário, ou null se não estiver presente
*/
function getDeveTrocarSenhaFromToken() {
  const decodedPayload = decodeTokenPayload();
  return decodedPayload ? decodedPayload["deveTrocarSenha"] === "True" : null;
}

/**
* Obtém o ID do pedido armazenado no localStorage
* @returns {number|null} - ID do pedido como número ou null se não existir
*/
function getPedidoId() {
  const pedidoIdString = localStorage.getItem("pedidoId");
  return pedidoIdString ? parseInt(pedidoIdString, 10) : null;
}

/**
* Obtém a quantidade de itens no carrinho armazenada no localStorage
* @returns {number} - Quantidade de itens no carrinho ou 0 se não existir
*/
function getQtdCarrinho() {
  const qtd = localStorage.getItem("carrinhoQuantidade");
  return qtd ? parseInt(qtd, 10) : 0;
}
