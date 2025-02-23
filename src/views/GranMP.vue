<template>
    <div style="padding: 20px;">
        <h1 class="text-2xl font-bold mb-6">Método de la Gran M</h1>

        <!-- Descripción del problema -->
        <div class="mb-6">
            <label class="block font-bold mb-2">Ingrese Descripción del problema:</label>
            <textarea v-model="descripcionProblema" class="w-full p-2 border rounded" rows="4"
                placeholder="Describa el problema que desea resolver con el método gran M..."></textarea>
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

        <!-- Entradas dinámicas -->
        <div class="card text-center" v-if="showInputs">
            <div class="card-header">
                Variables y Restricciones
            </div>
            <div class="card-body">
                <h2 class="text-xl font-bold mb-4">Función Objetivo</h2>
                <div class="mb-6">
                    <span v-for="(coef, i) in objectiveFunction" :key="i" class="mr-2">
                        <input type="number" v-model.number="objectiveFunction[i]" class="p-1 border rounded"
                            style="width: 60px; text-align: center" />
                        x{{ i + 1 }} <span v-if="i < objectiveFunction.length - 1">+</span>
                    </span>
                </div>
                <h2 class="text-xl font-bold mb-4">Restricciones</h2>
                <div v-for="(row, i) in constraints" :key="i" class="mb-4">
                    <span v-for="(cell, j) in row" :key="j" class="mr-2">
                        <input type="number" v-model.number="constraints[i][j]" class="p-1 border rounded"
                            style="width: 60px; text-align: center" />
                        x{{ j + 1 }} <span v-if="j < numVariables - 1">+</span>
                    </span>
                    <select v-model="constraintTypes[i]" class="ml-2 p-1 border rounded" style="width: 60px;">
                        <option value="<=">≤</option>
                        <option value=">=">≥</option>
                        <option value="=">=</option>
                    </select>
                    <input type="number" v-model.number="b[i]" class="ml-2 p-1 border rounded"
                        style="width: 60px; text-align: center" />
                </div>
                <button @click="handleSolve" class="bg-green-500 text-white px-4 py-2 rounded">Resolver</button>
            </div>
        </div>
        <!-- Barra de Carga -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
            <p>Calculando...</p>
        </div>

        <!-- Resultados -->
        <div v-if="results" class="mt-6">
            <h2 class="text-xl font-bold mb-4">Resultados</h2>
            <p><strong>Descripción del problema:</strong> {{ problemDescription }}</p>
            <p>Solución óptima:</p>
            <ul>
                <li v-for="(value, index) in results.solution" :key="index">
                    {{ results.variable_names[index] }}: {{ value.toFixed(2) }}
                </li>
            </ul>
            <p>Valor óptimo: {{ results.optimal_value.toFixed(2) }}</p>

            <!-- Iteraciones del Método Gran M -->
            <h2 class="text-xl font-bold mt-6">Iteraciones</h2>
            <div v-if="results.steps.length">
                <div v-for="(step, stepIdx) in results.steps" :key="stepIdx" class="mt-4">
                    <h3 class="font-bold">Iteración {{ stepIdx + 1 }}</h3>
                    <div class="table-responsive">
                        <table class="table table-striped table-bordered table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th v-for="(name, idx) in results.variable_names" :key="idx" class="text-center">
                                        {{ name }}
                                    </th>
                                    <th>LD</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, rowIdx) in step" :key="rowIdx">
                                    <td v-for="(cell, cellIdx) in row" :key="cellIdx" class="text-center">
                                        {{ typeof cell === 'number' ? cell.toFixed(2) : cell }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <p v-else>No hay iteraciones disponibles.</p>

            <!-- Análisis de Sensibilidad -->
            <div class="border p-4 mt-6 rounded-lg shadow-lg bg-gray-100">
                <h3 class="text-lg font-bold mb-2">Análisis de Sensibilidad</h3>
                <h4 class="font-semibold">Coeficientes de la Función Objetivo:</h4>
                <div v-for="(coef, varName) in results.sensitivity_analysis.c_ranges" :key="varName" class="mb-2">
                    <p>
                        <strong>{{ varName }}:</strong> Valor actual: {{ coef.current_value.toFixed(2) }},
                        Límite inferior: {{ coef.lower_bound.toFixed(2) }},
                        Límite superior: {{ coef.upper_bound.toFixed(2) }},
                        Impacto: {{ coef.impact.toFixed(2) }}
                    </p>
                </div>

                <h4 class="font-semibold mt-4">Restricciones:</h4>
                <div v-for="(constraint, constraintName) in results.sensitivity_analysis.b_ranges" :key="constraintName"
                    class="mb-2">
                    <p>
                        <strong>{{ constraintName }}:</strong> Valor actual: {{ constraint.current_value.toFixed(2) }},
                        Límite inferior: {{ constraint.lower_bound.toFixed(2) }},
                        Límite superior: {{ constraint.upper_bound.toFixed(2) }},
                        Precio sombra: {{ constraint.shadow_price.toFixed(2) }}
                    </p>
                </div>
            </div>

            <!-- Interpretación con Gemini -->
            <div v-if="interpretacion" class="border p-4 mt-6 rounded-lg shadow-lg bg-gray-100">
                <h3 class="text-lg font-bold mb-2">Interpretación del Análisis de Sensibilidad</h3>
                <pre class="p-2 bg-white border rounded">{{ interpretacion }}</pre>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            descripcionProblema: "",
            numVariables: 2,
            numConstraints: 2,
            problemType: "max",
            showInputs: false,
            objectiveFunction: [],
            constraints: [],
            constraintTypes: [],
            b: [],
            interpretacion: "",
            results: null,
            isLoading: false, // Estado para la barra de carga
        };
    },
    methods: {
        handleGenerate() {
            this.showInputs = true;
            this.objectiveFunction = Array(this.numVariables).fill(0);
            this.constraints = Array.from({ length: this.numConstraints }, () => Array(this.numVariables).fill(0));
            this.constraintTypes = Array(this.numConstraints).fill("<=");
            this.b = Array(this.numConstraints).fill(0);
        },
        async handleSolve() {
            this.isLoading = true; // Activar la barra de carga
            try {
                // Verificar que los datos no estén vacíos
                if (!this.objectiveFunction.length || !this.constraints.length || !this.b.length) {
                    throw new Error("Por favor, ingrese todos los valores necesarios.");
                }

                // Crear el payload
                const payload = {
                    c: this.objectiveFunction.map(Number), // Convertir a números
                    A: this.constraints.map(row => row.map(Number)), // Convertir filas a números
                    b: this.b.map(Number),
                    constraint_types: this.constraintTypes,
                    problem_type: this.problemType,
                    problem_description: this.descripcionProblema,
                    M: 1e6, // Valor de M por defecto
                };

                console.log("📤 Enviando datos al backend:", payload); // Debugging en consola

                const response = await fetch(`${this.$apiBaseUrl}/bigm`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorResponse = await response.json();
                    throw new Error(errorResponse.error || `Error ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                console.log("📥 Respuesta del backend:", result); // Debugging en consola
                this.results = result;
                this.interpretacion = result.interpretation || "No se pudo generar el análisis de sensibilidad.";

                // Verificar si hay iteraciones
                if (!this.results.steps || !this.results.steps.length) {
                    console.warn("No hay iteraciones en la respuesta del backend.");
                }
            } catch (error) {
                console.error("🚨 Error al resolver:", error);
                this.errorMessage = error.message || "Ocurrió un error inesperado.";
                alert(this.errorMessage);
            } finally {
                this.isLoading = false; // Desactivar la barra de carga
            }
        },
    },
};
</script>

<style scoped>
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
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}

textarea {
    width: 100%;
    height: 100px;
    resize: none;
}

/* Estilo para la barra de carga */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.spinner {
    border: 4px solid #f3f3f3;
    /* Light grey */
    border-top: 4px solid #3498db;
    /* Blue */
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

.table-responsive {
    overflow-x: auto;
}

.table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
}

.table th,
.table td {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    text-align: center;
}

.table thead th {
    background-color: #343a40;
    color: white;
}

.table-striped tbody tr:nth-of-type(odd) {
    background-color: rgba(0, 0, 0, 0.05);
}

.table-bordered th,
.table-bordered td {
    border: 1px solid #dee2e6;
}

.table-hover tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.075);
}

/* Mejoras en las tablas: */

.overflow-x-auto {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

table {
    border-spacing: 0;
    width: 100%;
}

th,
td {
    white-space: nowrap;
    padding: 0.75rem;
    text-align: center;
}

.bg-green-200 {
    background-color: #c6f6d5;
}

.bg-blue-100 {
    background-color: #ebf8ff;
}

.hover\:bg-gray-50:hover {
    background-color: #f9fafb;
}
</style>