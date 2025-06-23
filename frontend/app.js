document.addEventListener("DOMContentLoaded", () => {
  const alertGrid = document.getElementById("alert-grid");
  const socket = new WebSocket("ws://localhost:6789");

  const ctx = document.getElementById("heartChart").getContext("2d");
  const heartData = {
    labels: [],
    datasets: [
      {
        label: "Normal",
        data: [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        spanGaps: true,
      },
      {
        label: "Moderado",
        data: [],
        borderColor: "#facc15",
        backgroundColor: "rgba(250, 204, 21, 0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        spanGaps: true,
      },
      {
        label: "Crítico",
        data: [],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        spanGaps: true,
      },
    ],
  };

  const heartChart = new Chart(ctx, {
    type: "line",
    data: heartData,
    options: {
      animation: false,
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Horário",
            color: "#d1d5db",
          },
          ticks: { color: "#9ca3af" },
          grid: { color: "#374151" },
        },
        y: {
          min: 30,
          max: 180,
          ticks: { stepSize: 30, color: "#9ca3af" },
          grid: { color: "#374151" },
        },
      },
      plugins: {
        legend: { display: true, labels: { color: "#d1d5db" } },
      },
    },
  });

  // Estado atual do nível ativo para o gráfico: "normal", "moderado", "critico"
  let nivelAtual = "normal";

  socket.onmessage = function (event) {
    const mensagem = event.data;
    const time = new Date().toLocaleTimeString();

    const dadosMatch = mensagem.match(
      /Freq\. Respiratória: (.*?), Freq\. Cardíaca: (.*?) bpm, Temperatura: (.*?)ºC, Pressão Arterial: (.*?), Oxigenação: (.*?)%/
    );
    const alertasMatch = mensagem.match(/ALERTAS:\s*(.*)/);

    if (!dadosMatch) return;

    const [_, fr, fc, temp, pa, oxi] = dadosMatch;
    const bpm = parseInt(fc);
    const alertasRaw = alertasMatch ? alertasMatch[1] : "";

    let nivel = "normal";
    if (alertasRaw.toLowerCase().includes("crítico")) {
      nivel = "critico";
    } else if (alertasRaw.toLowerCase().includes("moderado")) {
      nivel = "moderado";
    }

    // Se subir de nível, limpa os dados anteriores e inicia o novo nível
    const niveisOrdem = ["normal", "moderado", "critico"];
    if (niveisOrdem.indexOf(nivel) > niveisOrdem.indexOf(nivelAtual)) {
      nivelAtual = nivel;
      // Limpa os dados do gráfico para começar do zero no novo nível
      heartData.labels = [];
      heartData.datasets.forEach((ds) => (ds.data = []));
    }

    // Adiciona novo label e dados apenas para o nível atual (outros recebem null)
    heartData.labels.push(time);
    heartData.datasets.forEach((dataset, i) => {
      const nome = ["normal", "moderado", "critico"][i];
      if (nome === nivelAtual) {
        dataset.data.push(bpm);
      } else {
        dataset.data.push(null);
      }
    });

    heartChart.update();

    // Construção do card de alerta
    const card = document.createElement("div");
    card.className = `alert-box p-5 rounded-2xl ${nivel}`;
    card.innerHTML = `
      <div class="text-center">
        ${
          nivel === "critico"
            ? `<h2 class="text-lg font-semibold mb-2 text-red-400">Alerta Crítico</h2>`
            : ""
        }
        <p class="text-sm"><strong>Frequência Respiratória:</strong> ${fr}</p>
        <p class="text-sm"><strong>Frequência Cardíaca:</strong> ${fc} bpm</p>
        <p class="text-sm"><strong>Temperatura:</strong> ${temp}ºC</p>
        <p class="text-sm"><strong>Pressão Arterial:</strong> ${pa}</p>
        <p class="text-sm"><strong>Oxigenação:</strong> ${oxi}%</p>
        ${
          alertasRaw
            ? `
          <div class="mt-4 text-sm">
            <h3 class="font-medium text-gray-300 mb-1">Alertas:</h3>
            <ul class="space-y-1">
              ${alertasRaw
                .split(";")
                .map((alerta) => {
                  const a = alerta.trim();
                  const cor = a.toLowerCase().includes("crítico")
                    ? "text-red-400"
                    : a.toLowerCase().includes("moderado")
                    ? "text-yellow-300"
                    : "text-green-300";
                  return `<li class="${cor}">${a}</li>`;
                })
                .join("")}
            </ul>
          </div>
        `
            : ""
        }
        <span class="text-xs text-gray-400 block mt-3">${time}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      card.classList.toggle("expanded");
    });

    alertGrid.prepend(card);

    const maxCards = 12;
    while (alertGrid.childNodes.length > maxCards) {
      alertGrid.removeChild(alertGrid.lastChild);
    }
  };

  socket.onerror = function (e) {
    console.error("Erro no WebSocket:", e);
  };

  socket.onclose = function () {
    const aviso = document.createElement("div");
    aviso.className =
      "p-4 bg-yellow-100 text-yellow-700 rounded-2xl text-center font-semibold shadow col-span-full";
    aviso.textContent = "⚠️ Conexão perdida com o servidor de alertas.";
    alertGrid.prepend(aviso);
  };
});
