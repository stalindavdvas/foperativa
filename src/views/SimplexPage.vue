<template>
  <div style="padding: 20px;">
    <h1 class="text-2xl font-bold mb-6">Método Simplex</h1>

    <!-- Configuración inicial -->
    <div class="mb-6">
      <label class="block mb-2">
        Número de variables:
        <input
          type="number"
          v-model.number="numVariables"
          class="ml-2 p-1 border rounded"
          style="width: 80px; height: 30px; border-radius: 8px; text-align: center"
          min="1"
        />
      </label>
      <label class="block mb-2">
        Número de restricciones:
        <input
          type="number"
          v-model.number="numConstraints"
          class="ml-2 p-1 border rounded"
          style="width: 80px; height: 30px; border-radius: 8px; text-align: center"
          min="1"
        />
      </label>
      <label class="block mb-2">
        Tipo de problema:
        <select
          v-model="problemType"
          class="ml-2 p-1 border rounded"
          style="width: 120px; height: 30px; border-radius: 8px"
        >
          <option value="max">Maximizar</option>
          <option value="min">Minimizar</option>
        </select>
      </label>
      <button
        @click="handleGenerate"
        class="bg-blue-500 text-white px-4 py-2 rounded"
        style="border-radius: 8px; cursor: pointer"
      >
        Generar
      </button>
    </div>

    <!-- Entradas generadas dinámicamente -->
    <div v-if="showInputs" class="mb-6">
      <h2 class="text-xl font-bold mb-4">Función objetivo</h2>
      <div class="mb-6">
        <p class="font-semibold">
          Z =
          <span v-for="(coef, i) in objectiveFunction" :key="i" class="mr-2">
            <input
              type="number"
              v-model.number="objectiveFunction[i]"
              class="p-1 border rounded"
              style="width: 60px; height: 30px; border-radius: 8px; text-align: center"
            />
            x{{ i + 1 }}
            <span v-if="i < objectiveFunction.length - 1">+</span>
          </span>
        </p>
      </div>

      <h2 class="text-xl font-bold mb-4">Restricciones</h2>
      <div v-for="(row, i) in constraints" :key="i" class="mb-4">
        <p class="font-semibold">
          <span v-for="(cell, j) in row" :key="j" class="mr-2">
            <template v-if="j < numVariables">
              <input
                type="number"
                v-model.number="constraints[i][j]"
                class="p-1 border rounded"
                style="width: 60px; height: 30px; border-radius: 8px; text-align: center"
              />
              x{{ j + 1 }}
              <span v-if="j < numVariables - 1">+</span>
            </template>
            <template v-else>
              ≤
              <input
                type="number"
                v-model.number="constraints[i][j]"
                class="p-1 border rounded ml-2"
                style="width: 60px; height: 30px; border-radius: 8px; text-align: center"
              />
            </template>
          </span>
        </p>
      </div>

      <button
        @click="handleSolve"
        class="bg-green-500 text-white px-4 py-2 rounded"
        style="border-radius: 8px; cursor: pointer"
      >
        Resolver
      </button>
    </div>

    <!-- Resultados -->
    <div v-if="results" class="mt-6">
      <h2 class="text-xl font-bold mb-4">Resultados</h2>
      <p>Solución óptima:</p>
      <ul>
        <li v-for="(value, index) in results.solution" :key="index">
          {{ results.variable_names[index] }}: {{ value.toFixed(2) }}
        </li>
      </ul>
      <p>Valor óptimo: {{ results.optimal_value.toFixed(2) }}</p>

      <!-- Análisis de Sensibilidad -->
      <h3 class="text-lg font-bold mt-4">Análisis de Sensibilidad</h3>
      <pre>{{ interpretacion }}</pre>

      <!-- Mostrar las tablas intermedias -->
      <h3 class="text-lg font-bold mt-4">Pasos del Método Simplex</h3>
      <div v-for="(step, index) in results.steps" :key="index" class="mb-4">
        <h4 class="text-md font-semibold">Iteración {{ index + 1 }}</h4>
        <div class="table-responsive">
          <table class="table table-striped table-bordered table-hover">
            <thead class="table-dark">
              <tr>
                <th v-for="(name, idx) in results.variable_names" :key="idx" class="text-center">
                  {{ name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in step" :key="i">
                <td v-for="(cell, j) in row" :key="j" class="text-center">
                  {{ cell.toFixed ? cell.toFixed(2) : cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Mensaje de Error -->
    <div v-if="error" class="error">
      <p><strong>Error:</strong> {{ error }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      numVariables: 2,
      numConstraints: 2,
      problemType: "max",
      showInputs: false,
      objectiveFunction: [],
      constraints: [],
      results: null,
      interpretacion: "",
      error: null,
    };
  },
  methods: {
    handleGenerate() {
      this.showInputs = true;
      this.objectiveFunction = Array(this.numVariables).fill(0);
      this.constraints = Array.from({ length: this.numConstraints }, () =>
        Array(this.numVariables + 1).fill(0)
      );
    },
    async handleSolve() {
      // Validar que la función objetivo no contenga NaN
      if (this.objectiveFunction.some(isNaN)) {
        this.error = "La función objetivo contiene valores inválidos.";
        return;
      }
      // Validar que las restricciones no contengan NaN
      if (this.constraints.some((row) => row.some(isNaN))) {
        this.error = "Las restricciones contienen valores inválidos.";
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/simplex", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            c: this.objectiveFunction,
            A: this.constraints.map((row) => row.slice(0, -1)),
            b: this.constraints.map((row) => row[row.length - 1]),
            problem_type: this.problemType,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        this.results = result;

        // Interpretar el análisis de sensibilidad con Gemini
        await this.interpretarResultados(result.sensitivity_analysis);
      } catch (error) {
        console.error("Error al resolver el problema:", error);
        this.error =
          "Ocurrió un error al resolver el problema. Verifica los datos ingresados.";
      }
    },
    async interpretarResultados(sensitivity_analysis) {
      try {
        // Crear un mensaje para Gemini
        const mensaje = `
          Interpreta el siguiente análisis de sensibilidad:
          Rangos para los coeficientes de la función objetivo (c):
          ${JSON.stringify(sensitivity_analysis.c_ranges, null, 2)}
          Rangos para los términos independientes (b):
          ${JSON.stringify(sensitivity_analysis.b_ranges, null, 2)}
        `;

        // Enviar el mensaje a Gemini (reemplaza con tu API de Gemini)
        const geminiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCpzD4M30B2Yx6p8XwCBcDYzdoYxB-24p4", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: mensaje }),
        });

        const interpretationData = await geminiResponse.json();
        this.interpretacion = interpretationData.interpretation;
      } catch (error) {
        console.error("Error al interpretar resultados:", error);
        this.interpretacion = "No se pudo generar la interpretación.";
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
.error {
  color: red;
  font-weight: bold;
  margin-top: 20px;
}
</style>