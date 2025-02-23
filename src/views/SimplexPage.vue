<template>
  <div style="padding: 20px;">
    <h1 class="text-2xl font-bold mb-6">Método Simplex</h1>
    <!-- Descripción del problema -->
    <div class="mb-6">
      <label class="block font-bold mb-2">Ingrese Descripción del problema:</label>
      <textarea v-model="descripcionProblema" class="w-full p-2 border rounded" rows="4"
        placeholder="Describa el problema que desea resolver con el método simplex..."></textarea>
    </div>

    <!-- Configuración inicial -->
    <div class="card">
      <div class="card-header">
        Variables y Restricciones
      </div>
      <div class="card-body">
        <div class="mb-6">
          <label class="block mb-2 bold">
            Número de variables:
            <input type="number" v-model.number="numVariables" class="ml-2 p-1 border rounded"
              style="width: 80px; height: 30px; border-radius: 8px; text-align: center" min="1" />
          </label>
          <label class="block mb-2">
            Número de restricciones:
            <input type="number" v-model.number="numConstraints" class="ml-2 p-1 border rounded"
              style="width: 80px; height: 30px; border-radius: 8px; text-align: center" min="1" />
          </label>
          <label class="block mb-2">
            Tipo de problema:
            <select v-model="problemType" class="ml-2 p-1 border rounded"
              style="width: 120px; height: 30px; border-radius: 8px">
              <option value="max">Maximizar</option>
              <option value="min">Minimizar</option>
            </select>
          </label>
          <button @click="handleGenerate" class="bg-blue-500 text-white px-4 py-2 rounded"
            style="border-radius: 8px; cursor: pointer">
            Generar
          </button>
        </div>

      </div>
    </div>

    <!-- Entradas generadas dinámicamente -->
    <div class="card">
      <div class="card-header">
        Sección de datos
      </div>
      <div class="card-body text-center">
        <div v-if="showInputs" class="mb-6">
          <h4 class="text-xl font-bold mb-4">Función objetivo</h4>
          <div class="mb-6">
            <p class="font-semibold">
              Z =
              <span v-for="(coef, i) in objectiveFunction" :key="i" class="mr-2">
                <input type="number" v-model.number="objectiveFunction[i]" class="p-1 border rounded"
                  style="width: 60px; height: 30px; border-radius: 8px; text-align: center" />
                x{{ i + 1 }}
                <span v-if="i < objectiveFunction.length - 1">+</span>
              </span>
            </p>
          </div>

          <h4 class="text-xl font-bold mb-4">Restricciones</h4>
          <div v-for="(row, i) in constraints" :key="i" class="mb-4">
            <p class="font-semibold">
              <span v-for="(cell, j) in row" :key="j" class="mr-2">
                <template v-if="j < numVariables">
                  <input type="number" v-model.number="constraints[i][j]" class="p-1 border rounded"
                    style="width: 60px; height: 30px; border-radius: 8px; text-align: center" />
                  x{{ j + 1 }}
                  <span v-if="j < numVariables - 1">+</span>
                </template>
                <template v-else>
                  ≤
                  <input type="number" v-model.number="constraints[i][j]" class="p-1 border rounded ml-2"
                    style="width: 60px; height: 30px; border-radius: 8px; text-align: center" />
                </template>
              </span>
            </p>
          </div>

          <button @click="handleSolve" class="bg-green-500 text-white px-4 py-2 rounded"
            style="border-radius: 8px; cursor: pointer">
            Resolver
          </button>
        </div>
      </div>
    </div>


    <!-- Resultados -->
    <div v-if="results" class="mt-6">
      <h3 class="text-xl font-bold mb-4">Resultados</h3>
      <p>Solución óptima:</p>
      <ul>
        <li v-for="(value, index) in results.solution" :key="index">
          {{ results.variable_names[index] }}: {{ value.toFixed(2) }}
        </li>
      </ul>
      <p>Valor óptimo: {{ results.optimal_value.toFixed(2) }}</p>



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
      <!-- Análisis de Sensibilidad -->
      <div class="border p-4 mt-6 rounded-lg shadow-lg bg-gray-100">
        <h3 class="text-lg font-bold mb-2">Análisis de Sensibilidad</h3>
        <pre class="p-2 bg-white border rounded">{{ interpretacion }}</pre>
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
            descripcionProblema: "",
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
                const response = await fetch(`${this.$apiBaseUrl}/simplex`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        c: this.objectiveFunction,
                        A: this.constraints.map((row) => row.slice(0, -1)),
                        b: this.constraints.map((row) => row[row.length - 1]),
                        problem_type: this.problemType,
                        problem_description: this.descripcionProblema,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                this.results = result;

                // Mostrar el análisis de sensibilidad
                this.interpretacion = result.interpretation || "No se pudo generar el análisis de sensibilidad.";
            } catch (error) {
                console.error("Error al resolver el problema:", error);
                this.error =
                    "Ocurrió un error al resolver el problema. Verifica los datos ingresados.";
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

.border {
  border: 2px solid #4a90e2;
}

.shadow-lg {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.bg-gray-100 {
  background-color: #f8f9fa;
}

textarea {
  width: 100%;
  height: 40%;
}
</style>