<template>
  <div class="container">
    <h1>Flujo Máximo en una Red</h1>

    <!-- Contenedor para la red -->
    <div ref="network" class="network-container"></div>

    <!-- Botón para calcular el flujo máximo -->
    <button @click="calcularFlujoMaximo" class="btn-calculate">Calcular Flujo Máximo</button>

    <!-- Resultado -->
    <div v-if="resultado" class="result">
      <h2>Resultado</h2>
      <p><strong>Flujo Máximo:</strong> {{ resultado.max_flow }}</p>
      <p><strong>Aristas Utilizadas:</strong></p>
      <ul>
        <li v-for="(edge, index) in resultado.used_edges" :key="index">
          {{ edge.from }} → {{ edge.to }} (Capacidad: {{ edge.capacity }}, Flujo: {{ edge.flow }})
        </li>
      </ul>
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
    };
  },
  mounted() {
    this.inicializarRed();
  },
  methods: {
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
            // Permitir al usuario agregar aristas con capacidades
            const capacidad = prompt("Ingrese la capacidad de la arista:");
            if (capacidad && !isNaN(capacidad)) {
              data.id = `${data.from}-${data.to}`; // Asignar un ID único basado en los nodos conectados
              data.label = capacidad;
              data.value = parseFloat(capacidad);
              this.edges.push({
                id: data.id, // Guardar el ID único
                from: data.from, // Usar el nombre del nodo de origen
                to: data.to, // Usar el nombre del nodo de destino
                capacidad: parseFloat(capacidad),
              });
              callback(data);
            }
          },
        },
      };

      this.network = new Network(container, data, options); // Inicializar la red
    },
    async calcularFlujoMaximo() {
      this.error = null;
      this.resultado = null;

      // Validar que haya nodos y aristas
      if (this.nodes.size === 0 || this.edges.length === 0) {
        this.error = "Debe dibujar una red con nodos y aristas.";
        return;
      }

      // Obtener el nodo fuente y sumidero
      const fuente = prompt("Ingrese el nodo fuente:");
      const sumidero = prompt("Ingrese el nodo sumidero:");

      if (!this.nodes.has(fuente) || !this.nodes.has(sumidero)) {
        this.error = "Los nodos fuente y sumidero deben existir en la red.";
        return;
      }

      try {
        // Convertir los datos del frontend al formato del backend
        const graph = {};
        this.nodes.forEach((node) => {
          graph[node] = {};
        });

        this.edges.forEach((edge) => {
          graph[edge.from][edge.to] = edge.capacidad;
        });

        // Imprimir los datos antes de enviarlos
        console.log("Datos enviados al backend:", {
          graph: graph,
          source: fuente,
          sink: sumidero,
        });

        // Enviar la red al backend
        const response = await axios.post("http://localhost:5000/flujomaximo", {
          graph: graph,
          source: fuente,
          sink: sumidero,
        });

        // Mostrar el resultado
        this.resultado = response.data;

        // Resaltar las aristas utilizadas en el flujo máximo
        this.resaltarAristas(this.resultado.used_edges);
      } catch (error) {
        console.error("Error:", error);
        this.error =
          error.response?.data?.error ||
          "Ocurrió un error al calcular el flujo máximo. Verifique su conexión o intente más tarde.";
      }
    },
    resaltarAristas(used_edges) {
      // Limpiar estilos previos
      this.network.body.data.edges.forEach((edgeId) => {
        const edge = this.network.body.data.edges.get(edgeId);
        if (edge) {
          this.network.body.data.edges.update({
            id: edge.id,
            color: { color: "#000" }, // Restaurar color predeterminado
          });
        }
      });

      // Resaltar las aristas utilizadas en el flujo máximo
      used_edges.forEach((edge) => {
        const edge_obj = this.network.body.data.edges.get({
          filter: (e) => (e.from === edge.from && e.to === edge.to),
        })[0];

        if (edge_obj) {
          // Actualizar el color de la arista
          this.network.body.data.edges.update({
            id: edge_obj.id,
            color: { color: "blue" }, // Resaltar con color azul
          });
        }
      });
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
</style>