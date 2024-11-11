// Função para obter a cidade a partir da geolocalização
async function obterCidade(latitude, longitude) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${LOCALIZATION_API_KEY}&language=pt`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const cidade = data.results[0].components.city || data.results[0].components.town || data.results[0].components.village;
            return cidade;
        } else {
            console.log("Cidade não encontrada.");
            return null;
        }
    } catch (error) {
        console.error("Erro ao obter a cidade:", error);
        return null;
    }
}

// Função principal para obter sugestões de cultivo com base na localização e estação do ano
async function obterSugestoes() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const epocaAno = document.getElementById("epocaAno").value;

            const cidade = await obterCidade(latitude, longitude);
            if (!cidade) {
                document.getElementById("sugestoes").innerText = "Não foi possível determinar a cidade.";
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/inteligencia/sugestoes-cultivo?latitude=${latitude}&longitude=${longitude}&cidade=${cidade}&epocaAno=${epocaAno}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });

                if (!response.ok) {
                    throw new Error("Erro na solicitação: " + response.status);
                }

                const sugestoes = await response.json();
                exibirSugestoes(sugestoes);
            } catch (error) {
                console.error("Erro ao obter sugestões:", error);
                document.getElementById("sugestoes").innerText = "Erro ao obter sugestões de cultivo.";
            }
        }, (error) => {
            console.error("Erro ao obter localização:", error);
            alert("Erro ao obter localização. Verifique as permissões de geolocalização.");
        });
    } else {
        alert("Geolocalização não é suportada neste navegador.");
    }
}

// Função para exibir as sugestões de cultivo
function exibirSugestoes(sugestoes) {
    const sugestoesDiv = document.getElementById("sugestoes");

    // Extrair informações com segurança
    const climaTemp = sugestoes.clima?.main?.temp ? `${sugestoes.clima.main.temp}°C` : "Dados de temperatura não disponíveis";
    const climaDescricao = sugestoes.clima?.weather?.$values?.[0]?.description || "Descrição do clima não disponível";
    const dadosAgricolasTemp = sugestoes.dadosAgricolas?.main?.temp ? `${sugestoes.dadosAgricolas.main.temp}°C` : "Temperatura agrícola não disponível";
    const dadosAgricolasUmidade = sugestoes.dadosAgricolas?.main?.humidity ? `${sugestoes.dadosAgricolas.main.humidity}%` : "Umidade agrícola não disponível";
    const sugestaoCultivo = sugestoes.sugestaoCultivo || "Sugestão de cultivo não disponível";

    // Exibe as informações do clima, dados agrícolas e sugestão de cultivo
    sugestoesDiv.innerHTML = `
        <p>Clima: ${climaTemp}, ${climaDescricao}</p>
        <p>Dados Agrícolas: Temperatura: ${dadosAgricolasTemp}, Umidade: ${dadosAgricolasUmidade}</p>
        <p>Sugestão de Cultivo: ${sugestaoCultivo}</p>
    `;
}
