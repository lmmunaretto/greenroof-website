document.addEventListener("DOMContentLoaded", async () => {
    await carregarClientes(1); // Inicia na primeira página
});

const clientesPorPagina = 5;
let clientesFiltrados = [];
let paginaAtual = 1;

async function carregarClientes(pagina) {
    const token = localStorage.getItem("token");
    const adminId = getUserIdFromToken();
    const clientesList = document.getElementById("clientesList");
    document.getElementById("mensagemClientes").innerText = "";
    paginaAtual = pagina;

    try {
        const responseClientes = await fetch(`${API_BASE_URL}/api/Clientes`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!responseClientes.ok) {
            throw new Error("Erro ao carregar clientes.");
        }

        const clientesResponse = await responseClientes.json();
        const clientes = clientesResponse;
        clientesFiltrados = clientes.filter(cliente => cliente.adminId == adminId);

        const inicio = (pagina - 1) * clientesPorPagina;
        const fim = inicio + clientesPorPagina;
        const clientesPagina = clientesFiltrados.slice(inicio, fim);

        clientesList.innerHTML = clientesPagina.map(cliente => `
            <div class="cliente-item">
                <h3>${cliente.nome}</h3>
                <p>Email: ${cliente.email}</p>
                <p>Telefone: ${cliente.telefone.replace(/\d(?=\d{4})/g, "*")}</p>
                <p>CPF: ${cliente.cpf.replace(/\d(?=\d{2})/g, "*")}</p>
                <p>Endereço: ${cliente.endereco.replace(/(\S{4})\S+/g, "$1***")}</p>
                <p>Pedidos Realizados: <span class="count" id="pedidosCount-${cliente.id}">Carregando...</span></p>
                <p>Total Gasto: R$ <span id="totalGasto-${cliente.id}">Carregando...</span></p>
            </div>
        `).join("");

        await carregarDadosPedidos(clientesPagina);
        exibirControlesPaginacao();

    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        document.getElementById("mensagemClientes").innerText = "Erro ao carregar clientes. Tente novamente mais tarde.";
    }
}

async function carregarDadosPedidos(clientesPagina) {
    const token = localStorage.getItem("token");
    try {
        const responsePedidos = await fetch(`${API_BASE_URL}/api/Pedidos`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!responsePedidos.ok) {
            throw new Error("Erro ao carregar pedidos.");
        }

        const pedidosResponse = await responsePedidos.json();
        const pedidos = pedidosResponse;

        const dadosClientes = new Map();
        clientesPagina.forEach(cliente => {
            dadosClientes.set(cliente.id, { pedidosCount: 0, totalGasto: 0 });
        });

        pedidos.forEach(pedido => {
            const clienteData = dadosClientes.get(pedido.clienteId);
            if (clienteData) {
                clienteData.pedidosCount += 1;
                clienteData.totalGasto += pedido.totalPedido;
            }
        });

        clientesPagina.forEach(cliente => {
            const { pedidosCount, totalGasto } = dadosClientes.get(cliente.id);
            document.getElementById(`pedidosCount-${cliente.id}`).innerText = pedidosCount;
            document.getElementById(`totalGasto-${cliente.id}`).innerText = totalGasto.toFixed(2);
        });

    } catch (error) {
        console.error("Erro ao carregar dados de pedidos:", error);
        clientesPagina.forEach(cliente => {
            document.getElementById(`pedidosCount-${cliente.id}`).innerText = "Erro";
            document.getElementById(`totalGasto-${cliente.id}`).innerText = "Erro";
        });
    }
}

function exibirControlesPaginacao() {
    const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
    const paginationControls = document.getElementById("paginationControls");
    paginationControls.innerHTML = `
        <button onclick="carregarClientes(paginaAtual - 1)" ${paginaAtual === 1 ? "disabled" : ""}>Anterior</button>
        <span>Página ${paginaAtual} de ${totalPaginas}</span>
        <button onclick="carregarClientes(paginaAtual + 1)" ${paginaAtual === totalPaginas ? "disabled" : ""}>Próximo</button>
    `;
}
