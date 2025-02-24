<template>
    <div class="container">
      <h1>Flujo de Costo Mínimo</h1>
  
      <!-- Contenedor para la red -->
      <div ref="network" class="network-container"></div>
  
      <!-- Botón para calcular el flujo de costo mínimo -->
      <button @click="calcularFlujoCostoMinimo" class="btn-calculate">Calcular Flujo de Costo Mínimo</button>
  
      <!-- Barra de carga -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Calculando el flujo de costo mínimo...</p>
      </div>
  
      <!-- Resultado -->
      <div v-if="resultado" class="result">
        <h2>Resultado</h2>
        <p><strong>Costo Total:</strong> {{ resultado.total_cost }}</p>
        <p><strong>Flujo Asignado:</strong></p>
        <ul>
          <li v-for="(edge, index) in resultado.flow_edges" :key="index">
            {{ edge.from }} → {{ edge.to }} (Flujo: {{ edge.flow }}, Costo: {{ edge.cost }})
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
  import { Network, DataSet } from "vis-network/standalone"; // Importar vis-network
  import axios from "axios";
  
  export default {
    data() {
      return {
        nodes: new Set(), // Conjunto de nodos
        edges: [], // Lista de aristas
        network: null, // Instancia de vis-network
        resultado: null, // Resultado del backend
        error: null, // Mensaje de error
        loading: false, // Estado de carga
      };
    },
    mounted() {
      this.inicializarRed();
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
      inicializarRed() {
        // Crear nodos y aristas iniciales
        const container = this.$refs.network;
        const data = {
          nodes: new DataSet([]), // Usar DataSet de vis-network
          edges: new DataSet([]), // Usar DataSet de vis-network
        };
        const options = {
          manipulation: {
            enabled: true,
            addNode: (data, callback) => {
              // Permitir al usuario agregar nodos
              const nombre = prompt("Ingrese el nombre del nodo:");
              if (nombre) {
                data.id = nombre; // Usar el nombre como ID del nodo
                data.label = nombre; // Mostrar el nombre como etiqueta
                this.nodes.add(nombre); // Agregar el nombre a la lista de nodos
                callback(data);
              }
            },
            addEdge: (data, callback) => {
              // Permitir al usuario agregar aristas con capacidades y costos
              const capacidad = prompt("Ingrese la capacidad de la arista:");
              const costo = prompt("Ingrese el costo de la arista:");
              if (capacidad && !isNaN(capacidad) && costo && !isNaN(costo)) {
                data.id = `${data.from}-${data.to}`; // Asignar un ID único basado en los nodos conectados
                data.label = `Cap: ${capacidad}, Costo: ${costo}`;
                data.value = parseFloat(capacidad);
                this.edges.push({
                  id: data.id, // Guardar el ID único
                  from: data.from, // Usar el nombre del nodo de origen
                  to: data.to, // Usar el nombre del nodo de destino
                  capacity: parseFloat(capacidad),
                  cost: parseFloat(costo),
                });
                callback(data);
              }
            },
          },
        };
        this.network = new Network(container, data, options); // Inicializar la red
      },
      async calcularFlujoCostoMinimo() {
        this.error = null;
        this.resultado = null;
        this.loading = true; // Activar la barra de carga
  
        // Validar que haya nodos y aristas
        if (this.nodes.size === 0 || this.edges.length === 0) {
          this.error = "Debe dibujar una red con nodos y aristas.";
          this.loading = false; // Desactivar la barra de carga
          return;
        }
  
        // Obtener el nodo fuente, sumidero y demandas
        const fuente = prompt("Ingrese el nodo fuente:");
        const sumidero = prompt("Ingrese el nodo sumidero:");
        const demandas = {};
        Array.from(this.nodes).forEach((node) => {
          const demanda = prompt(`Ingrese la demanda para el nodo ${node}:`);
          if (demanda && !isNaN(demanda)) {
            demandas[node] = parseFloat(demanda);
          } else {
            this.error = "Las demandas deben ser números válidos.";
            this.loading = false;
            return;
          }
        });
  
        if (!this.nodes.has(fuente) || !this.nodes.has(sumidero)) {
          this.error = "Los nodos fuente y sumidero deben existir en la red.";
          this.loading = false; // Desactivar la barra de carga
          return;
        }
  
        try {
          // Convertir los datos del frontend al formato del backend
          const graph = {};
          this.nodes.forEach((node) => {
            graph[node] = [];
          });
          this.edges.forEach((edge) => {
            graph[edge.from].push([edge.to, edge.capacity, edge.cost]);
          });
  
          // Imprimir los datos antes de enviarlos
          console.log("Datos enviados al backend:", {
            graph: graph,
            source: fuente,
            sink: sumidero,
            demands: demandas,
          });
  
          // Enviar la red al backend
          const response = await axios.post(`${this.$apiBaseUrl}/flujo-costominimo`, {
            graph: graph,
            source: fuente,
            sink: sumidero,
            demands: demandas,
          });
  
          // Mostrar el resultado
          this.resultado = response.data;
        } catch (error) {
          console.error("Error:", error);
          this.error =
            error.response?.data?.error ||
            "Ocurrió un error al calcular el flujo de costo mínimo. Verifique su conexión o intente más tarde.";
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
  
  .network-container {
    width: 100%;
    height: 400px;
    border: 1px solid #ccc;
    margin: 20px auto;
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