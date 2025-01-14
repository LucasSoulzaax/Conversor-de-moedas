const valorSoli = document.querySelector("#solic_conv");
const paisEntrada = document.querySelector("#pais_entrada");
const paisSaida = document.querySelector("#pais_saida");
const resultadoConv = document.querySelector("#result_conv");
const graficoMoedas = document.getElementById('myChart').getContext('2d');

const chaveApi = '9107c0a806d2c86c4de6b33d';
const urlApi = `https://v6.exchangerate-api.com/v6/${chaveApi}/latest/USD`;

let grafico = null;
let taxas = {};

async function buscarTaxasCambio(periodo = 'latest') {
    const url = periodo === 'latest' ? urlApi : `https://v6.exchangerate-api.com/v6/${chaveApi}/history?start_date=${periodo.startDate}&end_date=${periodo.endDate}&base=USD`;
    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (!dados.conversion_rates) {
            console.error("Dados não encontrados ou erro na API.");
            return;
        }

        taxas = dados.conversion_rates;

        atualizarGrafico(taxas);
        atualizarConversao(taxas);
    } catch (erro) {
        console.error('Erro ao buscar dados:', erro);
    }
}

function atualizarGrafico(taxas) {
    const moedas = ['USD', 'EUR', 'BRL'];
    const taxasFiltradas = moedas.reduce((acc, moeda) => {
        acc[moeda] = taxas[moeda];
        return acc;
    }, {});

    const labels = Object.keys(taxasFiltradas);
    const valores = Object.values(taxasFiltradas);

    const gradiente = graficoMoedas.createLinearGradient(0, 0, 0, 400);
    gradiente.addColorStop(0, 'rgba(124, 58, 237, 0.5)');
    gradiente.addColorStop(1, 'rgba(124, 58, 237, 0.2)');

    if (paisEntrada.value && paisSaida.value) {
        if (grafico) {
            grafico.data.labels = labels;
            grafico.data.datasets[0].data = valores;
            grafico.update();
        } else {
            grafico = new Chart(graficoMoedas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Taxa de Câmbio',
                        data: valores,
                        backgroundColor: gradiente,
                        borderColor: '#7C3AED',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
}

function atualizarConversao(taxas) {
    valorSoli.addEventListener('input', () => {
        const valor = parseFloat(valorSoli.value);
        const moedaEntrada = paisEntrada.value;
        const moedaSaida = paisSaida.value;

        if (isNaN(valor)) {
            resultadoConv.value = "Por favor, insira um valor válido!";
            return;
        }

        const valorConvertido = (valor / taxas[moedaEntrada]) * taxas[moedaSaida];
        resultadoConv.value = valorConvertido.toFixed(2);
    });
}

document.querySelectorAll('.periodo-btn').forEach(button => {
    button.addEventListener('click', () => {
        const periodo = button.getAttribute('data-period');
        
        let dataInicio = '';
        let dataFim = '';

        if (periodo === '1d') {
            dataInicio = dataFim = new Date().toISOString().split('T')[0];
        } else if (periodo === '5d') {
            dataInicio = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            dataFim = new Date().toISOString().split('T')[0];
        } else if (periodo === '1m') {
            dataInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            dataFim = new Date().toISOString().split('T')[0];
        } else if (periodo === '1y') {
            dataInicio = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            dataFim = new Date().toISOString().split('T')[0];
        } else if (periodo === '5y') {
            dataInicio = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            dataFim = new Date().toISOString().split('T')[0];
        }

        buscarTaxasCambio({startDate: dataInicio, endDate: dataFim});
    });
});

paisEntrada.addEventListener('change', () => {
    if (paisEntrada.value && paisSaida.value) {
        buscarTaxasCambio();
    }
});

paisSaida.addEventListener('change', () => {
    if (paisEntrada.value && paisSaida.value) {
        buscarTaxasCambio();
    }
});

window.onload = buscarTaxasCambio;

