<template>
    <div class="container">
        <h1>Problema de la Mochila</h1>
        <div class="card">
            <div class="card-header">

            </div>
            <div class="card-body">
                <!-- Textarea para la descripción del problema -->
                <div class="description-input">
                    <label for="descripcionProblema">Descripción del Problema:</label>
                    <textarea id="descripcionProblema" v-model="descripcionProblema"
                        placeholder="Describe el contexto del problema..."></textarea>
                </div>
            </div>
        </div>


        <div class="card">
            <div class="card-header">
                Items
            </div>
            <div class="card-body">
                <!-- Formulario para agregar elementos -->
                <div class="form-container">
                    <h3>Agregar Elementos</h3>
                    <div v-for="(item, index) in items" :key="index" class="item-row">
                        <input type="text" v-model="item.nombre" placeholder="Nombre del producto" />
                        <input type="number" v-model="item.peso" placeholder="Peso" />
                        <input type="number" v-model="item.valor" placeholder="Valor" />
                        <input type="number" v-model="item.cantidad_maxima" placeholder="Cantidad Máxima" />
                        <button @click="eliminarElemento(index)" class="btn-delete">Eliminar</button>
                    </div>
                    <button @click="agregarElemento" class="btn-add">Agregar Elemento</button>
                </div>
            </div>
        </div>


        <!-- Entrada para la capacidad de la mochila -->
        <div class="capacity-input">
            <label for="capacity">Capacidad de la Mochila:</label>
            <input type="number" id="capacity" v-model="capacity" placeholder="Capacidad" />
            <br>
        </div>



        <!-- Botón para calcular la solución -->
        <button @click="calcularMochila" class="btn-calculate">Calcular Solución</button>

        <!-- Barra de carga -->
        <div v-if="loading" class="loading-overlay">
            <div class="spinner"></div>
            <p>Calculando la solución...</p>
        </div>

        <!-- Resultado -->
        <div v-if="resultado" class="result">
            <h2>Resultado</h2>
            <p><strong>Valor Máximo:</strong> {{ resultado.max_value }}</p>
            <p><strong>Elementos Seleccionados:</strong></p>
            <ul>
        <li v-for="(producto, nombre) in resultado.selected_items" :key="nombre">
          {{ nombre }} (Cantidad: {{ producto.cantidad }}, Peso Unitario: {{ producto.peso_unitario }}, Valor Unitario: {{ producto.valor_unitario }})
        </li>
      </ul>

            <!-- Interpretación Estilizada -->
            <div v-if="resultado && resultado.interpretation" class="mt-6">
                <h3 class="text-lg font-bold mb-2">Interpretación</h3>
                <div class="interpretation-container bg-white p-4 rounded-lg shadow-md">
                    <div v-html="formatInterpretation(resultado.interpretation)"></div>
                </div>
            </div>
            <div v-else-if="resultado">
                <p>No se generó ninguna interpretación.</p>
            </div>
        </div>

        <!-- Mensaje de Error -->
        <div v-if="error" class="error">
            <p><strong>Error:</strong> {{ error }}</p>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      items: [], // Lista de elementos con nombre, peso, valor y cantidad máxima
      capacity: null, // Capacidad de la mochila
      descripcionProblema: "", // Descripción del problema
      resultado: null, // Resultado del backend
      error: null, // Mensaje de error
      loading: false, // Estado de carga
    };
  },
  methods: {
    formatInterpretation(interpretation) {
      if (!interpretation) return "";
      // Reemplazar saltos de línea por etiquetas <br>
      let formatted = interpretation.replace(/\n/g, "<br>");
      // Resaltar palabras clave
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Negritas
      formatted = formatted.replace(/`([^`]*)`/g, '<code>$1</code>'); // Código
      return formatted;
    },
    agregarElemento() {
      this.items.push({ nombre: "", peso: null, valor: null, cantidad_maxima: null });
    },
    eliminarElemento(index) {
      this.items.splice(index, 1);
    },
    async calcularMochila() {
      this.error = null;
      this.resultado = null;
      this.loading = true; // Activar la barra de carga

      // Validar que haya elementos, capacidad y nombres válidos
      if (this.items.length === 0 || this.capacity === null) {
        this.error = "Debe ingresar al menos un elemento y la capacidad de la mochila.";
        this.loading = false; // Desactivar la barra de carga
        return;
      }

      try {
        // Convertir los datos del frontend al formato del backend
        const items_converted = this.items.map((item) => ({
          nombre: item.nombre || `Elemento ${this.items.indexOf(item) + 1}`,
          peso: parseFloat(item.peso),
          valor: parseFloat(item.valor),
          cantidad_maxima: parseInt(item.cantidad_maxima),
        }));

        // Imprimir los datos antes de enviarlos
        console.log("Datos enviados al backend:", {
          items: items_converted,
          capacity: this.capacity,
          descripcionProblema: this.descripcionProblema,
        });

        // Enviar los datos al backend
        const response = await axios.post(`${this.$apiBaseUrl}/mochila`, {
          items: items_converted,
          capacity: this.capacity,
          descripcionProblema: this.descripcionProblema,
        });

        // Mostrar el resultado
        this.resultado = response.data;
      } catch (error) {
        console.error("Error:", error);
        this.error =
          error.response?.data?.error ||
          "Ocurrió un error al calcular la solución. Verifique su conexión o intente más tarde.";
      } finally {
        this.loading = false; // Desactivar la barra de carga
      }
    },
  },
};
</script>

<style scoped>
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
}

.form-container {
    margin-top: 20px;
}

.item-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.item-row input {
    margin-right: 10px;
    padding: 5px;
    width: 150px;
}

.btn-add,
.btn-delete {
    padding: 5px 10px;
    cursor: pointer;
}

.btn-delete {
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 5px;
}

.btn-delete:hover {
    background-color: #c82333;
}

.capacity-input {
    margin-top: 20px;
}

.capacity-input label {
    margin-right: 10px;
}

.capacity-input input {
    padding: 5px;
    width: 200px;
}

.description-input {
    margin-top: 20px;
}

.description-input label {
    display: block;
    margin-bottom: 5px;
}

.description-input textarea {
    width: 100%;
    height: 100px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.btn-calculate {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s ease;
}

.btn-calculate:hover {
    background-color: #0056b3;
}

.result {
    margin-top: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.error {
    color: red;
    font-weight: bold;
    margin-top: 20px;
}

/* Estilo para la barra de carga */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Estilo para el contenedor de interpretación */
.interpretation-container {
    line-height: 1.6;
    font-size: 1rem;
    color: #333;
}

.interpretation-container h4 {
    font-size: 1.1rem;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: #007bff;
}

.interpretation-container p {
    margin-bottom: 1rem;
}

.interpretation-container ul {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
}

.interpretation-container li {
    margin-bottom: 0.5rem;
}

.interpretation-container strong {
    color: #d32f2f;
}

.interpretation-container code {
    background-color: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
    color: #1e88e5;
}
</style>