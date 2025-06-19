import socket
import time
import random
from datetime import datetime

def gerar_dados_paciente(estado):
    freq_respiratoria = random.randint(12, 20 + estado)          # rpm
    freq_cardiaca = random.randint(60 - estado * 2, 100 - estado)  # bpm
    temperatura = round(36.5 - estado * 0.12 + random.uniform(-0.2, 0.2), 1)  # ºC
    pressao_sist = 120 + estado * 4 + random.randint(-5, 5)       # mmHg
    pressao_diast = 80 + estado * 3 + random.randint(-3, 3)       # mmHg
    oxigenacao = round(98 - estado * 1.5 + random.uniform(-0.5, 0.5), 1)  # %

    alertas = []

    # Avaliação por parâmetro
    if freq_respiratoria > 24:
        alertas.append("Frequência respiratória elevada: {} rpm (Crítico)".format(freq_respiratoria))
    elif freq_respiratoria > 20:
        alertas.append("Frequência respiratória um pouco alta: {} rpm (Moderado)".format(freq_respiratoria))

    if freq_cardiaca < 50:
        alertas.append("Frequência cardíaca baixa: {} bpm (Crítico)".format(freq_cardiaca))
    elif freq_cardiaca < 60 or freq_cardiaca > 100:
        alertas.append("Frequência cardíaca fora do ideal: {} bpm (Moderado)".format(freq_cardiaca))

    if temperatura < 35.0:
        alertas.append("Temperatura corporal muito baixa: {:.1f}ºC (Crítico)".format(temperatura))
    elif temperatura < 36.0:
        alertas.append("Temperatura corporal um pouco baixa: {:.1f}ºC (Moderado)".format(temperatura))

    if pressao_sist > 160 or pressao_diast > 100:
        alertas.append("Pressão arterial elevada: {}/{} (Crítico)".format(pressao_sist, pressao_diast))
    elif pressao_sist > 140 or pressao_diast > 90:
        alertas.append("Pressão arterial um pouco alta: {}/{} (Moderado)".format(pressao_sist, pressao_diast))

    if oxigenacao < 85:
        alertas.append("Oxigenação muito baixa: {:.1f}% (Crítico)".format(oxigenacao))
    elif oxigenacao < 92:
        alertas.append("Oxigenação baixa: {:.1f}% (Moderado)".format(oxigenacao))

    dados = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "freq_respiratoria": freq_respiratoria,
        "freq_cardiaca": freq_cardiaca,
        "temperatura": temperatura,
        "pressao_arterial": f"{pressao_sist}/{pressao_diast}",
        "oxigenacao": oxigenacao,
        "alertas": alertas
    }

    return dados

def sensor():
    estado = 0
    max_estado = 10

    while True:
        dados = gerar_dados_paciente(estado)

        mensagem = (
            f"{dados['timestamp']} 🚨 Alerta\n"
            f"Freq. Respiratória: {dados['freq_respiratoria']} rpm, "
            f"Freq. Cardíaca: {dados['freq_cardiaca']} bpm, "
            f"Temperatura: {dados['temperatura']}ºC, "
            f"Pressão Arterial: {dados['pressao_arterial']}, "
            f"Oxigenação: {dados['oxigenacao']}%\n"
        )
        if dados['alertas']:
            mensagem += "ALERTAS: " + "; ".join(dados["alertas"])

        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect(('localhost', 9090))
            s.sendall(mensagem.encode())

        print(f"[Sensor] Dados enviados:\n{mensagem}\n")

        # Simula piora ou melhora
        if estado < max_estado:
            estado += 1
        else:
            estado = max_estado if random.random() > 0.4 else max_estado - 1

        time.sleep(5)

if __name__ == "__main__":
    sensor()
