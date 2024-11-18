let vendas = [];
let currentPage = 1;
const itemsPerPage = 4;

async function carregarVendas() {
    const token = localStorage.getItem("token");
    const filtroAno = document.getElementById("filtroAno").value;
    const filtroMes = document.getElementById("filtroMes").value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar vendas.");
        }

        const vendasResponse = await response.json();
        vendas = vendasResponse;

        // Filtra vendas por ano e mês selecionados
        if (filtroAno) {
            vendas = vendas.filter(venda => new Date(venda.dataPedido).getFullYear() == filtroAno);
        }
        if (filtroMes) {
            vendas = vendas.filter(venda => new Date(venda.dataPedido).getMonth() + 1 == filtroMes);
        }

        renderizarPagina(currentPage); // Exibe a primeira página de resultados
        calcularTotalLucro();
    } catch (error) {
        console.error("Erro ao carregar vendas:", error);
        document.getElementById("vendasList").innerHTML = "<p>Erro ao carregar vendas. Tente novamente mais tarde.</p>";
    }
}

// Renderiza a página atual
function renderizarPagina(pageNumber) {
    const vendasList = document.getElementById("vendasList");
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const vendasPagina = vendas.slice(startIndex, endIndex);

    vendasList.innerHTML = vendasPagina.map(venda => `
        <div class="card venda-item">
            <h3>Pedido: ${venda.id}</h3>
            <p>Cliente: ${venda.clienteNome}</p>
            <p>Data: ${new Date(venda.dataPedido).toLocaleDateString()}</p>
            <p>Total: R$ ${venda.totalPedido.toFixed(2)}</p>
            <label for="statusSelect_${venda.id}">Status:</label>
            <select id="statusSelect_${venda.id}" onchange="atualizarStatus(${venda.id})" ${venda.status === "Concluído" ? "disabled" : ""}>
                <option value="Aguardando Processamento" ${venda.status === "Aguardando Processamento" ? "selected" : ""}>Aguardando Processamento</option>
                <option value="Em Processamento" ${venda.status === "Em Processamento" ? "selected" : ""}>Em Processamento</option>
                <option value="Concluído" ${venda.status === "Concluído" ? "selected" : ""}>Concluído</option>
                <option value="Cancelado" ${venda.status === "Cancelado" ? "selected" : ""}>Cancelado</option>
            </select>
            <h4>Itens:</h4>
            <ul>
                ${venda.itens.map(item => `
                    <li>${item.produtoNome} - Quantidade: ${item.quantidade} - Preço Unitário: R$ ${item.precoUnitario.toFixed(2)}</li>
                `).join("")}
            </ul>
        </div>
    `).join("");

    updatePaginationControls();
}

// Calcula o lucro total
function calcularTotalLucro() {
    const totalLucro = vendas.reduce((acc, venda) => acc + venda.totalPedido, 0);
    document.getElementById("totalLucro").innerText = `Lucro Total: R$ ${totalLucro.toFixed(2)}`;
}

// Atualiza os controles de paginação
function updatePaginationControls() {
    const totalPages = Math.ceil(vendas.length / itemsPerPage);
    document.getElementById("pageInfo").innerText = `Página ${currentPage} de ${totalPages}`;
    document.getElementById("prevPage").disabled = currentPage <= 1;
    document.getElementById("nextPage").disabled = currentPage >= totalPages;
}

// Navegação entre páginas
function changePage(direction) {
    const totalPages = Math.ceil(vendas.length / itemsPerPage);
    currentPage = Math.min(Math.max(1, currentPage + direction), totalPages);
    renderizarPagina(currentPage);
}

// Popula os filtros de ano dinamicamente
function popularFiltroAno() {
    const filtroAno = document.getElementById("filtroAno");
    const anoAtual = new Date().getFullYear();
    for (let ano = anoAtual; ano >= anoAtual - 10; ano--) {
        const option = document.createElement("option");
        option.value = ano;
        option.textContent = ano;
        filtroAno.appendChild(option);
    }
}

// Inicializa o filtro de ano e carrega as vendas
document.addEventListener("DOMContentLoaded", () => {
    popularFiltroAno();
    carregarVendas();
});
