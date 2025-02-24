<template>
    <div style="padding: 20px;">
        <h1 class="text-2xl font-bold mb-6">Método del Costo Mínimo</h1>

        <!-- Descripción del problema -->
        <div class="mb-6">
            <label class="block font-bold mb-2">Ingrese Descripción del problema:</label>
            <textarea v-model="descripcionProblema" class="w-full p-2 border rounded" rows="4"
                placeholder="Describa el problema que desea resolver con costo mínimo..."></textarea>
        </div>

        <!-- Configuración inicial -->
        <div class="mb-6">
            <label class="block mb-2">
                Número de orígenes:
                <input type="number" v-model.number="numOrigenes" class="ml-2 p-1 border rounded"
                    style="width: 80px; text-align: center" />
            </label>
            <label class="block mb-2">
                Número de destinos:
                <input type="number" v-model.number="numDestinos" class="ml-2 p-1 border rounded"
                    style="width: 80px; text-align: center" />
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
                                <input type="text" v-model="nombresDestinos[j]" class="p-1 border rounded"
                                    style="width: 120px; text-align: center" placeholder="Destino" />
                            </th>
                            <th>Suministro</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(fila, i) in costos" :key="i">
                            <th>
                                <input type="text" v-model="nombresOrigenes[i]" class="p-1 border rounded"
                                    style="width: 120px; text-align: center" placeholder="Origen" />
                            </th>
                            <td v-for="(celda, j) in fila" :key="j">
                                <input type="number" v-model.number="costos[i][j]" class="p-1 border rounded"
                                    style="width: 80px; text-align: center" />
                            </td>
                            <td>
                                <input type="number" v-model.number="suministros[i]" class="p-1 border rounded"
                                    style="width: 80px; text-align: center" />
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Demanda</th>
                            <td v-for="(demanda, j) in demandas" :key="j">
                                <input type="number" v-model.number="demandas[j]" class="p-1 border rounded"
                                    style="width: 80px; text-align: center" />
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <button @click="handleSolve" class="bg-green-500 text-white px-4 py-2 rounded mt-4">Resolver</button>
        </div>

        <!-- Barra de Carga -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
            <p>Calculando...</p>
        </div>

        <!-- Resultados -->
        <div v-if="results" class="mt-6">
            <h2 class="text-xl font-bold mb-4">Resultados</h2>
            <div class="table-responsive">
                <table class="table table-bordered table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th></th>
                            <th v-for="(destino, j) in nombresDestinos" :key="j">{{ destino || `Destino ${j + 1}` }}
                            </th>
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
            <!-- Resumen de Resultados -->
            <div class="bg-gray-100 p-4 rounded-lg mt-4">
                <p><strong>Costo Total:</strong> {{ results.costo_total.toFixed(2) }}</p>
                <p><strong>Prueba de Optimalidad:</strong> {{ results.es_optima ? 'Óptima' : 'No óptima' }}</p>
                <p><strong>Valores de U:</strong> {{ results.U }}</p>
                <p><strong>Valores de V:</strong> {{ results.V }}</p>
            </div>

            <!-- Interpretación Estilizada -->
            <div class="mt-6">
                <h3 class="text-lg font-bold mb-2">Interpretación</h3>
                <div class="interpretation-container bg-white p-4 rounded-lg shadow-md">
                    <div v-html="formatInterpretation(results.interpretation)"></div>
                </div>
            </div>
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
            isLoading: false, // Estado para la barra de carga
            descripcionProblema: "", // Descripción del problema
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
            this.isLoading = true; // Activar la barra de carga
            try {
                const response = await fetch(`${this.$apiBaseUrl}/costominimo`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        costos: this.costos,
                        suministros: this.suministros,
                        demandas: this.demandas,
                        nombresOrigenes: this.nombresOrigenes,
                        nombresDestinos: this.nombresDestinos,
                        descripcionProblema: this.descripcionProblema,
                    }),
                });
                if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
                const result = await response.json();
                // Calcular el costo total
                let costo_total = 0;
                for (let i = 0; i < this.numOrigenes; i++) {
                    for (let j = 0; j < this.numDestinos; j++) {
                        costo_total += result.solution[i][j] * this.costos[i][j];
                    }
                }
                // Actualizar los resultados
                this.results = {
                    asignaciones: result.solution,
                    costo_total: costo_total,
                    es_optima: result.es_optima,
                    U: result.U,
                    V: result.V,
                    interpretation: result.interpretation || "No se generó interpretación.",
                };
            } catch (error) {
                console.error("Error al resolver:", error);
                alert("Ocurrió un error al resolver el problema.");
            } finally {
                this.isLoading = false; // Desactivar la barra de carga
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

.animate-spin {
    animation: spin 1s linear infinite;
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

/* Títulos dentro de la interpretación */
.interpretation-container h4 {
    font-size: 1.1rem;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: #007bff;
}

/* Párrafos dentro de la interpretación */
.interpretation-container p {
    margin-bottom: 1rem;
}

/* Listas dentro de la interpretación */
.interpretation-container ul {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
}

.interpretation-container li {
    margin-bottom: 0.5rem;
}

/* Resaltado de valores importantes */
.interpretation-container strong {
    color: #d32f2f;
    /* Rojo oscuro */
}

/* Código o fórmulas matemáticas */
.interpretation-container code {
    background-color: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
    color: #1e88e5;
}
</style>