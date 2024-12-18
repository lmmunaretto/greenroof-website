let produtosFornecedor = [];

// Carregar fornecedores e produtos simultaneamente
async function carregarFornecedores() {
    try {
        const [fornecedoresResponse, produtosResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/Fornecedores`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            }),
            fetch(`${API_BASE_URL}/api/ProdutosFornecedor`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            })
        ]);

        const fornecedoresData = await fornecedoresResponse.json();
        const produtosData = await produtosResponse.json();

        const fornecedores = fornecedoresData || [];
        produtosFornecedor = produtosData || [];

        exibirFornecedores(fornecedores);
    } catch (error) {
        console.error("Erro ao carregar fornecedores e produtos:", error);
        alert("Erro ao carregar dados. Por favor, tente novamente.");
    }
}

function exibirFornecedores(fornecedores) {
    const tableBody = document.getElementById('fornecedoresTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = "";

    fornecedores.forEach(fornecedor => {
        const produtosDoFornecedor = produtosFornecedor.filter(produto => produto.fornecedorId === fornecedor.id);

        const count = produtosDoFornecedor.length; // Contagem de produtos
        const totalQuantity = produtosDoFornecedor.reduce((total, produto) => total + produto.quantidade, 0); // Soma das quantidades

        const row = tableBody.insertRow();
        row.insertCell(0).innerText = fornecedor.nome;
        row.insertCell(1).innerText = fornecedor.telefone;
        row.insertCell(2).innerText = fornecedor.email;
        row.insertCell(3).innerText = fornecedor.cnpj;
        row.insertCell(4).innerText = fornecedor.endereco;
        row.insertCell(5).innerText = count;
        row.insertCell(6).innerText = totalQuantity;

        const produtosCell = row.insertCell(7);
        const button = document.createElement('button');
        button.innerText = 'Ver Produtos';
        button.className = 'produtos-btn';
        button.onclick = () => abrirModal(fornecedor.id);
        produtosCell.appendChild(button);
    });
}

// Abrir modal com lista de produtos do fornecedor
function abrirModal(fornecedorId) {
    const produtosList = document.getElementById('produtosList');
    produtosList.innerHTML = '';

    const produtosDoFornecedor = produtosFornecedor.filter(produto => produto.fornecedorId === fornecedorId);

    if (produtosDoFornecedor.length === 0) {
        // Exibir mensagem se não houver produtos cadastrados
        const mensagem = document.createElement('p');
        mensagem.className = 'mensagem-sem-produtos';
        mensagem.innerText = "Ainda não há produtos cadastrados para este fornecedor.";
        produtosList.appendChild(mensagem);
    } else {
        // Exibir lista de produtos do fornecedor
        produtosDoFornecedor.forEach(produto => {
            const div = document.createElement('div');
            div.className = 'produto-item';
            div.innerHTML = `
                <strong>Nome:</strong> ${produto.nome} <br>
                <strong>Quantidade:</strong> ${produto.quantidade} <br>
                <strong>Tipo:</strong> ${produto.tipo} <br>
                <strong>Preço:</strong> R$ ${produto.preco.toFixed(2)}
            `;
            produtosList.appendChild(div);
        });
    }

    document.getElementById('produtosModal').style.display = "block";
}

// Fechar o modal
function fecharModal() {
    document.getElementById('produtosModal').style.display = "none";
}

// Carregar fornecedores na inicialização
window.onload = () => {
    carregarFornecedores();
};
