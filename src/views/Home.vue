<template>
  <div class="home-container">
    <!-- Encabezado con animación -->
    <header class="header">
      <h1 class="title">Bienvenido a <span class="highlight">OptiCalc</span></h1>
      <p class="subtitle">Calculadora Web para metodos de optimizacion.</p>
    </header>

    <!-- Tarjetas de funcionalidades -->
    <section class="features-section">
      <div class="feature-card">
        <div class="icon-container">
          <i class="fas fa-truck-moving"></i>
        </div>
        <h3 class="feature-title">Métodos de Transporte</h3>
        <p class="feature-description">
          Optimiza la distribución de recursos minimizando costos y maximizando eficiencia.
        </p>
      </div>
      <div class="feature-card">
        <div class="icon-container">
          <i class="fas fa-project-diagram"></i>
        </div>
        <h3 class="feature-title">Programación Lineal</h3>
        <p class="feature-description">
          Resuelve problemas de optimización lineal con el método Simplex y otros algoritmos avanzados.
        </p>
      </div>
      <div class="feature-card">
        <div class="icon-container">
          <i class="fas fa-network-wired"></i>
        </div>
        <h3 class="feature-title">Redes</h3>
        <p class="feature-description">
          Analiza y optimiza redes de flujo, rutas críticas y más.
        </p>
      </div>
    </section>

    <!-- Pie de página -->
    <footer class="footer">
      <p class="footer-text">
        © 2024 OptiCalc.Stalin Vasco- Jefferson Llerena- Andres Paida- Josue Riofrio
      </p>
    </footer>
  </div>
</template>

<script>
export default {
  methods: {
    startExploring() {
      // Redirigir a la página de herramientas
      this.$router.push("/tools");
    },
  },
};
</script>

<style scoped>
/* Estilos generales */
.home-container {
  font-family: "Arial", sans-serif;
  color: #333;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  min-height: 100vh;
  padding: 20px;
}

/* Encabezado */
.header {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  border-radius: 15px;
  margin-bottom: 40px;
  animation: fadeIn 1.5s ease-in-out;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.highlight {
  color: #ffd700;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* Sección de introducción */
.intro-section {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  animation: slideIn 1s ease-in-out;
}

.intro-title {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #2575fc;
}

.intro-text {
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Tarjetas de funcionalidades */
.features-section {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  flex: 1 1 300px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.icon-container {
  font-size: 2.5rem;
  color: #2575fc;
  margin-bottom: 15px;
}

.feature-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.feature-description {
  font-size: 1rem;
  color: #666;
}

/* Llamado a la acción */
.cta-section {
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  border-radius: 15px;
  margin-bottom: 40px;
  animation: fadeIn 1.5s ease-in-out;
}

.cta-title {
  font-size: 2rem;
  margin-bottom: 10px;
}

.cta-text {
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.cta-button {
  background: #ffd700;
  color: #333;
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cta-button:hover {
  background: #ffc107;
}

/* Pie de página */
.footer {
  text-align: center;
  padding: 20px;
  background: #333;
  color: white;
  border-radius: 15px;
}

.footer-text {
  font-size: 0.9rem;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>