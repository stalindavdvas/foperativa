<template>
    <div style="padding: 20px;">
        <h1 class="text-2xl font-bold mb-6">Método de Dos Fases</h1>

        <!-- Descripción del problema -->
        <div class="mb-6">
            <label class="block font-bold mb-2">Ingrese Descripción del problema:</label>
            <textarea v-model="descripcionProblema" class="w-full p-2 border rounded" rows="4"
                placeholder="Describa el problema que desea resolver con el método de dos fases..."></textarea>
        </div>

        <!-- Configuración inicial -->
        <div class="card">
            <div class="card-header">
                Configuración Inicial
            </div>
            <div class="card-body">
                <div class="mb-6">
                    <label class="block mb-2">
                        Número de variables:
                        <input type="number" v-model.number="numVariables" class="ml-2 p-1 border rounded"
                            style="width: 80px; text-align: center" />
                    </label>
                    <label class="block mb-2">
                        Número de restricciones:
                        <input type="number" v-model.number="numConstraints" class="ml-2 p-1 border rounded"
                            style="width: 80px; text-align: center" />
                    </label>
                    <label class="block mb-2">
                        Tipo de problema:
                        <select v-model="problemType" class="ml-2 p-1 border rounded" style="width: 120px;">
                            <option value="max">Maximizar</option>
                            <option value="min">Minimizar</option>
                        </select>
                    </label>
                    <button @click="handleGenerate" class="bg-blue-500 text-white px-4 py-2 rounded">Generar</button>
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
        <div v-if="results" class="mt-6 border p-4 rounded-lg shadow-lg bg-white">
            <h2 class="text-xl font-bold mb-4">Resultados</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 class="font-bold mb-2">Variables de Decisión</h3>
                    <ul class="list-disc pl-5">
                        <li v-for="(value, index) in results.solution" :key="index" class="mb-1">
                            {{ results.variable_names[index] }}: {{ value.toFixed(2) }}
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-bold mb-2">Valor Óptimo</h3>
                    <p class="text-lg">{{ results.optimal_value.toFixed(2) }}</p>
                </div>
            </div>
        </div>

        <!-- Tablas de cada iteración -->
        <div v-if="results && results.steps" class="mt-6 border p-4 rounded-lg shadow-lg bg-white">
            <h2 class="text-xl font-bold mb-4">Proceso de Solución - Tablas Simplex</h2>

            <!-- Fase 1 -->
            <div v-if="results.steps.length > 0" class="mb-8">
                <h3 class="text-lg font-bold mb-3">Fase 1: Eliminación de Variables Artificiales</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full table-auto border-collapse border border-gray-300">
                        <thead>
                            <tr class="bg-blue-100">
                                <th class="border p-2">Base</th>
                                <th v-for="(name, idx) in results.variable_names" :key="idx" class="border p-2">
                                    {{ name }}
                                </th>
                                <th class="border p-2">LD</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, rowIdx) in results.steps[0]" :key="rowIdx" class="hover:bg-gray-50">
                                <td class="border p-2 font-semibold">
                                    {{ rowIdx === 0 ? 'Z' : `R${rowIdx}` }}
                                </td>
                                <td v-for="(cell, cellIdx) in row" :key="cellIdx" class="border p-2 text-center" :class="{
                                    'bg-green-200': isPivotElement(0, rowIdx, cellIdx),
                                    'font-bold': isPivotElement(0, rowIdx, cellIdx)
                                }">
                                    {{ typeof cell === 'number' ? cell.toFixed(2) : cell }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Fase 2 -->
            <div v-if="results.steps.length > 1" class="mb-8">
                <h3 class="text-lg font-bold mb-3">Fase 2: Optimización</h3>
                <div v-for="(step, stepIdx) in results.steps.slice(1)" :key="stepIdx" class="mb-6">
                    <h4 class="font-semibold mb-2">Iteración {{ stepIdx + 1 }}</h4>
                    <div class="overflow-x-auto">
                        <table class="min-w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr class="bg-blue-100">
                                    <th class="border p-2">Base</th>
                                    <th v-for="(name, idx) in results.variable_names" :key="idx" class="border p-2">
                                        {{ name }}
                                    </th>
                                    <th class="border p-2">LD</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, rowIdx) in step" :key="rowIdx" class="hover:bg-gray-50">
                                    <td class="border p-2 font-semibold">
                                        {{ rowIdx === 0 ? 'Z' : `R${rowIdx}` }}
                                    </td>
                                    <td v-for="(cell, cellIdx) in row" :key="cellIdx" class="border p-2 text-center"
                                        :class="{
                                            'bg-green-200': isPivotElement(stepIdx + 1, rowIdx, cellIdx),
                                            'font-bold': isPivotElement(stepIdx + 1, rowIdx, cellIdx)
                                        }">
                                        {{ typeof cell === 'number' ? cell.toFixed(2) : cell }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Análisis de Sensibilidad -->
        <div v-if="results && results.sensitivity_analysis" class="border p-4 mt-6 rounded-lg shadow-lg bg-gray-100">
            <h3 class="text-lg font-bold mb-2">Análisis de Sensibilidad</h3>
            <p><strong>Coeficientes de la Función Objetivo:</strong></p>
            <ul>
                <li v-for="(coef, varName) in results.sensitivity_analysis.objective_coefficients" :key="varName">
                    {{ varName }}:
                    <ul>
                        <li>Valor actual: {{ coef.current_value.toFixed(2) }}</li>
                        <li>Límite inferior: {{ coef.lower_bound.toFixed(2) }}</li>
                        <li>Límite superior: {{ coef.upper_bound.toFixed(2) }}</li>
                        <li>Impacto: {{ coef.impact.toFixed(2) }}</li>
                    </ul>
                </li>
            </ul>
            <p><strong>Restricciones:</strong></p>
            <ul>
                <li v-for="(constraint, constraintName) in results.sensitivity_analysis.rhs_values"
                    :key="constraintName">
                    {{ constraintName }}:
                    <ul>
                        <li>Valor actual: {{ constraint.current_value.toFixed(2) }}</li>
                        <li>Límite inferior: {{ constraint.lower_bound.toFixed(2) }}</li>
                        <li>Límite superior: {{ constraint.upper_bound.toFixed(2) }}</li>
                        <li>Precio sombra: {{ constraint.shadow_price.toFixed(2) }}</li>
                    </ul>
                </li>
            </ul>
        </div>

        <!-- Interpretación con Gemini -->
        <div v-if="interpretacion" class="border p-4 mt-6 rounded-lg shadow-lg bg-gray-100">
            <h3 class="text-lg font-bold mb-2">Interpretación del Análisis de Sensibilidad</h3>
            <pre class="p-2 bg-white border rounded">{{ interpretacion }}</pre>
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
            constraintTypes: [],
            b: [],
            results: null,
            steps: [],
            interpretacion: "",
            isLoading: false, // Estado para la barra de carga
            errorMessage: "" // Mensaje de error
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
            this.errorMessage = ""; // Limpiar errores previos
            try {
                this.isLoading = true; // Activar la barra de carga

                // Validación previa de los datos
                if (!this.objectiveFunction.length || !this.constraints.length || !this.b.length) {
                    throw new Error("Por favor, ingrese todos los valores necesarios.");
                }

                const payload = {
                    c: this.objectiveFunction.map(Number), // Asegurar que son números
                    A: this.constraints.map(row => row.map(Number)), // Convertir filas a números
                    b: this.b.map(Number),
                    constraint_types: this.constraintTypes,
                    problem_type: this.problemType,
                    problem_description: this.descripcionProblema
                };

                console.log("📤 Enviando datos al backend:", payload); // Debugging en consola

                const response = await fetch(`${this.$apiBaseUrl}/two-phase`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorResponse = await response.json();
                    throw new Error(errorResponse.error || `Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("📥 Respuesta del backend:", data); // Debugging en consola

                // Asignar los datos de la respuesta
                this.results = data;
                this.interpretacion = data.interpretation || "No se pudo generar el análisis de sensibilidad.";
            } catch (error) {
                console.error("🚨 Error al resolver:", error);
                this.errorMessage = error.message || "Ocurrió un error inesperado.";
                alert(this.errorMessage);
            } finally {
                this.isLoading = false; // Desactivar la barra de carga
            }
        },
        // Agregar nuevo método para identificar elementos pivote
        isPivotElement(stepIndex, rowIndex, colIndex) {
            if (!this.results || !this.results.pivot_elements) return false;
            const pivotElement = this.results.pivot_elements[stepIndex];
            return pivotElement &&
                pivotElement.row === rowIndex &&
                pivotElement.col === colIndex;
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