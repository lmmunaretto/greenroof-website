document.addEventListener("DOMContentLoaded", () => {
    const trocarSenhaForm = document.getElementById("trocarSenhaForm");

    if (trocarSenhaForm) {
        trocarSenhaForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            await handleTrocaSenha();
        });
    }
});

/**
 * Lida com a troca de senha do usuário
 */
async function handleTrocaSenha() {
    const email = document.getElementById("email").value.trim();
    const senhaAtual = document.getElementById("senhaAtual").value.trim();
    const novaSenha = document.getElementById("novaSenha").value.trim();
    const confirmarNovaSenha = document.getElementById("confirmarNovaSenha").value.trim();
    const trocaSenhaMessage = document.getElementById("trocaSenhaMessage");

    if (novaSenha !== confirmarNovaSenha) {
        displayMessage("As senhas não coincidem.", "red");
        return;
    }

    if (!email || !senhaAtual || !novaSenha) {
        displayMessage("Por favor, preencha todos os campos.", "red");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/Usuarios/trocar-senha`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                email: email,
                senhaAtual: senhaAtual,
                novaSenha: novaSenha
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.mensagem || "Erro ao trocar senha.");
        }

        displayMessage("Senha trocada com sucesso!", "green");
        setTimeout(() => window.location.href = "./login.html", 2000);

    } catch (error) {
        displayMessage(error.message, "red");
    }
}

/**
 * Exibe uma mensagem de erro ou sucesso
 * @param {string} message - Mensagem a ser exibida
 * @param {string} color - Cor da mensagem (ex: "red" para erro, "green" para sucesso)
 */
function displayMessage(message, color) {
    const trocaSenhaMessage = document.getElementById("trocaSenhaMessage");
    trocaSenhaMessage.textContent = message;
    trocaSenhaMessage.style.color = color;
}
