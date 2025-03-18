let intervalId;

document.getElementById('get-weather').addEventListener('click', function() {
    const city = document.getElementById('city').value;
    const apiKey = '9c1041ce1b68fd53fcb02cabc7d65fd0';  // Reemplaza con tu clave API real
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`;

    if (intervalId) {
        clearInterval(intervalId);
    }

    function fetchWeatherData() {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    document.getElementById('temperature').innerText = `${data.main.temp} °C`;
                    document.getElementById('humidity').innerText = `${data.main.humidity}%`;
                    document.getElementById('wind').innerText = `${data.wind.speed} m/s`;

                    const currentTime = new Date().toISOString();
                    const weatherData = {
                        ciudad: city,
                        temperatura: data.main.temp,
                        humedad: data.main.humidity,
                        viento: data.wind.speed,
                        fecha_hora: currentTime
                    };

                    fetch('http://localhost:3000/guardar-historial', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(weatherData)
                    }).then(response => response.text()).then(result => {
                        console.log(result);
                    });

                    updateWeatherChart(data.main.temp, currentTime);
                } else {
                    document.getElementById('data-output').innerHTML = `<p>Error: No se encontró la ciudad.</p>`;
                }
            })
            .catch(error => {
                document.getElementById('data-output').innerHTML = `<p>Error al conectar con la API.</p>`;
            });
    }

    fetchWeatherData();
    intervalId = setInterval(fetchWeatherData, 60000);

    const historicalData = getHistoricalData(city);
    historicalData.forEach(entry => {
        updateWeatherChart(entry.temperature, entry.time);
    });
});

const chartData = {
    labels: [],
    datasets: [{
        label: 'Temperatura',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false
    }]
};

function updateWeatherChart(temperature, time) {
    chartData.labels.push(new Date(time).toLocaleTimeString());
    chartData.datasets[0].data.push(temperature);
    weatherChart.update();
}

const ctx = document.getElementById('weather-chart').getContext('2d');
const weatherChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
