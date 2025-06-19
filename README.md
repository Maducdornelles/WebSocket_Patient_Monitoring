
# Sistema de Monitoramento de Pacientes com Interface Web em Tempo Real
Maria Eduarda Carvalho, Gustavo Rampanelli, Carolline Piccoli

##  Descrição

Este projeto consiste em um sistema de **monitoramento remoto de sinais vitais de pacientes**, com visualização em uma **interface web em tempo real**. Os dados clínicos são gerados por um sensor simulado e transmitidos via **Sockets TCP** para um servidor central, que por sua vez distribui os dados ao front-end por meio de **WebSockets**.

A interface web permite o acompanhamento contínuo dos seguintes parâmetros:

- Frequência respiratória
- Frequência cardíaca
- Temperatura corporal
- Pressão arterial
- Nível de oxigenação sanguínea
- Alertas de risco clínico (moderado/crítico)

Este projeto é uma aplicação didática com fins educacionais e de demonstração em ambientes acadêmicos.

##  Tecnologias Utilizadas

- **Python 3.x**
- **Sockets TCP**
- **WebSockets**
- **HTML5 + JavaScript + Chart.js (Front-end gráfico)**

```

##  Como Clonar o Repositório

```bash
git clone [https://github.com/SeuUsuario/NovoRepositorio.git](https://github.com/Maducdornelles/WebSocket_Patient_Monitoring.git)
cd WebSocket_Patient_Monitoring
```

##  Instalação de Dependências (Backend)

Recomenda-se criar e ativar um ambiente virtual:

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Linux/Mac
# ou
venv\Scripts\activate          # Windows
```

Instale as dependências com:

```bash
pip install -r requirements.txt
```

##  Execução do Projeto

### 1. Iniciar o Servidor Central (Backend)

No terminal dentro da pasta `backend` e com o ambiente virtual ativado:

```bash
python servidor.py
```

### 2. Iniciar o Sensor Simulado (Backend)

Em outro terminal (também na pasta `backend`):

```bash
python sensor.py
```

### 3. Servir o Front-end Web (Frontend)

Para evitar problemas de segurança no navegador (restrições CORS), é recomendado usar um servidor HTTP simples.

No terminal, navegue até a pasta `frontend` e execute:

```bash
python -m http.server 8000
```

Abra o navegador e acesse:

```
http://localhost:8000/index.html
```

---

