document.getElementById("cadastroClienteForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const clienteData = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        telefone: document.getElementById("telefone").value,
        cpf: document.getElementById("cpf").value,
        endereco: document.getElementById("endereco").value
    };

    const response = await fetch(`${API_BASE_URL}/api/clientes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(clienteData)
    });

    if (response.ok) {
        document.getElementById("cadastroMessage").innerText = "Cliente cadastrado com sucesso!";
    } else {
        document.getElementById("cadastroMessage").innerText = "Erro ao cadastrar cliente.";
    }
});
