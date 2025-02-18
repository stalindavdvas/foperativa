<template>
  <div style="padding: 20px;">
    <h1 class="text-2xl font-bold mb-6">Método Dual</h1>

    <!-- Configuración inicial -->
    <div class="mb-6">
      <label class="block mb-2">
        Número de variables:
        <input
          type="number"
          v-model.number="numVariables"
          class="ml-2 p-1 border rounded"
          style="width: 80px; text-align: center"
        />
      </label>
      <label class="block mb-2">
        Número de restricciones:
        <input
          type="number"
          v-model.number="numConstraints"
          class="ml-2 p-1 border rounded"
          style="width: 80px; text-align: center"
        />
      </label>
      <label class="block mb-2">
        Tipo de problema:
        <select
          v-model="problemType"
          class="ml-2 p-1 border rounded"
          style="width: 120px;"
        >
          <option value="max">Maximizar</option>
          <option value="min">Minimizar</option>
        </select>
      </label>
      <button
        @click="handleGenerate"
        class="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generar
      </button>
    </div>

    <!-- Entradas dinámicas -->
    <div v-if="showInputs">
      <h2 class="text-xl font-bold mb-4">Función Objetivo</h2>
      <div class="mb-6">
        <span v-for="(coef, i) in objectiveFunction" :key="i" class="mr-2">
          <input
            type="number"
            v-model.number="objectiveFunction[i]"
            class="p-1 border rounded"
            style="width: 60px; text-align: center"
          />
          x{{ i + 1 }}
          <span v-if="i < objectiveFunction.length - 1">+</span>
        </span>
      </div>

      <h2 class="text-xl font-bold mb-4">Restricciones</h2>
      <div v-for="(row, i) in constraints" :key="i" class="mb-4">
        <span v-for="(cell, j) in row" :key="j" class="mr-2">
          <input
            type="number"
            v-model.number="constraints[i][j]"
            class="p-1 border rounded"
            style="width: 60px; text-align: center"
          />
          x{{ j + 1 }}
          <span v-if="j < numVariables - 1">+</span>
        </span>
        <select
          v-model="constraintTypes[i]"
          class="ml-2 p-1 border rounded"
          style="width: 60px;"
        >
          <option value="<=">≤</option>
          <option value=">=">≥</option>
          <option value="=">=</option>
        </select>
        <input
          type="number"
          v-model.number="b[i]"
          class="ml-2 p-1 border rounded"
          style="width: 60px; text-align: center"
        />
      </div>
      <button
        @click="handleSolve"
        class="bg-green-500 text-white px-4 py-2 rounded"
      >
        Resolver
      </button>
    </div>

    <!-- Resultados -->
    <div v-if="results" class="mt-6">
      <h2 class="text-xl font-bold mb-4">Resultados</h2>
      <p>Solución óptima:</p>
      <ul>
        <li v-for="(value, varName) in results.solution" :key="varName">
          {{ varName }}: {{ value.toFixed(2) }}
        </li>
      </ul>
      <p>Valor óptimo: {{ results.optimal_value.toFixed(2) }}</p>

      <!-- Iteraciones del Método Dual -->
      <h2 class="text-xl font-bold mt-6">Iteraciones</h2>
      <div v-if="results.steps && results.steps.length">
        <div v-for="(step, index) in results.steps" :key="index" class="mt-4">
          <h3 class="font-bold">Iteración {{ index + 1 }}</h3>
          <p><strong>Base:</strong> {{ step.base.join(", ") }}</p>
          <div class="table-responsive">
            <table class="table table-striped table-bordered table-hover">
              <thead class="table-dark">
                <tr>
                  <th v-for="(name, idx) in step.columnas" :key="idx" class="text-center">
                    {{ name }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in step.valores" :key="i">
                  <td v-for="(cell, j) in row" :key="j" class="text-center">
                    {{ cell.toFixed ? cell.toFixed(2) : cell }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p v-else>No hay iteraciones disponibles.</p>
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
      constraintTypes: [],
      b: [],
      results: null,
    };
  },
  methods: {
    handleGenerate() {
      this.showInputs = true;
      this.objectiveFunction = Array(this.numVariables).fill(0);
      this.constraints = Array.from({ length: this.numConstraints }, () =>
        Array(this.numVariables).fill(0)
      );
      this.constraintTypes = Array(this.numConstraints).fill("<=");
      this.b = Array(this.numConstraints).fill(0);
    },
    async handleSolve() {
      try {
        const response = await fetch("http://localhost:5000/dual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            c: this.objectiveFunction,
            A: this.constraints,
            b: this.b,
            constraint_types: this.constraintTypes,
            problem_type: this.problemType,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        this.results = result;

        // Verificar si hay iteraciones
        if (!this.results.steps || !this.results.steps.length) {
          console.warn("No hay iteraciones en la respuesta del backend.");
        }
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