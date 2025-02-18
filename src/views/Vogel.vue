<template>
  <div style="padding: 20px;">
    <h1 class="text-2xl font-bold mb-6">Método de Vogel</h1>

    <!-- Configuración inicial -->
    <div class="mb-6">
      <label class="block mb-2">
        Número de orígenes:
        <input type="number" v-model.number="numOrigenes" class="ml-2 p-1 border rounded" style="width: 80px; text-align: center" />
      </label>
      <label class="block mb-2">
        Número de destinos:
        <input type="number" v-model.number="numDestinos" class="ml-2 p-1 border rounded" style="width: 80px; text-align: center" />
      </label>
      <button @click="handleGenerate" class="bg-blue-500 text-white px-4 py-2 rounded">Generar Tabla</button>
    </div>

    <!-- Entradas dinámicas -->
    <div v-if="showInputs">
      <h2 class="text-xl font-bold mb-4">Tabla de Transporte</h2>
      <div class="table-responsive">
        <table class="table table-bordered table-hover">
          <thead class="table-dark">
            <tr>
              <th></th>
              <th v-for="(destino, j) in nombresDestinos" :key="j">
                <input
                  type="text"
                  v-model="nombresDestinos[j]"
                  class="p-1 border rounded"
                  style="width: 120px; text-align: center"
                  placeholder="Destino"
                />
              </th>
              <th>Suministro</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(fila, i) in costos" :key="i">
              <th>
                <input
                  type="text"
                  v-model="nombresOrigenes[i]"
                  class="p-1 border rounded"
                  style="width: 120px; text-align: center"
                  placeholder="Origen"
                />
              </th>
              <td v-for="(celda, j) in fila" :key="j">
                <input
                  type="number"
                  v-model.number="costos[i][j]"
                  class="p-1 border rounded"
                  style="width: 80px; text-align: center"
                />
              </td>
              <td>
                <input
                  type="number"
                  v-model.number="suministros[i]"
                  class="p-1 border rounded"
                  style="width: 80px; text-align: center"
                />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Demanda</th>
              <td v-for="(demanda, j) in demandas" :key="j">
                <input
                  type="number"
                  v-model.number="demandas[j]"
                  class="p-1 border rounded"
                  style="width: 80px; text-align: center"
                />
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button @click="handleSolve" class="bg-green-500 text-white px-4 py-2 rounded">Resolver</button>
    </div>

    <!-- Resultados -->
    <div v-if="results" class="mt-6">
      <h2 class="text-xl font-bold mb-4">Resultados</h2>
      <div class="table-responsive">
        <table class="table table-bordered table-hover">
          <thead class="table-dark">
            <tr>
              <th></th>
              <th v-for="(destino, j) in nombresDestinos" :key="j">{{ destino || `Destino ${j + 1}` }}</th>
              <th>Suministro</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(fila, i) in results.asignaciones" :key="i">
              <th>{{ nombresOrigenes[i] || `Origen ${i + 1}` }}</th>
              <td v-for="(celda, j) in fila" :key="j">{{ celda }}</td>
              <td>{{ suministros[i] }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Demanda</th>
              <td v-for="(demanda, j) in demandas" :key="j">{{ demanda }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p><strong>Costo Total:</strong> {{ results.costo_total.toFixed(2) }}</p>

      <h3 class="text-lg font-bold mt-4">Penalizaciones</h3>
      <ul>
        <li v-for="(penalizacion, index) in results.penalizaciones" :key="index">
          <strong>Iteración {{ index + 1 }}:</strong>
          <ul>
            <li><strong>Filas:</strong> {{ penalizacion.fila }}</li>
            <li><strong>Columnas:</strong> {{ penalizacion.columna }}</li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      numOrigenes: 2,
      numDestinos: 2,
      showInputs: false,
      nombresOrigenes: [],
      nombresDestinos: [],
      costos: [],
      suministros: [],
      demandas: [],
      results: null,
    };
  },
  methods: {
    handleGenerate() {
      this.showInputs = true;
      this.nombresOrigenes = Array(this.numOrigenes).fill("");
      this.nombresDestinos = Array(this.numDestinos).fill("");
      this.costos = Array.from({ length: this.numOrigenes }, () =>
        Array(this.numDestinos).fill(0)
      );
      this.suministros = Array(this.numOrigenes).fill(0);
      this.demandas = Array(this.numDestinos).fill(0);
    },
    async handleSolve() {
      try {
        console.log("Datos enviados:", {
          costos: this.costos,
          suministros: this.suministros,
          demandas: this.demandas,
        });

        const response = await fetch("http://localhost:5000/vogel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            costos: this.costos,
            suministros: this.suministros,
            demandas: this.demandas,
          }),
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        const result = await response.json();

        // Calcular el costo total
        let costo_total = 0;
        for (let i = 0; i < this.numOrigenes; i++) {
          for (let j = 0; j < this.numDestinos; j++) {
            costo_total += result.resultado[i][j] * this.costos[i][j];
          }
        }

        this.results = {
          asignaciones: result.resultado,
          penalizaciones: result.penalizaciones,
          costo_total: costo_total,
        };
      } catch (error) {
        console.error("Error al resolver:", error);
        alert("Ocurrió un error al resolver el problema.");
      }
    },
  },
};
</script>

<style scoped>
/* Estilos adicionales */
.table-responsive {
  overflow-x: auto;
}
.table thead th {
  text-align: center;
  vertical-align: middle;
}
.table tbody td {
  text-align: center;
  vertical-align: middle;
}
.font-semibold {
  font-weight: bold;
}
button {
  background-color: #007bff;
}
</style>