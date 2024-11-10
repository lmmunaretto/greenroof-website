document.getElementById("cadastroFornecedorForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fornecedorData = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        telefone: document.getElementById("telefone").value,
        cnpj: document.getElementById("cnpj").value,
        endereco: document.getElementById("endereco").value
    };

    const response = await fetch(`${API_BASE_URL}/api/fornecedores`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(fornecedorData)
    });

    if (response.ok) {
        document.getElementById("cadastroMessage").innerText = "Fornecedor cadastrado com sucesso!";
    } else {
        document.getElementById("cadastroMessage").innerText = "Erro ao cadastrar fornecedor.";
    }
});
